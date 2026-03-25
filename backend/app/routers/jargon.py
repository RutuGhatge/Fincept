from fastapi import APIRouter, HTTPException
from app.agents.orchestrator import orchestrator
from app.config.settings import settings
from typing import Dict, Any

router = APIRouter()

@router.get("/version")
def get_version():
    return {"version": "2.1.0-fix-routes", "model": settings.GEMINI_MODEL}

@router.get("/glossary")
async def get_glossary(skip: int = 0, limit: int = 20):
    from app.db.database import get_db
    db = get_db()
    collection = db["jargon"]
    # Return paginated terms sorted by name
    cursor = collection.find({}).sort("term", 1).skip(skip).limit(limit)
    glossary = await cursor.to_list(length=limit)
    # Convert ObjectId to string and handle legacy fields
    for item in glossary:
        item["id"] = str(item["_id"])
        item["short"] = item.get("short", item.get("definition", "")[:100] + "...")
        item["long"] = item.get("long", item.get("definition", ""))
        del item["_id"]
    return {
        "glossary": glossary,
        "skip": skip,
        "limit": limit
    }

@router.get("/{term}")
async def explain_term(term: str):
    task = {"type": "explain_term", "data": {"term": term}}
    result = await orchestrator.distribute_task("JargonAgent", task)
    return result
