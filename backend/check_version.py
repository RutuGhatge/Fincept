import requests
try:
    response = requests.get("http://localhost:8000/api/v1/jargon/version")
    print(f"Status: {response.status_code}")
    print(f"Data: {response.json()}")
except Exception as e:
    print(f"Failed to connect: {e}")
