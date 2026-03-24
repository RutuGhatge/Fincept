import os
import sys

# Add backend directory to sys.path so we can import app modules directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.auth import get_password_hash, verify_password

def test_auth():
    try:
        pw = "TestPassword123!"
        print(f"Testing password: {pw}")
        h = get_password_hash(pw)
        print(f"Hash generated: {h}")
        v = verify_password(pw, h)
        print(f"Verification successful: {v}")
    except Exception as e:
        print(f"RUNTIME ERROR: {e}")

if __name__ == "__main__":
    test_auth()
