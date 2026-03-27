#!/usr/bin/env python3
"""
Test script to verify news API fix works properly
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routers.news import get_et_rss_news

class MockDB:
    def __init__(self, has_cached_data=True):
        self.has_cached_data = has_cached_data
        self.market_news_data = {
            "user_id": "test_user",
            "news": [
                {
                    "title": "Test News 1",
                    "summary": "This is test news from database",
                    "category": "Markets",
                    "sentiment": "Neutral",
                    "time": "2 hours ago",
                    "source_url": "#",
                    "full_content": "Full content here",
                    "impact_reason": None
                },
                {
                    "title": "Test News 2", 
                    "summary": "Another test news",
                    "category": "Portfolio Alert",
                    "sentiment": "Positive",
                    "time": "1 hour ago",
                    "source_url": "#",
                    "full_content": "More content here",
                    "impact_reason": "This affects your portfolio"
                }
            ],
            "updated_at": "2026-03-27T10:30:00"
        }
    
    async def find_one(self, query):
        if query.get("user_id") == "test_user" and self.has_cached_data:
            return self.market_news_data
        return None
    
    async def update_one(self, query, update, upsert=False):
        pass

async def test_news_api():
    """Test the news API with different scenarios"""
    print("Testing news API fix...")
    
    # Test 1: Fresh cache available
    print("\n=== Test 1: Fresh Cache Available ===")
    try:
        result = await get_et_rss_news(
            user_id="test_user",
            symbols="AXIS FUND,HDFC FUND",
            force_refresh=False,
            db=MockDB(has_cached_data=True)
        )
        print(f"Success: {result}")
        print(f"News count: {result.get('count', 0)}")
        print(f"Source: {result.get('source', 'N/A')}")
        print(f"Status: {result.get('status', 'N/A')}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: No cache available
    print("\n=== Test 2: No Cache Available ===")
    try:
        result = await get_et_rss_news(
            user_id="no_cache_user",
            symbols="AXIS FUND,HDFC FUND",
            force_refresh=False,
            db=MockDB(has_cached_data=False)
        )
        print(f"Success: {result}")
        print(f"News count: {result.get('count', 0)}")
        print(f"Source: {result.get('source', 'N/A')}")
        print(f"Status: {result.get('status', 'N/A')}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n=== TEST COMPLETED ===")

if __name__ == "__main__":
    asyncio.run(test_news_api())
