from fastapi import APIRouter, HTTPException
from app.agents.orchestrator import orchestrator
from app.agents.analysis_agent import AnalysisAgent
from typing import Dict, Any

router = APIRouter()

# Register agent
analysis_agent = AnalysisAgent()
orchestrator.register_agent(analysis_agent)

@router.post("/analyze")
async def analyze_portfolio(data: Dict[str, Any]):
    task = {"type": "analyze_performance", "data": data}
    result = await orchestrator.distribute_task("AnalysisAgent", task)
    return result

@router.post("/risk")
async def assess_risk(data: Dict[str, Any]):
    task = {"type": "assess_risk", "data": data}
    result = await orchestrator.distribute_task("AnalysisAgent", task)
    return result
