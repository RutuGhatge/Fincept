from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
import logging

from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioResponse, PortfolioSummary,
    AddHoldingRequest, RemoveHoldingRequest, UpdateHoldingRequest,
    PortfolioAnalytics
)
from app.services.portfolio_service import PortfolioService
from app.agents.orchestrator import orchestrator
from app.db.database import get_db
from app.services.portfolio_parser import PortfolioParser

logger = logging.getLogger(__name__)

from app.schemas.allocation import AllocationRequest, AllocationResponse

router = APIRouter()

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
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request={
                "intent": "market_analysis",
                "data": task_data
            }
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get allocation suggestions")
            )
        
        return result["data"]
        
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
            currency="INR"
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

@router.get("/", response_model=List[PortfolioSummary])
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
        
        return portfolios
        
    except Exception as e:
        logger.error(f"Error getting user portfolios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


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

@router.get("/{portfolio_id}/track")
async def track_portfolio(portfolio_id: str):
    """Bridge for frontend's trackPortfolio call"""
    task = {"type": "analyze_performance", "data": {"portfolio_id": portfolio_id}}
    return await orchestrator.distribute_task("AnalysisAgent", task)

@router.post("/recommend")
async def get_general_recommendations(data: dict):
    """Bridge for frontend's getRecommendation call"""
    task = {"type": "provide_recommendations", "data": data}
    return await orchestrator.distribute_task("AnalysisAgent", task)
