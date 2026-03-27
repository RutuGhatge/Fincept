#!/usr/bin/env python3
"""
Direct test of news API to debug the issue
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routers.news import _fetch_rss_items, _gemini_process_news

async def test_news_components():
    print("=== Testing RSS Fetch ===")
    try:
        # Test RSS fetching
        raw_items = await asyncio.get_event_loop().run_in_executor(None, _fetch_rss_items, 10)
        print(f"✅ RSS fetch returned {len(raw_items)} items")
        
        if raw_items:
            print(f"✅ First item: {raw_items[0].get('title', 'No title')[:50]}...")
        else:
            print("❌ No RSS items fetched")
            return
            
    except Exception as e:
        print(f"❌ RSS fetch error: {e}")
        return
    
    print("\n=== Testing Gemini Processing ===")
    try:
        # Test Gemini processing
        symbols = ["AXIS LARGE & MID CAP FUND", "HDFC BANKING AND PSU DEBT FUND"]
        processed = await _gemini_process_news(raw_items, symbols)
        print(f"✅ Gemini processing returned {len(processed)} items")
        
        if processed:
            print(f"✅ First processed item: {processed[0].get('title', 'No title')[:50]}...")
            print(f"✅ Has impact_reason: {bool(processed[0].get('impact_reason'))}")
        else:
            print("❌ No processed items returned")
            
    except Exception as e:
        print(f"❌ Gemini processing error: {e}")
    
    print("\n=== TEST COMPLETED ===")

if __name__ == "__main__":
    asyncio.run(test_news_components())
