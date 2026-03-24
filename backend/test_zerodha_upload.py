import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000"
FILE_PATH = r"c:\Users\Rutu Mahesh Ghatge\OneDrive\Desktop\Projects\Investment_Intelligence\Holdings_Statement_2026-03-24.xlsx"

def test_upload():
    if not os.path.exists(FILE_PATH):
        print(f"File not found: {FILE_PATH}")
        return

    # First login to get the user ID
    login_data = {
        "email": "portfolio_tester@example.com",
        "password": "testpassword123"
    }
    r = requests.post(f"{BASE_URL}/users/login", json=login_data)
    if r.status_code != 200:
        print(f"Login failed: {r.text}")
        return
        
    user_id = r.json().get("user_id")
    print(f"Successfully connected! Trying to upload file...")
    
    import shutil
    import tempfile
    
    # Create a temporary copy to avoid PermissionError if file is open in Excel
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, os.path.basename(FILE_PATH))
    shutil.copy2(FILE_PATH, temp_file_path)
    
    with open(temp_file_path, 'rb') as f:
        files = {
            'file': (os.path.basename(FILE_PATH), f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        }
        data = {
            'portfolio_name': 'My Zerodha Import',
            'user_id': user_id
        }
        
        up_res = requests.post(f"{BASE_URL}/api/v1/portfolio/upload", files=files, data=data)
        
        if up_res.status_code == 200:
            print("Successfully processed the user's Zerodha .xlsx file!")
            print(json.dumps(up_res.json(), indent=2))
        else:
            print(f"Upload failed: {up_res.status_code}")
            print(up_res.text)

if __name__ == "__main__":
    test_upload()
