import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

models_to_test = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-exp-1206"
]

print("--- START RESULTS ---")
for m in models_to_test:
    try:
        # Just instantiate, don't even check generation to save time/quota
        model = genai.GenerativeModel(m)
        # However, checking if it exists by listing it or calling a dummy method
        # list_models is better
        found = False
        for am in genai.list_models():
            if am.name == f"models/{m}":
                found = True
                break
        if found:
            print(f"{m}: FOUND")
        else:
            print(f"{m}: MISSING")
    except Exception as e:
        print(f"{m}: ERROR ({e})")
print("--- END RESULTS ---")
