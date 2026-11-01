from app.db.database import db
from app.services.market_data_service import MarketDataService
from bson import ObjectId
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PortfolioService:
    async def create_portfolio(self, user_id: str, name: str, holdings: List[Dict[str, Any]], currency: str = "USD", file_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        database = db.get_database()
        
        # Check if user already has a portfolio
        existing = await database["portfolios"].find_one({"user_id": user_id})
        
        files = []
        if existing:
            files = existing.get("files", [])
        
        if file_info:
            # Add new file to the list
            # holdings passed here are the ones from THIS file
            file_record = {
                "id": file_info.get("id") or str(ObjectId()),
                "filename": file_info.get("filename", "Unknown"),
                "upload_date": datetime.utcnow(),
                "holdings": holdings,
                "holdings_count": len(holdings)
            }
            files.append(file_record)
        elif not existing:
            # Initial creation without a specific file (manual or API)
            files = [{
                "id": str(ObjectId()),
                "filename": "Initial Import",
                "upload_date": datetime.utcnow(),
                "holdings": holdings,
                "holdings_count": len(holdings)
            }]

        # Re-calculate merged holdings from ALL files with live prices
        final_holdings, total_value, total_invested = await self._recalculate_merged_holdings(files, force_refresh=True)

        if existing:
            await database["portfolios"].update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "files": files,
                    "holdings": final_holdings,
                    "total_value": total_value,
                    "total_invested": total_invested,
                    "updated_at": datetime.utcnow()
                }}
            )
            existing["files"] = files
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
            return existing
        else:
            portfolio_doc = {
                "user_id": user_id,
                "name": name,
                "files": files,
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

    async def _recalculate_merged_holdings(self, files: List[Dict[str, Any]], force_refresh: bool = False):
        merged_dict = {}
        for f in files:
            for h in f.get("holdings", []):
                symbol = h["symbol"]
                file_price = h.get("current_price")
                
                # Always fetch live price on force_refresh, or if never fetched before
                # Also fetch if the current_price came from the file (not live data)
                if force_refresh or h.get("current_price") is None or not h.get("last_updated"):
                    live_price = MarketDataService.get_current_price(symbol)
                    logger.info(f"[{symbol}] File price: {file_price}, Live price: {live_price}, Force refresh: {force_refresh}")
                    if live_price and live_price > 0:
                        h["current_price"] = live_price
                        h["last_updated"] = datetime.utcnow().isoformat()
                        logger.info(f"[{symbol}] Using live price: {live_price}")
                    else:
                        # If live price fetch failed, use file price if available, else average_cost
                        if file_price and file_price > 0:
                            h["current_price"] = file_price
                            logger.info(f"[{symbol}] Live price failed, using file price: {file_price}")
                        else:
                            h["current_price"] = h.get("average_cost", 0)
                            logger.info(f"[{symbol}] Live price failed, no file price, using avg cost: {h.get('average_cost', 0)}")
                else:
                    logger.info(f"[{symbol}] Using existing price: {h.get('current_price')} (last_updated: {h.get('last_updated')})")

                if symbol in merged_dict:
                    ext = merged_dict[symbol]
                    old_q = ext.get("quantity", 0)
                    old_c = ext.get("average_cost", 0)
                    new_q = h["quantity"]
                    new_c = h["average_cost"]
                    
                    total_q = old_q + new_q
                    avg_cost = ((old_q * old_c) + (new_q * new_c)) / total_q if total_q > 0 else 0
                    
                    # Use the freshest price available
                    current_price = h.get("current_price") or ext.get("current_price") or avg_cost
                    ext["quantity"] = total_q
                    ext["average_cost"] = avg_cost
                    ext["current_price"] = current_price
                    ext["market_value"] = current_price * total_q
                    ext["last_updated"] = h.get("last_updated", ext.get("last_updated"))
                else:
                    current_price = h.get("current_price") or h.get("average_cost", 0)
                    h["market_value"] = current_price * h["quantity"]
                    merged_dict[symbol] = h.copy()

        final_holdings = list(merged_dict.values())
        total_value = sum(h.get("market_value", 0) for h in final_holdings)
        total_invested = sum(h["average_cost"] * h["quantity"] for h in final_holdings)
        
        logger.info(f"Total calculated - Value: {total_value}, Invested: {total_invested}, Holdings count: {len(final_holdings)}")
        for h in final_holdings:
            logger.info(f"  {h['symbol']}: qty={h['quantity']}, avg_cost={h['average_cost']}, current_price={h['current_price']}, market_value={h.get('market_value')}")
        
        return final_holdings, total_value, total_invested

    async def delete_portfolio_file(self, portfolio_id: str, file_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        database = db.get_database()
        portfolio = await database["portfolios"].find_one({"_id": ObjectId(portfolio_id), "user_id": user_id})
        if not portfolio:
            return None
        
        files = portfolio.get("files", [])
        new_files = [f for f in files if f.get("id") != file_id]
        
        if len(new_files) == len(files):
            return portfolio # No change
        
        final_holdings, total_value, total_invested = await self._recalculate_merged_holdings(new_files)
        
        await database["portfolios"].update_one(
            {"_id": portfolio["_id"]},
            {"$set": {
                "files": new_files,
                "holdings": final_holdings,
                "total_value": total_value,
                "total_invested": total_invested,
                "updated_at": datetime.utcnow()
            }}
        )
        
        portfolio["files"] = new_files
        portfolio["holdings"] = final_holdings
        portfolio["total_value"] = total_value
        portfolio["total_invested"] = total_invested
        portfolio["id"] = str(portfolio["_id"])
        return portfolio

    async def refresh_portfolio_prices(self, portfolio_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Force refresh all holding prices from live market data and persist to DB"""
        database = db.get_database()
        portfolio = await database["portfolios"].find_one({"_id": ObjectId(portfolio_id), "user_id": user_id})
        if not portfolio:
            return None
        
        files = portfolio.get("files", [])
        # Force refresh all prices
        final_holdings, total_value, total_invested = await self._recalculate_merged_holdings(files, force_refresh=True)
        
        await database["portfolios"].update_one(
            {"_id": portfolio["_id"]},
            {"$set": {
                "files": files,
                "holdings": final_holdings,
                "total_value": total_value,
                "total_invested": total_invested,
                "updated_at": datetime.utcnow()
            }}
        )
        
        portfolio["holdings"] = final_holdings
        portfolio["total_value"] = total_value
        portfolio["total_invested"] = total_invested
        portfolio["id"] = str(portfolio["_id"])
        return portfolio

    async def get_user_portfolios(self, user_id: str, skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
        database = db.get_database()
        cursor = database["portfolios"].find({"user_id": user_id}).skip(skip).limit(limit)
        results = []
        async for p in cursor:
            p["id"] = str(p["_id"])
            p["holdings_count"] = len(p.get("holdings", []))
            results.append(p)
        return results
        
    async def get_portfolio(self, portfolio_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        database = db.get_database()
        p = await database["portfolios"].find_one({"_id": ObjectId(portfolio_id), "user_id": user_id})
        if p:
            p["id"] = str(p["_id"])
            p.setdefault("files", [])
        return p

    async def delete_portfolio(self, portfolio_id: str, user_id: str) -> bool:
        database = db.get_database()
        result = await database["portfolios"].delete_one({
            "_id": ObjectId(portfolio_id),
            "user_id": user_id
        })
        return result.deleted_count > 0
