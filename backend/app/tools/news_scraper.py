from typing import List, Dict, Any, Optional
import feedparser
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class NewsScraper:
    def __init__(self):
        self.rss_url = "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"

    async def fetch_news(self, category: str = "market_news", limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch news articles using Economic Times RSS feed"""
        try:
            logger.info(f"Fetching news from ET RSS: {self.rss_url}")
            # feedparser.parse is blocking, but for small feeds it's usually fine.
            # In a production app, we might wrap it in run_in_executor.
            feed = feedparser.parse(self.rss_url)
            
            formatted_news = []
            for entry in feed.entries[:limit]:
                # ET RSS entries usually have: title, link, published, summary
                formatted_news.append({
                    "title": entry.get("title"),
                    "link": entry.get("link"),
                    "publisher": "Economic Times",
                    "provider_publish_time": entry.get("published"),
                    "summary": entry.get("summary", ""),
                    "type": "STORY",
                    "category": category,
                    "published_parsed": entry.get("published_parsed")
                })
            
            return formatted_news
        except Exception as e:
            logger.error(f"Error fetching news from RSS: {e}")
            return []
