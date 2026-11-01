from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
import os
import json
import logging
from typing import List, Optional, Dict, Any

from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioResponse, PortfolioSummary,
    AddHoldingRequest, RemoveHoldingRequest, UpdateHoldingRequest,
    PortfolioAnalytics
)
from app.services.portfolio_service import PortfolioService
from app.agents.orchestrator import orchestrator
from app.db.database import get_db
from app.services.portfolio_parser import PortfolioParser
from app.utils.ai_utils import get_gemini_response
from app.config.settings import settings

logger = logging.getLogger(__name__)

from app.schemas.allocation import AllocationRequest, AllocationResponse

router = APIRouter()

# Use centralized AI utility for Gemini requests

@router.post("/{portfolio_id}/allocate", response_model=AllocationResponse)
async def allocate_budget(
    portfolio_id: str,
    request: AllocationRequest,
    user_id: str,
    db=Depends(get_db)
):
    """Suggest how to allocate a budget based on user profile and current portfolio"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.get_portfolio(portfolio_id, user_id)
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")

        # Prepare task for AnalysisAgent
        task_data = {
            "type": "allocate_budget",
            "data": {
                "budget": request.budget,
                "goal": request.goal,
                "age": request.age,
                "profession": request.profession,
                "portfolio": portfolio.get("holdings", [])
            }
        }
        
        # Construct prompt for allocation
        budget = request.budget
        goal = request.goal
        age = request.age
        profession = request.profession
        portfolio_summary = ", ".join([f"{p.get('symbol') or p.get('name')}: {p.get('market_value', 'N/A')}" for p in portfolio.get("holdings", [])])
        
        prompt = f"""
        As an expert financial advisor, suggest how to allocate a budget of {budget} INR for an investor with the following profile:
        - Age: {age}
        - Profession: {profession}
        - Goal: {goal}
        - Current Portfolio: {portfolio_summary}
        
        Provide your suggestions in a structured JSON format with:
        1. suggestions: A list of objects with fund_name, allocation_amount, and reason.
        2. total_allocated: Total sum of allocated amounts.
        3. summary: A brief explanation of the strategy.
        4. diversification_score: A score from 0.0 to 1.0.
        
        Only return the JSON.
        """

        # Use centralized AI utility with fallback
        try:
            response_text = await get_gemini_response(prompt)
        except Exception as e:
            logger.error(f"AI Allocation Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate allocation insights")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in allocation endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{portfolio_id}/insights")
async def get_portfolio_insights(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Get deep AI insights for a portfolio"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.get_portfolio(portfolio_id, user_id)
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")

        # Fetch news also to provide context
        from app.tools.news_scraper import NewsScraper
        scraper = NewsScraper()
        news = await scraper.fetch_news()

        task_data = {
            "type": "get_portfolio_insights",
            "data": {
                "portfolio": portfolio.get("holdings", []),
                "news": news
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request={
                "intent": "market_analysis",
                "data": task_data
            }
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail="Failed to get insights")
            
        return result["data"]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in insights endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=PortfolioResponse)
async def create_portfolio(
    portfolio: PortfolioCreate,
    user_id: str,
    db=Depends(get_db)
):
    """Create a new portfolio"""
    try:
        portfolio_service = PortfolioService()
        result = await portfolio_service.create_portfolio(
            user_id=user_id,
            **portfolio.dict()
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create portfolio"
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/upload", response_model=PortfolioResponse)
async def upload_portfolio(
    file: UploadFile = File(...),
    portfolio_name: str = Form("Imported Portfolio"),
    user_id: str = Form(...),
    db=Depends(get_db)
):
    """Upload a CSV or Excel file to create/import a portfolio"""
    try:
        contents = await file.read()
        holdings_create = PortfolioParser.parse_file(contents, file.filename)
        
        # Add fetching live prices logic here in future steps
        # Currently just loading parsed holdings directly
        
        portfolio_service = PortfolioService()
        result = await portfolio_service.create_portfolio(
            user_id=user_id,
            name=portfolio_name,
            holdings=[h.dict() for h in holdings_create],
            currency="INR",
            file_info={"filename": file.filename}
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create portfolio from upload"
            )
            
        return result
        
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Error processing portfolio upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/")
async def get_user_portfolios(
    user_id: str,
    skip: int = 0,
    limit: int = 10,
    db=Depends(get_db)
):
    """Get all portfolios for a user"""
    try:
        portfolio_service = PortfolioService()
        portfolios = await portfolio_service.get_user_portfolios(
            user_id=user_id,
            skip=skip,
            limit=limit
        )
        # Ensure ObjectId is serialized to string
        for p in portfolios:
            p["id"] = str(p.get("_id", p.get("id", "")))
            p.pop("_id", None)
            p.setdefault("daily_change", None)
            p.setdefault("daily_change_percent", None)
            p.setdefault("total_return_percent", None)
            p.setdefault("last_updated", None)
        return portfolios

    except Exception as e:
        logger.error(f"Error getting user portfolios: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/me")
async def get_my_portfolio(
    user_id: str,
    db=Depends(get_db)
):
    """Get the current user's portfolio (their first/only portfolio), with full holdings"""
    try:
        portfolio_service = PortfolioService()

        # Step 1: list to find the portfolio ID
        summaries = await portfolio_service.get_user_portfolios(user_id=user_id, limit=1)
        if not summaries:
            raise HTTPException(status_code=404, detail="No portfolio found")

        portfolio_id = str(summaries[0].get("_id") or summaries[0].get("id"))

        # Step 2: fetch the full document (includes all holdings with prices)
        full = await portfolio_service.get_portfolio(portfolio_id=portfolio_id, user_id=user_id)
        if not full:
            raise HTTPException(status_code=404, detail="No portfolio found")

        # Convert ObjectId fields to strings for JSON serialisation
        full["id"] = str(full.get("_id", portfolio_id))
        full.pop("_id", None)
        # Ensure required fields have defaults
        full.setdefault("is_active", True)
        full.setdefault("metadata", {})
        full.setdefault("description", None)
        full.setdefault("total_return", None)
        full.setdefault("total_return_percent", None)
        full.setdefault("daily_change", None)
        full.setdefault("daily_change_percent", None)

        return full

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user portfolio /me: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Get a specific portfolio"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.get_portfolio(
            portfolio_id=portfolio_id,
            user_id=user_id
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        return portfolio
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: str,
    portfolio_update: PortfolioUpdate,
    user_id: str,
    db=Depends(get_db)
):
    """Update a portfolio"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.update_portfolio(
            portfolio_id=portfolio_id,
            user_id=user_id,
            **portfolio_update.dict(exclude_unset=True)
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        return portfolio
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Delete a portfolio"""
    try:
        portfolio_service = PortfolioService()
        success = await portfolio_service.delete_portfolio(
            portfolio_id=portfolio_id,
            user_id=user_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        return {"message": "Portfolio deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{portfolio_id}/files/{file_id}", response_model=PortfolioResponse)
async def delete_portfolio_file(
    portfolio_id: str,
    file_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Delete a specific uploaded file from portfolio"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.delete_portfolio_file(
            portfolio_id=portfolio_id,
            file_id=file_id,
            user_id=user_id
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio or file not found"
            )
        
        return portfolio
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting portfolio file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{portfolio_id}/holdings", response_model=PortfolioResponse)
async def add_holding(
    portfolio_id: str,
    request: AddHoldingRequest,
    user_id: str,
    db=Depends(get_db)
):
    """Add a holding to portfolio"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.add_holding(
            portfolio_id=portfolio_id,
            user_id=user_id,
            **request.holding.dict()
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found"
            )
        
        return portfolio
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding holding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{portfolio_id}/holdings", response_model=PortfolioResponse)
async def remove_holding(
    portfolio_id: str,
    request: RemoveHoldingRequest,
    user_id: str,
    db=Depends(get_db)
):
    """Remove a holding from portfolio"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.remove_holding(
            portfolio_id=portfolio_id,
            user_id=user_id,
            symbol=request.symbol
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found or holding not found"
            )
        
        return portfolio
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing holding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{portfolio_id}/holdings", response_model=PortfolioResponse)
async def update_holding(
    portfolio_id: str,
    request: UpdateHoldingRequest,
    user_id: str,
    db=Depends(get_db)
):
    """Update a holding in portfolio"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.update_holding(
            portfolio_id=portfolio_id,
            user_id=user_id,
            symbol=request.symbol,
            **request.updates.dict(exclude_unset=True)
        )
        
        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found or holding not found"
            )
        
        return portfolio
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating holding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{portfolio_id}/value")
async def get_portfolio_value(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Get current portfolio value with live prices"""
    try:
        # Use orchestrator to get portfolio value
        
        request_data = {
            "intent": "portfolio_management",
            "data": {
                "operation": "value",
                "portfolio_id": portfolio_id
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get portfolio value")
            )
        
        return result["data"]["portfolio"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting portfolio value: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{portfolio_id}/analytics", response_model=PortfolioAnalytics)
async def get_portfolio_analytics(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Get comprehensive portfolio analytics"""
    try:
        # Use orchestrator to get portfolio analytics
        
        request_data = {
            "intent": "portfolio_management",
            "data": {
                "operation": "analytics",
                "portfolio_id": portfolio_id
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get portfolio analytics")
            )
        
        return result["data"]["portfolio"]["analytics"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting portfolio analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{portfolio_id}/rebalance")
async def rebalance_portfolio(
    portfolio_id: str,
    target_allocation: dict,
    user_id: str,
    db=Depends(get_db)
):
    """Rebalance portfolio to target allocation"""
    try:
        portfolio_service = PortfolioService()
        result = await portfolio_service.rebalance_portfolio(
            portfolio_id=portfolio_id,
            user_id=user_id,
            target_allocation=target_allocation
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to rebalance portfolio")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rebalancing portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{portfolio_id}/allocate-ai")
async def allocate_budget_ai(
    portfolio_id: str,
    payload: Dict[str, Any],
    user_id: str,
    db=Depends(get_db)
):
    """Use Gemini to generate a personalized allocation strategy based on portfolio and user goals"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.get_portfolio(portfolio_id, user_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")

        # Prepare context for Gemini
        holdings = portfolio.get("holdings", [])
        budget = payload.get("budget", 50000)
        mode = payload.get("mode", "manual") # manual or nlp
        
        context_str = f"Budget: INR {budget}\n"
        if mode == "manual":
            context_str += f"Age: {payload.get('age')}\nRetirement Age: {payload.get('retirement_age')}\nGoal: {payload.get('goal')}\nExpected Return: {payload.get('expected_return')}%\n"
        else:
            context_str += f"User Prompt: {payload.get('prompt')}\n"

        holdings_str = "\n".join([f"- {h['symbol']}: {h['name']} (Type: {h.get('asset_type', 'unknown')}, Value: INR {h.get('market_value', 0)})" for h in holdings])

        prompt = f"""You are a senior investment advisor. Based on the user's current portfolio and investment goals, provide a specific allocation strategy for a new investment.

Current Portfolio:
{holdings_str}

User Context:
{context_str}

Rules:
1. Suggest specific mutual fund names or stock names available in India (e.g., 'Parag Parikh Flexi Cap Fund', 'HDFC Index S&P BSE Sensex Fund', 'ICICI Prudential Bluechip Fund').
2. Allocate the entire budget among 2-4 funds.
3. If the current portfolio is well-diversified, prefer adding to existing holdings.
4. If the portfolio lacks diversification (e.g., too much concentration in one sector), suggest new specific funds.
5. For each fund, provide the exact amount to invest and a clear reason 'why'.

Output strictly in JSON format:
{{
  "suggestions": [
    {{
      "fund_name": "Exact Fund Name",
      "amount": numeric_amount,
      "category": "Category",
      "reason": "Detailed reason why this fits the strategy"
    }}
  ],
  "overall_strategy": "A 2-3 sentence summary of the strategy rationale."
}}
"""

        # Use centralized AI utility with fallback
        try:
            text = await get_gemini_response(prompt)
            text = text.strip()
            
            if text.startswith("```"):
                text = "\n".join(text.split("\n")[1:])
                if text.endswith("```"):
                    text = text[:-3].strip()
            
            result = json.loads(text)
            return {"success": True, "data": result}
        except Exception as e:
            logger.error(f"AI Allocate-AI Error: {e}")
            # Return structured fallback instead of error
            fallback_suggestions = []
            
            # Analyze current portfolio for fallback strategy
            if holdings:
                # Group holdings by type for diversification analysis
                asset_types = {}
                for h in holdings:
                    asset_type = h.get('asset_type', 'unknown')
                    if asset_type not in asset_types:
                        asset_types[asset_type] = 0
                    asset_types[asset_type] += h.get('market_value', 0)
                
                # If portfolio is concentrated, suggest diversification
                if len(asset_types) < 3:
                    fallback_suggestions.extend([
                        {
                            "fund_name": "Parag Parikh Flexi Cap Fund",
                            "amount": budget * 0.4,
                            "category": "Equity - Flexi Cap",
                            "reason": "Diversify across market caps and sectors for balanced growth"
                        },
                        {
                            "fund_name": "HDFC Index S&P BSE Sensex Fund",
                            "amount": budget * 0.3,
                            "category": "Equity - Index",
                            "reason": "Core market exposure with low tracking error"
                        },
                        {
                            "fund_name": "ICICI Prudential Bluechip Fund",
                            "amount": budget * 0.3,
                            "category": "Equity - Large Cap",
                            "reason": "Stable large-cap companies with consistent performance"
                        }
                    ])
                else:
                    # Portfolio is diversified, add to existing positions
                    top_holdings = sorted(holdings, key=lambda x: x.get('market_value', 0), reverse=True)[:2]
                    for i, holding in enumerate(top_holdings):
                        fallback_suggestions.append({
                            "fund_name": holding.get('name', holding.get('symbol', 'Unknown')),
                            "amount": budget * (0.5 if i == 0 else 0.5),
                            "category": holding.get('asset_type', 'Equity'),
                            "reason": f"Increase position in existing well-performing {holding.get('asset_type', 'holding')}"
                        })
            else:
                # No existing holdings - provide balanced portfolio
                fallback_suggestions = [
                    {
                        "fund_name": "Parag Parikh Flexi Cap Fund",
                        "amount": budget * 0.4,
                        "category": "Equity - Flexi Cap",
                        "reason": "Diversified equity exposure across market caps"
                    },
                    {
                        "fund_name": "HDFC Index S&P BSE Sensex Fund",
                        "amount": budget * 0.3,
                        "category": "Equity - Index",
                        "reason": "Broad market exposure with low cost"
                    },
                    {
                        "fund_name": "ICICI Prudential Technology Fund",
                        "amount": budget * 0.3,
                        "category": "Equity - Sectoral",
                        "reason": "Growth potential in technology sector"
                    }
                ]
            
            fallback_response = {
                "suggestions": fallback_suggestions,
                "overall_strategy": "AI analysis temporarily unavailable. Using rule-based diversification strategy.",
                "fallback": True
            }
            
            return {"success": True, "data": fallback_response}

    except Exception as e:
        logger.error(f"Error in allocate-ai: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{portfolio_id}/refresh")
async def refresh_portfolio_prices(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Force refresh all holding prices from live market data"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.refresh_portfolio_prices(
            portfolio_id=portfolio_id,
            user_id=user_id
        )
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        portfolio["id"] = str(portfolio.get("_id", portfolio.get("id", "")))
        portfolio.pop("_id", None)
        portfolio.setdefault("is_active", True)
        portfolio.setdefault("metadata", {})
        portfolio.setdefault("description", None)
        portfolio.setdefault("total_return", None)
        portfolio.setdefault("total_return_percent", None)
        portfolio.setdefault("daily_change", None)
        portfolio.setdefault("daily_change_percent", None)
        
        return portfolio
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing portfolio prices: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{portfolio_id}/recalculate")
async def force_recalculate_portfolio(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Force recalculate portfolio using file prices (bypasses live API)"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.force_recalculate_from_files(
            portfolio_id=portfolio_id,
            user_id=user_id
        )
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        portfolio["id"] = str(portfolio.get("_id", portfolio.get("id", "")))
        portfolio.pop("_id", None)
        portfolio.setdefault("is_active", True)
        portfolio.setdefault("metadata", {})
        portfolio.setdefault("description", None)
        portfolio.setdefault("total_return", None)
        portfolio.setdefault("total_return_percent", None)
        portfolio.setdefault("daily_change", None)
        portfolio.setdefault("daily_change_percent", None)
        
        return portfolio
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recalculating portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{portfolio_id}/debug")
async def debug_portfolio(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Debug endpoint to show raw file data and calculations"""
    try:
        database = db.get_database()
        portfolio = await database["portfolios"].find_one({"_id": ObjectId(portfolio_id), "user_id": user_id})
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        files = portfolio.get("files", [])
        debug_info = {
            "portfolio_id": portfolio_id,
            "current_total_value": portfolio.get("total_value"),
            "current_total_invested": portfolio.get("total_invested"),
            "files_count": len(files),
            "files_data": []
        }
        
        for f in files:
            file_info = {
                "filename": f.get("filename"),
                "upload_date": f.get("upload_date"),
                "holdings_count": f.get("holdings_count"),
                "holdings": []
            }
            
            for h in f.get("holdings", []):
                holding_debug = {
                    "symbol": h.get("symbol"),
                    "quantity": h.get("quantity"),
                    "average_cost": h.get("average_cost"),
                    "current_price": h.get("current_price"),
                    "market_value": h.get("quantity", 0) * h.get("current_price", 0)
                }
                file_info["holdings"].append(holding_debug)
            
            debug_info["files_data"].append(file_info)
        
        return debug_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error debugging portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{portfolio_id}/track")
async def track_portfolio(portfolio_id: str, user_id: str, db=Depends(get_db)):
    """Bridge for frontend's trackPortfolio call — returns refreshed portfolio data"""
    try:
        portfolio_service = PortfolioService()
        portfolio = await portfolio_service.refresh_portfolio_prices(
            portfolio_id=portfolio_id,
            user_id=user_id
        )
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        portfolio["id"] = str(portfolio.get("_id", portfolio.get("id", "")))
        portfolio.pop("_id", None)
        return portfolio
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend")
async def get_general_recommendations(data: dict):
    """Bridge for frontend's getRecommendation call"""
    task = {"type": "provide_recommendations", "data": data}
    return await orchestrator.distribute_task("AnalysisAgent", task)
