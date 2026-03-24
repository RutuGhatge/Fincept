from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class MarketData(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: Optional[int] = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class PortfolioAnalysis(BaseModel):
    portfolio_id: str
    performance_summary: str
    risk_score: float
    recommendations: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NewsItem(BaseModel):
    title: str
    url: str
    summary: str
    sentiment: str  # positive, negative, neutral
    published_at: datetime
