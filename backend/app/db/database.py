from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.config.settings import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            self.database = self.client[settings.DATABASE_NAME]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB at {settings.MONGODB_URL}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    def get_database(self):
        """Get database instance"""
        if not self.database:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.database

    def get_collection(self, name: str):
        """Get a collection by name"""
        db = self.get_database()
        return db[name]


# Create a singleton instance
db = Database()


async def get_db():
    """Dependency to get database instance"""
    return db.get_database()
