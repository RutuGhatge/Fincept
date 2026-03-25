import os
import asyncio
from docx import Document
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "investment_intelligence")

async def seed_jargon():
    # Use absolute path for the docx file
    docx_path = r"c:\Users\Rutu Mahesh Ghatge\OneDrive\Desktop\Projects\Investment_Intelligence\Stock_Market_Jargon_Glossary.docx"
    
    if not os.path.exists(docx_path):
        print(f"Error: File not found at {docx_path}")
        return

    print(f"Parsing {docx_path}...")
    document = Document(docx_path)
    
    jargon_data = []
    current_term = None
    current_definition = []

    # Simple parser for "Term: Definition" or similar structures
    # This might need adjustment based on the actual docx structure
    for paragraph in document.paragraphs:
        text = paragraph.text.strip()
        if not text:
            continue
            
        if ":" in text:
            if current_term:
                jargon_data.append({
                    "term": current_term,
                    "definition": " ".join(current_definition).strip()
                })
            
            parts = text.split(":", 1)
            current_term = parts[0].strip()
            current_definition = [parts[1].strip()]
        else:
            if current_term:
                current_definition.append(text)

    # Append the last one
    if current_term:
        jargon_data.append({
            "term": current_term,
            "definition": " ".join(current_definition).strip()
        })

    if not jargon_data:
        print("No jargon found in document.")
        return

    print(f"Connecting to MongoDB at {MONGODB_URL}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db["jargon"]

    print(f"Found {len(jargon_data)} terms. Seeding...")
    
    # Use upsert to avoid duplicates
    for item in jargon_data:
        await collection.update_one(
            {"term": item["term"]},
            {"$set": item},
            upsert=True
        )

    print("Seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_jargon())
