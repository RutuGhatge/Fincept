from typing import List, Dict, Any, Optional
from app.db.database import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.collection = "news"

    async def create_article(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store a news article in the database"""
        try:
            from app.db.database import get_db
            database = get_db()
            
            article_data["created_at"] = datetime.utcnow()
            result = await database[self.collection].insert_one(article_data)
            article_data["_id"] = str(result.inserted_id)
            return article_data
        except Exception as e:
            logger.error(f"Error creating article: {e}")
            return article_data

    async def get_latest_news(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch latest news from database"""
        # Placeholder
        return []
