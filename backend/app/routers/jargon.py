from fastapi import APIRouter, HTTPException
from app.agents.orchestrator import orchestrator
from typing import Dict, Any

router = APIRouter()

@router.get("/{term}")
async def explain_term(term: str):
    task = {"type": "explain_term", "data": {"term": term}}
    result = await orchestrator.distribute_task("JargonAgent", task)
    return result

@router.get("/glossary")
async def get_glossary():
    from app.db.database import get_db
    db = get_db()
    collection = db["jargon"]
    # Return all terms sorted by name
    cursor = collection.find({}).sort("term", 1)
    glossary = await cursor.to_list(length=1000)
    # Convert ObjectId to string for JSON serialization
    for item in glossary:
        item["id"] = str(item["_id"])
        del item["_id"]
    return {"glossary": glossary}
