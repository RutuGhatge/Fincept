import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print("--- SUPPORTED GENERATION MODELS ---")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        # Check if it starts with models/gemini
        if m.name.startswith("models/gemini"):
            print(m.name)
print("--- END ---")
