import requests
import json

def test_backend():
    base_url = "http://localhost:8000"
    endpoints = [
        "/",
        "/api/v1/news/"
    ]
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"Testing {url}...")
        try:
            response = requests.get(url, timeout=5)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"Response: {json.dumps(response.json(), indent=2)[:200]}...")
            else:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_backend()
