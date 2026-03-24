from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import logging

from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioResponse, PortfolioSummary,
    AddHoldingRequest, RemoveHoldingRequest, UpdateHoldingRequest,
    PortfolioAnalytics
)
from app.agents.portfolio_agent import PortfolioAgent
from app.agents.orchestrator import AgentOrchestrator
from app.db.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


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
        orchestrator = AgentOrchestrator()
        
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
        orchestrator = AgentOrchestrator()
        
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
