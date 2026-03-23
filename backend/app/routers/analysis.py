from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import logging

from app.schemas.analysis import (
    AnalysisRequest, AnalysisResponse, AnalysisType
)
from app.services.analysis_service import AnalysisService
from app.agents.orchestrator import AgentOrchestrator
from app.db.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/portfolio/{portfolio_id}", response_model=AnalysisResponse)
async def analyze_portfolio(
    portfolio_id: str,
    analysis_type: AnalysisType,
    user_id: str,
    period_days: Optional[int] = 365,
    db=Depends(get_db)
):
    """Analyze portfolio performance, risk, or allocation"""
    try:
        # Use orchestrator to perform analysis
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "analysis",
            "data": {
                "analysis_type": analysis_type.value,
                "portfolio_id": portfolio_id,
                "period_days": period_days
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to analyze portfolio")
            )
        
        return {
            "success": True,
            "analysis_type": analysis_type,
            "portfolio_id": portfolio_id,
            "results": result["data"]["analysis"],
            "metadata": result.get("metadata", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing portfolio: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/portfolio/{portfolio_id}/comprehensive")
async def comprehensive_analysis(
    portfolio_id: str,
    user_id: str,
    period_days: Optional[int] = 365,
    db=Depends(get_db)
):
    """Perform comprehensive portfolio analysis"""
    try:
        # Use orchestrator for comprehensive analysis
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "comprehensive",
            "data": {
                "portfolio_id": portfolio_id,
                "period_days": period_days
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to perform comprehensive analysis")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in comprehensive analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/performance")
async def get_performance_metrics(
    portfolio_id: str,
    user_id: str,
    period_days: Optional[int] = 365,
    benchmark: Optional[str] = None,
    db=Depends(get_db)
):
    """Get portfolio performance metrics"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "analysis",
            "data": {
                "analysis_type": "performance",
                "portfolio_id": portfolio_id,
                "period_days": period_days,
                "benchmark": benchmark
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get performance metrics")
            )
        
        return result["data"]["analysis"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/risk")
async def get_risk_analysis(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Get portfolio risk analysis"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "analysis",
            "data": {
                "analysis_type": "risk",
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
                detail=result.get("error", "Failed to get risk analysis")
            )
        
        return result["data"]["analysis"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting risk analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/allocation")
async def get_allocation_analysis(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Get portfolio allocation analysis"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "analysis",
            "data": {
                "analysis_type": "allocation",
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
                detail=result.get("error", "Failed to get allocation analysis")
            )
        
        return result["data"]["analysis"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting allocation analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/recommendations")
async def get_recommendations(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Get portfolio recommendations"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "analysis",
            "data": {
                "analysis_type": "recommendation",
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
                detail=result.get("error", "Failed to get recommendations")
            )
        
        return result["data"]["analysis"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/history")
async def get_analysis_history(
    portfolio_id: str,
    user_id: str,
    analysis_type: Optional[AnalysisType] = None,
    skip: int = 0,
    limit: int = 50,
    db=Depends(get_db)
):
    """Get analysis history for a portfolio"""
    try:
        analysis_service = AnalysisService()
        history = await analysis_service.get_analysis_history(
            portfolio_id=portfolio_id,
            user_id=user_id,
            analysis_type=analysis_type,
            skip=skip,
            limit=limit
        )
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting analysis history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/compare")
async def compare_portfolios(
    portfolio_id: str,
    compare_portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Compare two portfolios"""
    try:
        analysis_service = AnalysisService()
        comparison = await analysis_service.compare_portfolios(
            portfolio_id=portfolio_id,
            compare_portfolio_id=compare_portfolio_id,
            user_id=user_id
        )
        
        if not comparison:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or both portfolios not found"
            )
        
        return comparison
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing portfolios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/portfolio/{portfolio_id}/backtest")
async def backtest_strategy(
    portfolio_id: str,
    strategy_config: dict,
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db=Depends(get_db)
):
    """Backtest investment strategy on portfolio"""
    try:
        analysis_service = AnalysisService()
        backtest_result = await analysis_service.backtest_strategy(
            portfolio_id=portfolio_id,
            user_id=user_id,
            strategy_config=strategy_config,
            start_date=start_date,
            end_date=end_date
        )
        
        if not backtest_result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to run backtest"
            )
        
        return backtest_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running backtest: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
