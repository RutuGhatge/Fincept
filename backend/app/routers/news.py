from fastapi import APIRouter, HTTPException
from app.agents.orchestrator import orchestrator
from typing import Dict, Any, Optional

router = APIRouter()

@router.get("/")
async def get_news(symbol: Optional[str] = None):
    task = {"type": "fetch_news", "data": {"symbol": symbol}}
    result = await orchestrator.distribute_task("NewsAgent", task)
    return result

@router.post("/analyze")
async def analyze_news(data: Dict[str, Any]):
    task = {"type": "analyze_news", "data": data}
    result = await orchestrator.distribute_task("NewsAgent", task)
    return result

@router.post("/categorize")
async def categorize_news(data: Dict[str, Any]):
    user_id = data.get("user_id", "anonymous")
    result = await orchestrator.process_request(
        user_id=user_id,
        request={
            "intent": "market_news",
            "data": data
        }
    )
    return result
