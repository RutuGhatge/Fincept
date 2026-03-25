from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class RecommendationRequest(BaseModel):
    recommendation_type: str = "comprehensive" # e.g., "rebalancing", "growth", "safety"
    risk_tolerance: Optional[str] = "medium"
    investment_horizon: Optional[str] = "long_term"
    financial_goals: Optional[List[str]] = None

class RecommendationItem(BaseModel):
    asset_class: str
    action: str # "buy", "sell", "hold"
    description: str
    priority: str # "high", "medium", "low"

class RecommendationResponse(BaseModel):
    portfolio_id: str
    recommendations: List[Dict[str, Any]] # Flexible for now
    summary: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}
