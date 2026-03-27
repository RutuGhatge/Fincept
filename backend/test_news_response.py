#!/usr/bin/env python3
"""
Test the exact news API response structure
"""
import asyncio
import sys
import os
import json

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routers.news import get_et_rss_news

class MockDB:
    def __init__(self):
        self.has_cached_data = False
    
    async def find_one(self, query):
        return None  # No cache for testing
    
    async def update_one(self, query, update, upsert=False):
        pass

async def test_news_response():
    """Test the exact response structure"""
    print("=== Testing News API Response Structure ===")
    
    try:
        result = await get_et_rss_news(
            user_id="test_user",
            symbols="AXIS LARGE & MID CAP FUND,HDFC BANKING AND PSU DEBT FUND",
            force_refresh=False,
            db=MockDB()
        )
        
        print("Response type:", type(result))
        print("Response keys:", list(result.keys()) if isinstance(result, dict) else "Not a dict")
        
        if isinstance(result, dict):
            print("News field:", result.get('news', 'NOT FOUND'))
            print("News type:", type(result.get('news')))
            print("News length:", len(result.get('news', [])))
            print("Count field:", result.get('count'))
            print("Source field:", result.get('source'))
            print("Status field:", result.get('status'))
            
            # Show first news item structure
            news_items = result.get('news', [])
            if news_items:
                print("First news item keys:", list(news_items[0].keys()) if isinstance(news_items[0], dict) else "Not a dict")
                print("First news item:", json.dumps(news_items[0], indent=2)[:500] + "...")
        
        print("\n=== Full Response ===")
        print(json.dumps(result, indent=2, default=str))
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_news_response())
