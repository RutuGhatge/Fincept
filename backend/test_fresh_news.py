#!/usr/bin/env python3
"""
Test endpoint to bypass cache and force fresh news
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routers.news import _fetch_rss_items, _gemini_process_news

async def test_fresh_news():
    """Test fresh news fetching bypassing all cache"""
    print("=== FRESH NEWS TEST (BYPASSING CACHE) ===")
    
    try:
        print("1. Testing RSS fetch...")
        raw_items = _fetch_rss_items(20)
        print(f"✅ RSS fetch returned {len(raw_items)} items")
        
        if raw_items:
            print(f"✅ First item: {raw_items[0].get('title', 'No title')[:50]}...")
            print(f"✅ Items have titles: {all(bool(item.get('title')) for item in raw_items)}")
        
        print("\n2. Testing Gemini processing...")
        symbols = ["AXIS LARGE & MID CAP FUND", "HDFC BANKING AND PSU DEBT FUND"]
        processed = await _gemini_process_news(raw_items, symbols)
        print(f"✅ Gemini processing returned {len(processed)} items")
        
        if processed:
            print(f"✅ First processed item: {processed[0].get('title', 'No title')[:50]}...")
            print(f"✅ Has required fields: {all(key in processed[0] for key in ['title', 'summary', 'category'])}")
        
        print(f"\n✅ SUCCESS: Got {len(processed)} fresh news items")
        return processed
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    result = asyncio.run(test_fresh_news())
    print(f"\nFinal result: {len(result)} items")
