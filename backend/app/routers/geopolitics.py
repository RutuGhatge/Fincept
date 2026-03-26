"""Geopolitics news endpoint — fetches global geopolitical news and portfolio impact via an Agentic Chain."""
import logging
from fastapi import APIRouter, Depends
from typing import Optional, List
from app.db.database import get_db
from app.agents.orchestrator import orchestrator

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/geopolitics")
async def get_geopolitics_news(
    symbols: Optional[str] = "",
    force_refresh: bool = False,
    db = Depends(get_db)
):
    """Returns geopolitical news + portfolio-specific impact analysis using an autonomous multi-step agent chain."""
    symbol_str = symbols or ""
    symbol_list = [s.strip() for s in symbol_str.split(",") if s.strip()]

    # Use the high-impact agentic reasoning loop
    result = await orchestrator.process_geopolitics_chain(symbol_list)
    
    if "success" in result and not result["success"]:
        return {"status": "error", "message": result.get("error", "Agent chain failed")}

    # The result from process_geopolitics_chain is refined_output dict
    refined_data = result.get("data", {})
    
    return {
        "geo_news": refined_data.get("geo_news", []),
        "portfolio_impact": refined_data.get("portfolio_impact", []),
        "reasoning_path": refined_data.get("reasoning_path", []),
        "symbols_analyzed": symbol_list,
        "status": "ok",
        "agentic": True
    }


@router.get("/geopolitics")
async def get_geopolitics_news(
    symbols: Optional[str] = "",
    force_refresh: bool = False,
    db = Depends(get_db)
):
    """Returns geopolitical news + portfolio-specific impact analysis using an autonomous multi-step agent chain."""
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]

    # Use the high-impact agentic reasoning loop
    result = await orchestrator.process_geopolitics_chain(symbol_list)
    
    if "error" in result:
        # Fallback to simple behavior or return error
        return {"status": "error", "message": result["error"]}

    # The result from process_geopolitics_chain is refined_output dict
    refined_data = result.get("data", {})
    
    return {
        "geo_news": refined_data.get("geo_news", []),
        "portfolio_impact": refined_data.get("portfolio_impact", []),
        "reasoning_path": refined_data.get("reasoning_path", []),
        "symbols_analyzed": symbol_list,
        "status": "ok",
        "agentic": True
    }
