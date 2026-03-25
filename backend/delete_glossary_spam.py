import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def delete_glossary():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["investment_intelligence"]
    collection = db["jargon"]
    res = await collection.delete_many({"term": "glossary"})
    print(f"Deleted {res.deleted_count} docs.")
    client.close()

if __name__ == "__main__":
    asyncio.run(delete_glossary())
