from fastapi import APIRouter, HTTPException
from app.agents.orchestrator import orchestrator
from typing import Dict, Any

router = APIRouter()

@router.get("/explain/{term}")
async def explain_term(term: str):
    task = {"type": "explain_term", "data": {"term": term}}
    result = await orchestrator.distribute_task("JargonAgent", task)
    return result
