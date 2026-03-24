import requests
import os
import shutil
import tempfile

BASE_URL = "http://127.0.0.1:8000"
ZERODHA_PATH = r"c:\Users\Rutu Mahesh Ghatge\OneDrive\Desktop\Projects\Investment_Intelligence\holdings-FUC270.xlsx"
GROWW_PATH = r"c:\Users\Rutu Mahesh Ghatge\OneDrive\Desktop\Projects\Investment_Intelligence\Holdings_Statement_2026-03-24.xlsx"

def upload_file(file_path, user_id, portfolio_name):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return False

    temp_dir = tempfile.gettempdir()
    temp_file = os.path.join(temp_dir, os.path.basename(file_path))
    shutil.copy2(file_path, temp_file)
    print(f"Uploading {os.path.basename(file_path)}...")

    with open(temp_file, 'rb') as f:
        files = {
            'file': (os.path.basename(file_path), f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        }
        data = {
            'portfolio_name': portfolio_name,
            'user_id': user_id
        }
        
        up_res = requests.post(f"{BASE_URL}/api/v1/portfolio/upload", files=files, data=data)
        
        if up_res.status_code == 200:
            print(f"Successfully uploaded {os.path.basename(file_path)}!")
            return True
        else:
            print(f"Upload failed for {os.path.basename(file_path)}: Status {up_res.status_code}")
            print(up_res.text)
            return False

def main():
    login_data = {"email": "portfolio_tester@example.com", "password": "testpassword123"}
    r = requests.post(f"{BASE_URL}/users/login", json=login_data)
    if r.status_code != 200:
        print(f"Login failed: {r.text}")
        return
        
    user_id = r.json().get("user_id")
    print(f"Authenticated customer: {user_id}")

    # 1. Upload Zerodha
    if upload_file(ZERODHA_PATH, user_id, "Zerodha Import"):
        print("---")
        # 2. Upload Groww
        upload_file(GROWW_PATH, user_id, "Groww Import")

if __name__ == "__main__":
    main()
