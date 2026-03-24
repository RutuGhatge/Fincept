from app.db.database import db
from app.services.market_data_service import MarketDataService
from bson import ObjectId
from typing import List, Dict, Any, Optional
from datetime import datetime

class PortfolioService:
    async def create_portfolio(self, user_id: str, name: str, holdings: List[Dict[str, Any]], currency: str = "USD") -> Dict[str, Any]:
        database = db.get_database()
        
        # Check if user already has a portfolio
        existing = await database["portfolios"].find_one({"user_id": user_id})
        
        merged_holdings_dict = {}
        if existing and "holdings" in existing:
            for h in existing["holdings"]:
                merged_holdings_dict[h["symbol"]] = h

        for h in holdings:
            symbol = h["symbol"]
            h["current_price"] = None
            h["last_updated"] = None
            h["market_value"] = None
            h["unrealized_pnl"] = None
            h["unrealized_pnl_percent"] = None
            
            live_price = None
            if "excel_current_price" in h.get("metadata", {}):
                live_price = h["metadata"]["excel_current_price"]
                
            if live_price is None:
                live_price = MarketDataService.get_current_price(symbol)
                
            if live_price is not None:
                h["current_price"] = live_price
                h["last_updated"] = datetime.utcnow()
                h["market_value"] = live_price * h["quantity"]
            else:
                # fallback to cost
                h["current_price"] = h["average_cost"]
                h["market_value"] = h["average_cost"] * h["quantity"]
            
            # Merge logic for duplicates
            if symbol in merged_holdings_dict:
                ext = merged_holdings_dict[symbol]
                old_q = ext.get("quantity", 0)
                old_c = ext.get("average_cost", 0)
                new_q = h["quantity"]
                new_c = h["average_cost"]
                
                total_q = old_q + new_q
                if total_q > 0:
                    avg_cost = ((old_q * old_c) + (new_q * new_c)) / total_q
                else:
                    avg_cost = 0
                
                ext["quantity"] = total_q
                ext["average_cost"] = avg_cost
                ext["current_price"] = h["current_price"]
                if h["last_updated"]:
                    ext["last_updated"] = h["last_updated"]
                ext["market_value"] = (ext["current_price"] or avg_cost) * total_q
            else:
                merged_holdings_dict[symbol] = h

        # Calculate totals
        total_value = 0.0
        total_invested = 0.0
        final_holdings = list(merged_holdings_dict.values())
        
        for h in final_holdings:
            val = h.get("market_value") or (h.get("average_cost", 0) * h.get("quantity", 0))
            inv = h.get("average_cost", 0) * h.get("quantity", 0)
            total_value += val
            total_invested += inv
            h["exchange"] = h.get("exchange")
            h["sector"] = h.get("sector")
            h["current_price"] = h.get("current_price")
            h["last_updated"] = h.get("last_updated")
            h["unrealized_pnl"] = h.get("unrealized_pnl")
            h["unrealized_pnl_percent"] = h.get("unrealized_pnl_percent")

        if existing:
            await database["portfolios"].update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "holdings": final_holdings,
                    "total_value": total_value,
                    "total_invested": total_invested,
                    "updated_at": datetime.utcnow()
                }}
            )
            existing["holdings"] = final_holdings
            existing["total_value"] = total_value
            existing["total_invested"] = total_invested
            existing["description"] = existing.get("description")
            existing["total_return"] = existing.get("total_return")
            existing["total_return_percent"] = existing.get("total_return_percent")
            existing["daily_change"] = existing.get("daily_change")
            existing["daily_change_percent"] = existing.get("daily_change_percent")
            existing["created_at"] = existing.get("created_at", datetime.utcnow())
            existing["metadata"] = existing.get("metadata", {})
            existing["id"] = str(existing["_id"])
            existing["_id"] = str(existing["_id"])
            return existing
        else:
            portfolio_doc = {
                "user_id": user_id,
                "name": name,
                "holdings": final_holdings,
                "total_value": total_value,
                "total_invested": total_invested,
                "currency": currency,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {},
                "description": None
            }
            res = await database["portfolios"].insert_one(portfolio_doc)
            portfolio_doc["_id"] = str(res.inserted_id)
            portfolio_doc["id"] = str(res.inserted_id)
            return portfolio_doc

    async def get_user_portfolios(self, user_id: str, skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
        database = db.get_database()
        cursor = database["portfolios"].find({"user_id": user_id}).skip(skip).limit(limit)
        results = []
        async for p in cursor:
            p["id"] = str(p["_id"])
            p["_id"] = str(p["_id"])
            p["holdings_count"] = len(p.get("holdings", []))
            results.append(p)
        return results
        
    async def get_portfolio(self, portfolio_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        database = db.get_database()
        p = await database["portfolios"].find_one({"_id": ObjectId(portfolio_id), "user_id": user_id})
        if p:
            p["id"] = str(p["_id"])
            p["_id"] = str(p["_id"])
        return p
