#!/usr/bin/env python3
"""
Test the debug endpoint directly
"""
import requests
import json

def test_debug_endpoint():
    """Test the debug endpoint that should bypass cache"""
    print("=== TESTING DEBUG ENDPOINT ===")
    
    base_url = "http://localhost:8000/api/v1"
    symbols = "AXIS LARGE & MID CAP FUND,HDFC BANKING AND PSU DEBT FUND"
    
    try:
        # Test debug endpoint
        debug_url = f"{base_url}/news/debug-fresh"
        params = {"symbols": symbols}
        
        print(f"Calling: {debug_url}")
        print(f"Params: {params}")
        
        response = requests.get(debug_url, params=params, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Keys: {list(data.keys())}")
            print(f"Source: {data.get('source')}")
            print(f"Count: {data.get('count')}")
            print(f"Status: {data.get('status')}")
            print(f"Debug: {data.get('debug')}")
            
            news_items = data.get('news', [])
            print(f"News Items: {len(news_items)}")
            
            if news_items:
                print(f"First News Item: {news_items[0].get('title', 'No title')}")
                print(f"First News Category: {news_items[0].get('category', 'No category')}")
            
            print("\n✅ DEBUG ENDPOINT WORKING!")
            return True
        else:
            print(f"❌ ERROR: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")
        return False

def test_normal_endpoint():
    """Test the normal endpoint with force_refresh"""
    print("\n=== TESTING NORMAL ENDPOINT WITH FORCE_REFRESH ===")
    
    base_url = "http://localhost:8000/api/v1"
    symbols = "AXIS LARGE & MID CAP FUND,HDFC BANKING AND PSU DEBT FUND"
    user_id = "test_user"
    
    try:
        normal_url = f"{base_url}/news/et-rss"
        params = {
            "user_id": user_id,
            "symbols": symbols,
            "force_refresh": True
        }
        
        print(f"Calling: {normal_url}")
        print(f"Params: {params}")
        
        response = requests.get(normal_url, params=params, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Source: {data.get('source')}")
            print(f"Count: {data.get('count')}")
            print(f"Status: {data.get('status')}")
            
            print("\n✅ NORMAL ENDPOINT WORKING!")
            return True
        else:
            print(f"❌ ERROR: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")
        return False

if __name__ == "__main__":
    print("Testing news endpoints...")
    
    debug_works = test_debug_endpoint()
    normal_works = test_normal_endpoint()
    
    print(f"\n=== SUMMARY ===")
    print(f"Debug Endpoint: {'✅ WORKING' if debug_works else '❌ FAILED'}")
    print(f"Normal Endpoint: {'✅ WORKING' if normal_works else '❌ FAILED'}")
