import os
import subprocess
import sys

def main():
    print("Starting Investment Intelligence Backend...")

    print("Checking and installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    except subprocess.CalledProcessError as e:
        print(f"Failed to install dependencies: {e}")
        sys.exit(1)

    print("Starting FastAPI server...")
    import uvicorn
    # Make sure we're running from the backend directory to find 'app'
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
