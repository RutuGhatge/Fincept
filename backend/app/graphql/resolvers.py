import strawberry
from typing import List, Any, Optional
from app.db.database import db
from app.graphql.types import PortfolioType, HoldingType, NewsItemType, GlossaryItemType, AnalysisResultType
from app.agents.orchestrator import orchestrator

@strawberry.type
class Query:
    @strawberry.field
    async def get_portfolios(self, user_id: str) -> List[PortfolioType]:
        database = db.get_database()
        portfolios = await database["portfolios"].find({"user_id": user_id, "is_active": True}).to_list(length=100)
        
        result = []
        for p in portfolios:
            holdings = []
            for h in p.get("holdings", []):
                holdings.append(HoldingType(
                    symbol=h.get("symbol", ""),
                    name=h.get("name", ""),
                    asset_type=h.get("asset_type", "STOCK"),
                    quantity=h.get("quantity", 0.0),
                    average_cost=h.get("average_cost", 0.0),
                    current_price=h.get("current_price"),
                    currency=h.get("currency", "USD"),
                    market_value=h.get("market_value")
                ))
                
            result.append(PortfolioType(
                id=str(p["_id"]),
                user_id=p["user_id"],
                name=p["name"],
                description=p.get("description"),
                holdings=holdings,
                total_value=p.get("total_value"),
                total_invested=p.get("total_invested"),
                currency=p.get("currency", "USD"),
                is_active=p.get("is_active", True),
                updated_at=p.get("updated_at").isoformat() if p.get("updated_at") else None,
                created_at=p.get("created_at").isoformat() if p.get("created_at") else None
            ))
            
        return result
        
    @strawberry.field
    async def get_portfolio(self, portfolio_id: str) -> PortfolioType:
        from bson import ObjectId
        database = db.get_database()
        p = await database["portfolios"].find_one({"_id": ObjectId(portfolio_id)})
        if not p:
            raise Exception("Portfolio not found")
            
        holdings = []
        for h in p.get("holdings", []):
            holdings.append(HoldingType(
                symbol=h.get("symbol", ""),
                name=h.get("name", ""),
                asset_type=h.get("asset_type", "STOCK"),
                quantity=h.get("quantity", 0.0),
                average_cost=h.get("average_cost", 0.0),
                current_price=h.get("current_price"),
                currency=h.get("currency", "USD"),
                market_value=h.get("market_value")
            ))
            
        return PortfolioType(
            id=str(p["_id"]),
            user_id=p["user_id"],
            name=p["name"],
            description=p.get("description"),
            holdings=holdings,
            total_value=p.get("total_value"),
            total_invested=p.get("total_invested"),
            currency=p.get("currency", "USD"),
            is_active=p.get("is_active", True),
            updated_at=p.get("updated_at").isoformat() if p.get("updated_at") else None,
            created_at=p.get("created_at").isoformat() if p.get("created_at") else None
        )

    @strawberry.field
    async def get_news(self, symbol: Optional[str] = None) -> List[NewsItemType]:
        task = {"type": "fetch_news", "data": {"symbol": symbol}}
        result = await orchestrator.distribute_task("NewsAgent", task)
        news_items = []
        if isinstance(result, list):
            for item in result:
                news_items.append(NewsItemType(
                    category=item.get("category", "General"),
                    title=item.get("title", ""),
                    summary=item.get("summary", ""),
                    sentiment=item.get("sentiment", "Neutral"),
                    time=item.get("time", "recent")
                ))
        return news_items

    @strawberry.field
    async def get_glossary(self, skip: int = 0, limit: int = 20) -> List[GlossaryItemType]:
        from app.db.database import db as database_helper
        database = database_helper.get_database()
        collection = database["jargon"]
        cursor = collection.find({}).sort("term", 1).skip(skip).limit(limit)
        glossary = await cursor.to_list(length=limit)
        
        result = []
        for item in glossary:
            result.append(GlossaryItemType(
                id=str(item["_id"]),
                term=item.get("term", ""),
                short=item.get("short", item.get("definition", "")[:100] + "..."),
                long=item.get("long", item.get("definition", "")),
                category=item.get("category", "General"),
                example=item.get("example")
            ))
        return result

    @strawberry.field
    async def explain_term(self, term: str) -> GlossaryItemType:
        task = {"type": "explain_term", "data": {"term": term}}
        result = await orchestrator.distribute_task("JargonAgent", task)
        if not result:
            raise Exception("Term not found")
        return GlossaryItemType(
            term=result.get("term", term),
            short=result.get("short", result.get("explanation", "")[:100] + "..."),
            long=result.get("long", result.get("explanation", "")),
            category=result.get("category", "General"),
            example=result.get("example")
        )

@strawberry.type
class AuthPayload:
    access_token: str
    user_id: str
    message: str

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def register(self, name: str, email: str, password: str) -> AuthPayload:
        from app.utils.auth import get_password_hash
        database = db.get_database()
        
        # Check if user exists
        existing_user = await database["users"].find_one({"email": email})
        if existing_user is not None:
            raise Exception("Email already registered")
            
        hashed_password = get_password_hash(password)
        user_dict = {
            "name": name,
            "email": email,
            "hashed_password": hashed_password,
            "is_active": True
        }
        res = await database["users"].insert_one(user_dict)
        return AuthPayload(access_token="", user_id=str(res.inserted_id), message="Registration Successful. Please Login.")

    @strawberry.mutation
    async def login(self, email: str, password: str) -> AuthPayload:
        from app.utils.auth import verify_password, create_access_token
        database = db.get_database()
        
        user = await database["users"].find_one({"email": email})
        if user is None or not verify_password(password, user["hashed_password"]):
            raise Exception("Invalid credentials")
            
        access_token = create_access_token(
            data={"sub": user["email"], "user_id": str(user["_id"])}
        )
        return AuthPayload(access_token=access_token, user_id=str(user["_id"]), message="Login Successful")

    @strawberry.mutation
    async def analyze_portfolio(self, data: strawberry.scalars.JSON) -> AnalysisResultType:
        task = {"type": "analyze_performance", "data": data}
        result = await orchestrator.distribute_task("AnalysisAgent", task)
        return AnalysisResultType(
            success=result.get("success", False),
            summary=result.get("summary"),
            data=result.get("data"),
            metadata=result.get("metadata")
        )

    @strawberry.mutation
    async def assess_risk(self, data: strawberry.scalars.JSON) -> AnalysisResultType:
        task = {"type": "assess_risk", "data": data}
        result = await orchestrator.distribute_task("AnalysisAgent", task)
        return AnalysisResultType(
            success=result.get("success", False),
            summary=result.get("summary"),
            data=result.get("data"),
            metadata=result.get("metadata")
        )

    @strawberry.mutation
    async def get_recommendations(
        self, 
        portfolio_id: str, 
        user_id: str,
        recommendation_type: str = "comprehensive",
        risk_tolerance: str = "medium",
        investment_horizon: str = "medium-term"
    ) -> AnalysisResultType:
        request_data = {
            "intent": "comprehensive",
            "data": {
                "portfolio_id": portfolio_id,
                "recommendation_type": recommendation_type,
                "risk_tolerance": risk_tolerance,
                "investment_horizon": investment_horizon
            }
        }
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        return AnalysisResultType(
            success=result.get("success", False),
            summary=result.get("summary"),
            data=result.get("data"),
            metadata=result.get("metadata")
        )

