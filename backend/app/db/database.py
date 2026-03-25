from motor.motor_asyncio import AsyncIOMotorClient
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
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
        if self.database is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.database

    def get_collection(self, name: str):
        """Get a collection by name"""
        db = self.get_database()
        return db[name]


# Create a singleton instance
db = Database()

# Legacy / Compatibility helpers
async def connect_to_mongo():
    await db.connect()

async def close_mongo_connection():
    await db.disconnect()

def get_db():
    return db.get_database()

