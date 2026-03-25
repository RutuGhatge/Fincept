from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import logging

from app.schemas.recommendations import (
    RecommendationRequest, RecommendationResponse
)
from app.agents.orchestrator import orchestrator
from app.db.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/portfolio/{portfolio_id}", response_model=RecommendationResponse)
async def get_portfolio_recommendations(
    portfolio_id: str,
    request: RecommendationRequest,
    user_id: str,
    db=Depends(get_db)
):
    """Get AI-powered portfolio recommendations"""
    try:
        # result = await orchestrator.process_request(...)
        
        request_data = {
            "intent": "comprehensive",
            "data": {
                "portfolio_id": portfolio_id,
                "recommendation_type": request.recommendation_type,
                "risk_tolerance": request.risk_tolerance,
                "investment_horizon": request.investment_horizon,
                "financial_goals": request.financial_goals
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to generate recommendations")
            )
        
        # Extract recommendations from the comprehensive analysis
        recommendations = []
        analysis_data = result["data"].get("analysis", {})
        
        if "recommendations" in analysis_data:
            recommendations = analysis_data["recommendations"]
        
        return RecommendationResponse(
            portfolio_id=portfolio_id,
            recommendations=recommendations,
            summary=result.get("summary", {}),
            metadata=result.get("metadata", {})
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting portfolio recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/quick")
async def get_quick_recommendations(
    portfolio_id: str,
    user_id: str,
    db=Depends(get_db)
):
    """Get quick portfolio recommendations without detailed analysis"""
    try:
        # result = await orchestrator.process_request(...)
        
        request_data = {
            "intent": "analysis",
            "data": {
                "analysis_type": "recommendation",
                "portfolio_id": portfolio_id,
                "quick_mode": True
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get quick recommendations")
            )
        
        return result["data"]["analysis"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting quick recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/portfolio/{portfolio_id}/rebalancing")
async def get_rebalancing_recommendations(
    portfolio_id: str,
    target_allocation: dict,
    user_id: str,
    tolerance: float = 0.05,
    db=Depends(get_db)
):
    """Get portfolio rebalancing recommendations"""
    try:
        # result = await orchestrator.process_request(...)
        
        request_data = {
            "intent": "analysis",
            "data": {
                "analysis_type": "allocation",
                "portfolio_id": portfolio_id,
                "target_allocation": target_allocation,
                "tolerance": tolerance,
                "rebalancing_mode": True
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get rebalancing recommendations")
            )
        
        allocation_analysis = result["data"]["analysis"]
        
        # Generate specific rebalancing actions
        rebalancing_actions = []
        current_allocation = allocation_analysis.get("current_allocation", {})
        
        for asset_class, target_percent in target_allocation.items():
            current_percent = current_allocation.get(asset_class, 0)
            diff = current_percent - target_percent
            
            if abs(diff) > tolerance * 100:  # If difference exceeds tolerance
                action = "sell" if diff > 0 else "buy"
                rebalancing_actions.append({
                    "asset_class": asset_class,
                    "action": action,
                    "current_allocation": current_percent,
                    "target_allocation": target_percent,
                    "difference": diff,
                    "priority": "high" if abs(diff) > tolerance * 200 else "medium"
                })
        
        return {
            "portfolio_id": portfolio_id,
            "rebalancing_needed": len(rebalancing_actions) > 0,
            "actions": rebalancing_actions,
            "current_allocation": current_allocation,
            "target_allocation": target_allocation,
            "analysis": allocation_analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting rebalancing recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/risk-adjustments")
async def get_risk_adjustment_recommendations(
    portfolio_id: str,
    target_risk_score: float,
    user_id: str,
    db=Depends(get_db)
):
    """Get recommendations to adjust portfolio risk"""
    try:
        # result = await orchestrator.process_request(...)
        
        request_data = {
            "intent": "analysis",
            "data": {
                "analysis_type": "risk",
                "portfolio_id": portfolio_id,
                "target_risk_score": target_risk_score
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get risk adjustment recommendations")
            )
        
        risk_analysis = result["data"]["analysis"]
        current_risk_score = risk_analysis.get("risk_metrics", {}).get("risk_score", 5)
        
        # Generate risk adjustment recommendations
        adjustments = []
        risk_diff = current_risk_score - target_risk_score
        
        if abs(risk_diff) > 0.5:  # If significant difference
            if risk_diff > 0:  # Need to reduce risk
                adjustments = [
                    {
                        "action": "Increase diversification",
                        "description": "Add uncorrelated assets to reduce portfolio volatility",
                        "priority": "high"
                    },
                    {
                        "action": "Reduce concentration",
                        "description": "Decrease exposure to top holdings",
                        "priority": "medium"
                    },
                    {
                        "action": "Add defensive assets",
                        "description": "Consider adding bonds or cash equivalents",
                        "priority": "medium"
                    }
                ]
            else:  # Need to increase risk
                adjustments = [
                    {
                        "action": "Increase equity exposure",
                        "description": "Add growth-oriented stocks or sectors",
                        "priority": "high"
                    },
                    {
                        "action": "Consider leveraged positions",
                        "description": "Use moderate leverage for enhanced returns",
                        "priority": "low"
                    }
                ]
        
        return {
            "portfolio_id": portfolio_id,
            "current_risk_score": current_risk_score,
            "target_risk_score": target_risk_score,
            "risk_difference": risk_diff,
            "adjustments_needed": len(adjustments) > 0,
            "recommendations": adjustments,
            "risk_analysis": risk_analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting risk adjustment recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/portfolio/{portfolio_id}/goal-based")
async def get_goal_based_recommendations(
    portfolio_id: str,
    financial_goals: List[dict],
    user_id: str,
    db=Depends(get_db)
):
    """Get recommendations based on financial goals"""
    try:
        # result = await orchestrator.process_request(...)
        
        request_data = {
            "intent": "comprehensive",
            "data": {
                "portfolio_id": portfolio_id,
                "financial_goals": financial_goals,
                "goal_based_analysis": True
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get goal-based recommendations")
            )
        
        # Generate goal-specific recommendations
        goal_recommendations = []
        
        for goal in financial_goals:
            goal_type = goal.get("type", "retirement")
            target_amount = goal.get("target_amount", 0)
            timeframe = goal.get("timeframe", 10)
            
            if goal_type == "retirement":
                goal_recommendations.append({
                    "goal": goal,
                    "recommendations": [
                        {
                            "action": "Increase retirement contributions",
                            "description": "Maximize tax-advantaged retirement accounts",
                            "priority": "high"
                        },
                        {
                            "action": "Consider target-date funds",
                            "description": "Automated asset allocation based on retirement timeline",
                            "priority": "medium"
                        }
                    ]
                })
            elif goal_type == "education":
                goal_recommendations.append({
                    "goal": goal,
                    "recommendations": [
                        {
                            "action": "Utilize 529 education savings plans",
                            "description": "Tax-advantaged savings for education expenses",
                            "priority": "high"
                        },
                        {
                            "action": "Balance growth and safety",
                            "description": "Moderate risk approach with education timeline in mind",
                            "priority": "medium"
                        }
                    ]
                })
        
        return {
            "portfolio_id": portfolio_id,
            "financial_goals": financial_goals,
            "goal_recommendations": goal_recommendations,
            "analysis_summary": result.get("summary", {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting goal-based recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/market/opportunities")
async def get_market_opportunities(
    sector: Optional[str] = None,
    risk_level: Optional[str] = None,
    db=Depends(get_db)
):
    """Get current market investment opportunities"""
    try:
        # This would integrate with market analysis tools
        opportunities = [
            {
                "type": "sector_rotation",
                "sector": "Technology",
                "opportunity": "AI and cloud computing stocks showing strong momentum",
                "risk_level": "medium",
                "time_horizon": "6-12 months",
                "confidence": 0.75
            },
            {
                "type": "value_play",
                "sector": "Financial",
                "opportunity": "Banking stocks trading below historical averages",
                "risk_level": "low",
                "time_horizon": "12-24 months",
                "confidence": 0.68
            },
            {
                "type": "growth_story",
                "sector": "Healthcare",
                "opportunity": "Biotech companies with promising pipeline drugs",
                "risk_level": "high",
                "time_horizon": "2-5 years",
                "confidence": 0.62
            }
        ]
        
        # Filter by sector if specified
        if sector and isinstance(sector, str):
            opportunities = [opp for opp in opportunities if opp["sector"].lower() == sector.lower()]
        
        # Filter by risk level if specified
        if risk_level and isinstance(risk_level, str):
            opportunities = [opp for opp in opportunities if opp["risk_level"].lower() == risk_level.lower()]
        
        return {
            "opportunities": opportunities,
            "market_sentiment": "cautiously_optimistic",
            "last_updated": "2024-01-15T10:30:00Z"
        }
        
    except Exception as e:
        logger.error(f"Error getting market opportunities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/tax-optimization")
async def get_tax_optimization_recommendations(
    portfolio_id: str,
    user_id: str,
    tax_year: Optional[int] = None,
    db=Depends(get_db)
):
    """Get tax optimization recommendations for portfolio"""
    try:
        # This would analyze portfolio for tax optimization opportunities
        recommendations = [
            {
                "strategy": "Tax Loss Harvesting",
                "description": "Sell losing positions to offset capital gains",
                "potential_savings": "$2,500",
                "priority": "high",
                "deadline": "Dec 31, 2024"
            },
            {
                "strategy": "Asset Location Optimization",
                "description": "Move tax-inefficient assets to tax-advantaged accounts",
                "potential_savings": "$1,200/year",
                "priority": "medium",
                "deadline": "Ongoing"
            },
            {
                "strategy": "Hold Period Management",
                "description": "Hold investments longer than 1 year for long-term capital gains rates",
                "potential_savings": "$800/year",
                "priority": "low",
                "deadline": "Ongoing"
            }
        ]
        
        return {
            "portfolio_id": portfolio_id,
            "tax_year": tax_year or 2024,
            "recommendations": recommendations,
            "total_potential_savings": "$4,500",
            "next_review_date": "2024-06-30"
        }
        
    except Exception as e:
        logger.error(f"Error getting tax optimization recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
