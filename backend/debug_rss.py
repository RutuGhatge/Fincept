#!/usr/bin/env python3
"""
Quick test to debug RSS fetching issues
"""
import asyncio
import sys
import os
import urllib.request
import xml.etree.ElementTree as ET

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_rss_fetch():
    """Test RSS fetching directly"""
    print("Testing RSS fetching...")
    
    ET_RSS_URLS = [
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",  # Markets
        "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/1977021501.cms",
    ]
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
    
    for i, url in enumerate(ET_RSS_URLS):
        print(f"\n=== Testing URL {i+1}: {url} ===")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                xml_data = resp.read().decode('utf-8', errors='ignore')
                print(f"Response length: {len(xml_data)} characters")
                
                root = ET.fromstring(xml_data)
                items = list(root.iter("item"))
                print(f"Found {len(items)} items")
                
                if items:
                    first_item = items[0]
                    title = first_item.findtext("title", "").strip()
                    desc = first_item.findtext("description", "").strip()[:100]
                    print(f"First item: {title}")
                    print(f"Description: {desc}...")
                    
        except Exception as e:
            print(f"ERROR: {e}")
    
    print("\n=== RSS TEST COMPLETED ===")

if __name__ == "__main__":
    test_rss_fetch()
