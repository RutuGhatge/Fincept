import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

models_to_check = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.0-pro-exp-02-05"
]

available = [m.name for m in genai.list_models()]
print("Available Gemini Models Status:")
for m in models_to_check:
    full_name = f"models/{m}"
    status = "Found" if full_name in available else "Not Found"
    print(f"{m}: {status}")

print("\nAll models starting with 'models/gemini':")
for m in available:
    if m.startswith("models/gemini"):
        print(m)
