from fastapi import APIRouter, HTTPException
from app.agents.orchestrator import orchestrator
from app.agents.jargon_agent import JargonAgent
from typing import Dict, Any

router = APIRouter()

# Register agent
jargon_agent = JargonAgent()
orchestrator.register_agent(jargon_agent)

@router.get("/explain/{term}")
async def explain_term(term: str):
    task = {"type": "explain_term", "data": {"term": term}}
    result = await orchestrator.distribute_task("JargonAgent", task)
    return result
