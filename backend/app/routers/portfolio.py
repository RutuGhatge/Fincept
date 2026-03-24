from fastapi import APIRouter, HTTPException, Depends
from app.agents.orchestrator import orchestrator
from app.agents.portfolio_agent import PortfolioAgent
from typing import Dict, Any

router = APIRouter()

# Register agent (in a real app, this might be done in a central registry)
portfolio_agent = PortfolioAgent()
orchestrator.register_agent(portfolio_agent)

@router.post("/recommend")
async def get_portfolio_recommendation(data: Dict[str, Any]):
    task = {"type": "create_portfolio", "data": data}
    result = await orchestrator.distribute_task("PortfolioAgent", task)
    return result

@router.get("/{portfolio_id}/track")
async def track_portfolio(portfolio_id: str):
    # Fetch portfolio from DB (omitted for brevity in this simple example)
    task = {"type": "track_portfolio", "data": {"portfolio_id": portfolio_id}}
    result = await orchestrator.distribute_task("PortfolioAgent", task)
    return result
