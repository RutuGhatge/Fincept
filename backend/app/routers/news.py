from fastapi import APIRouter, HTTPException
from app.agents.orchestrator import orchestrator
from app.agents.news_agent import NewsAgent
from typing import Dict, Any

router = APIRouter()

# Register agent
news_agent = NewsAgent()
orchestrator.register_agent(news_agent)

@router.get("/")
async def get_news(symbol: str = None):
    task = {"type": "fetch_news", "data": {"symbol": symbol}}
    result = await orchestrator.distribute_task("NewsAgent", task)
    return result

@router.post("/analyze")
async def analyze_news(data: Dict[str, Any]):
    task = {"type": "analyze_news", "data": data}
    result = await orchestrator.distribute_task("NewsAgent", task)
    return result
