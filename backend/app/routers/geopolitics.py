from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from app.agents.orchestrator import orchestrator
from typing import Dict, Any, Optional, List
from app.db.database import get_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

STATIC_FALLBACK_DATA = {
    "geo_news": [
        {
            "title": "Global Market Pulse: Focus on Infrastructure and Tech",
            "summary": "Markets show resilience despite geopolitical shifts. Institutional focus remains on long-term infrastructure and technology growth sectors.",
            "region": "Global",
            "conflict_level": "Low",
            "key_players": ["Global Markets"],
            "source_url": "#",
            "time": "Just now"
        },
        {
            "title": "Energy Transition Signals remain Strong",
            "summary": "Global energy transition continues to drive capital towards sustainable infrastructure and new-age manufacturing units.",
            "region": "Global",
            "conflict_level": "Low",
            "key_players": ["Energy Groups"],
            "source_url": "#",
            "time": "Today"
        }
    ],
    "portfolio_impact": [
        {
            "symbol": "GENERIC",
            "impact": "Watch",
            "geo_event": "Global Market Stability",
            "impact_reason": "Broad market stability supports diversified portfolio holdings.",
            "holding_name": "Market Core"
        }
    ],
    "reasoning_path": [
        "Infrastructure focus is providing a defensive floor for indices.",
        "Technology adoption across non-US markets is accelerating.",
        "Energy volatility is prompting a shift towards more stable manufacturing bases."
    ],
    "status": "fallback",
    "agentic": False
}

@router.get("/geopolitics")
async def get_geopolitics_news(
    symbols: Optional[str] = "",
    force_refresh: bool = False,
    user_id: Optional[str] = "anonymous",
    db = Depends(get_db)
):
    """Returns geopolitical news + portfolio-specific impact analysis using an autonomous multi-step agent chain."""
    symbol_str = symbols or ""
    symbol_list = [s.strip() for s in symbol_str.split(",") if s.strip()]

    # 1. Check Cache
    cache_id = f"geo_{user_id}"
    cached = await db.geo_news_cache.find_one({"cache_id": cache_id})
    
    if cached and not force_refresh:
        # Check if cache is fresh (e.g., < 60 mins for geopolitics)
        updated_at = cached.get("updated_at")
        if isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        
        if updated_at > datetime.now() - timedelta(minutes=60):
            logger.info("Serving geopolitical analysis from cache.")
            return {
                **cached["analysis"],
                "status": "cached",
                "cached_at": updated_at.isoformat()
            }

    # 2. Revalidate/Refresh: Use the high-impact agentic reasoning loop
    logger.info("Executing fresh agentic geopolitics chain.")
    result = await orchestrator.process_geopolitics_chain(symbol_list)
    
    # FIX: Correctly check for success using the orchestrator's new return structure
    if not result.get("success", False):
        error_msg = result.get("error", "Agent chain failed")
        logger.error(f"Geopolitics chain failed: {error_msg}")
        
        if cached:
            logger.warning("Agent chain failed, falling back to STALE cache.")
            return {**cached["analysis"], "status": "stale", "error": error_msg}
            
        # 3. STATIC FALLBACK: If no cache and AI failed, don't return empty!
        logger.warning("No cache available. Serving STATIC FALLBACK news.")
        # Personalize fallback impacts for visible symbols
        fallback_impacts = []
        for sym in symbol_list[:5]:
            fallback_impacts.append({
                "symbol": sym,
                "impact": "Watch",
                "geo_event": "Global Macro Trends",
                "impact_reason": "General market trends suggest a 'wait and watch' approach for specific sectoral movements.",
                "holding_name": sym
            })
        
        fallback_data = STATIC_FALLBACK_DATA.copy()
        if fallback_impacts:
            fallback_data["portfolio_impact"] = fallback_impacts
            
        return fallback_data

    # The result from process_geopolitics_chain is refined_output dict
    refined_data = result.get("data", {})
    
    output = {
        "geo_news": refined_data.get("geo_news", []),
        "portfolio_impact": refined_data.get("portfolio_impact", []),
        "reasoning_path": refined_data.get("reasoning_path", []),
        "symbols_analyzed": symbol_list,
        "status": "ok",
        "agentic": True
    }
    
    # 4. Update Cache
    await db.geo_news_cache.update_one(
        {"cache_id": cache_id},
        {
            "$set": {
                "cache_id": cache_id,
                "analysis": output,
                "updated_at": datetime.now().isoformat(),
                "symbols": symbol_list
            }
        },
        upsert=True
    )
    
    return output
