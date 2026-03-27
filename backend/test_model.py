import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content("Hello, wave at me!")
    print(f"Success with gemini-2.5-flash: {response.text}")
except Exception as e:
    print(f"Failed with gemini-2.5-flash: {e}")
