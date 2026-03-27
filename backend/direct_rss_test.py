#!/usr/bin/env python3
"""
Direct RSS test to bypass all caching and force fresh fetch
"""
import urllib.request
import xml.etree.ElementTree as ET
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_direct_rss():
    """Test RSS fetching directly without any backend logic"""
    print("=== DIRECT RSS TEST ===")
    
    urls = [
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/1977021501.cms",
        "https://feeds.bbci.co.uk/news/business/rss.xml",
    ]
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    for i, url in enumerate(urls):
        print(f"\n--- Testing URL {i+1}: {url} ---")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                xml_data = resp.read().decode('utf-8', errors='ignore')
                print(f"✅ SUCCESS: {len(xml_data)} bytes received")
                
                root = ET.fromstring(xml_data)
                items = list(root.iter("item"))
                print(f"✅ Found {len(items)} RSS items")
                
                if items:
                    first_item = items[0]
                    title = first_item.findtext("title", "").strip()
                    desc = first_item.findtext("description", "").strip()[:100]
                    pub_date = first_item.findtext("pubDate", "").strip()
                    print(f"✅ Sample: {title[:50]}...")
                    print(f"✅ Date: {pub_date}")
                    print(f"✅ Description: {desc}...")
                    
        except Exception as e:
            print(f"❌ FAILED: {e}")
            print(f"   Type: {type(e).__name__}")
    
    print("\n=== TEST COMPLETE ===")

if __name__ == "__main__":
    test_direct_rss()
