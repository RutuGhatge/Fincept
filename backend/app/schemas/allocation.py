from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AllocationRequest(BaseModel):
    budget: float
    goal: str  # "short_term" or "long_term"
    age: int
    profession: str
    risk_tolerance: Optional[str] = "medium" # default

class FundSuggestion(BaseModel):
    fund_name: str
    allocation_amount: float
    reason: str

class AllocationResponse(BaseModel):
    suggestions: List[FundSuggestion]
    total_allocated: float
    summary: str
    diversification_score: float # 0 to 1
