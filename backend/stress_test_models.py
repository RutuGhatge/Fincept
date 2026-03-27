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
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-1.0-pro"
]

print("Testing model availability:")
for m in models_to_test:
    try:
        model = genai.GenerativeModel(m)
        # Try a very small token count call
        response = model.generate_content("Hi", generation_config={"max_output_tokens": 10})
        print(f"{m}: SUCCESS")
    except Exception as e:
        status = "404" if "404" in str(e) else "OTHER ERROR"
        print(f"{m}: {status} ({e})")
