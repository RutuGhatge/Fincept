import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_glossary():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["investment_intelligence"]
    collection = db["jargon"]
    docs = await collection.find({"term": "glossary"}).to_list(length=100)
    print(f"Glossary docs: {docs}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_glossary())
