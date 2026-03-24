import asyncio
import sys
sys.path.append('c:/Users/Rutu Mahesh Ghatge/OneDrive/Desktop/Projects/Investment_Intelligence/backend')

from app.db.database import db

async def run():
    await db.connect()
    database = db.get_database()
    user = await database["users"].find_one({"email": "portfolio_tester@example.com"})
    if user:
        p = await database["portfolios"].find_one({"user_id": str(user["_id"])})
        if p:
             with open("zerodha_verify_output.txt", "w") as out:
                 out.write(f"Holdings Count: {len(p.get('holdings', []))}\n\n")
                 for h in p.get('holdings', []):
                     symbol = h.get('symbol')
                     asset_type = h.get('asset_type')
                     avg_cost = h.get('average_cost')
                     curr_price = h.get('current_price')
                     market_val = h.get('market_value')
                     out.write(f"Symbol: {symbol}\n")
                     out.write(f" - Asset Type: {asset_type}\n")
                     out.write(f" - Avg Cost: {avg_cost}\n")
                     out.write(f" - Curr Price: {curr_price}\n")
                     out.write(f" - Market Value: {market_val}\n\n")
             print("Verified and written to zerodha_verify_output.txt")
        else:
             print("No portfolio found")
    else:
        print("No user found")

asyncio.run(run())
