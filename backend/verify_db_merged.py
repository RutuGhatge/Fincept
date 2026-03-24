import asyncio
import sys
sys.path.append('c:/Users/Rutu Mahesh Ghatge/OneDrive/Desktop/Projects/Investment_Intelligence/backend')
from app.db.database import db

async def verify():
    await db.connect()
    database = db.get_database()
    # Find the tester user
    user = await database["users"].find_one({"email": "portfolio_tester@example.com"})
    if not user:
        print("User not found.")
        return
    user_id = str(user["_id"])
    print(f"Found user_id: {user_id}")
    
    portfolio = await database["portfolios"].find_one({"user_id": user_id})
    if not portfolio:
         print("No portfolio found for this user.")
         return
         
    print(f"\n--- Portfolio: {portfolio.get('name')} ---")
    print(f"Holdings Count: {len(portfolio.get('holdings', []))}")
    symbols = [h["symbol"] for h in portfolio.get("holdings", [])]
    print(f"Symbols present: {symbols}")
    print(f"Total Invested: {portfolio.get('total_invested')}")
    print(f"Total Value: {portfolio.get('total_value')}")

asyncio.run(verify())
