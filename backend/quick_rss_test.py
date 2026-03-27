#!/usr/bin/env python3
"""
Quick RSS test to debug news fetching
"""
import urllib.request
import xml.etree.ElementTree as ET

def test_rss():
    print("Testing RSS feeds...")
    
    urls = [
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/1977021501.cms",
    ]
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    for i, url in enumerate(urls):
        print(f"\n=== URL {i+1}: {url} ===")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                xml_data = resp.read().decode('utf-8', errors='ignore')
                print(f"✅ Response length: {len(xml_data)}")
                
                root = ET.fromstring(xml_data)
                items = list(root.iter("item"))
                print(f"✅ Found {len(items)} items")
                
                if items:
                    item = items[0]
                    title = item.findtext("title", "").strip()
                    print(f"✅ First item: {title[:50]}...")
                    
        except Exception as e:
            print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_rss()
