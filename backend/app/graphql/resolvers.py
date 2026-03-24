import strawberry
from typing import List
from app.db.database import db
from app.graphql.types import PortfolioType, HoldingType

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

