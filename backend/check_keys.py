import os
from dotenv import load_dotenv

# First, check without load_dotenv
print("--- PRE-DOTENV ---")
print(f"GOOGLE_API_KEY: {os.environ.get('GOOGLE_API_KEY', 'Not Set')[:6]}...")
print(f"GEMINI_API_KEY: {os.environ.get('GEMINI_API_KEY', 'Not Set')[:6]}...")

# Now load .env
load_dotenv()
print("\n--- POST-DOTENV ---")
print(f"GOOGLE_API_KEY: {os.environ.get('GOOGLE_API_KEY', 'Not Set')[:6]}...")
print(f"GEMINI_API_KEY: {os.environ.get('GEMINI_API_KEY', 'Not Set')[:6]}...")

# Now check specialized settings
from app.config.settings import settings
print("\n--- SETTINGS OBJECT ---")
print(f"settings.GOOGLE_API_KEY: {settings.GOOGLE_API_KEY[:6] if settings.GOOGLE_API_KEY else 'None'}...")
print(f"settings.GEMINI_API_KEY: {settings.GEMINI_API_KEY[:6] if settings.GEMINI_API_KEY else 'None'}...")
