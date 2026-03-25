import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class HoldingType:
    symbol: str
    name: str
    asset_type: str
    quantity: float
    average_cost: float
    current_price: Optional[float] = None
    currency: str = "USD"
    market_value: Optional[float] = None

@strawberry.type
class PortfolioType:
    id: str
    user_id: str
    name: str
    description: Optional[str]
    holdings: List[HoldingType]
    total_value: Optional[float] = None
    total_invested: Optional[float] = None
    currency: str = "USD"
    is_active: bool = True
    updated_at: Optional[str] = None
    created_at: Optional[str] = None

@strawberry.type
class NewsItemType:
    category: str
    title: str
    summary: str
    sentiment: str
    time: str

@strawberry.type
class GlossaryItemType:
    id: Optional[str] = None
    term: str
    short: str
    long: str
    category: str
    example: Optional[str] = None

@strawberry.type
class AnalysisResultType:
    success: bool
    summary: Optional[str] = None
    data: Optional[strawberry.scalars.JSON] = None
    metadata: Optional[strawberry.scalars.JSON] = None

@strawberry.type
class RecommendationType:
    portfolio_id: str
    recommendations: List[strawberry.scalars.JSON]
    summary: Optional[strawberry.scalars.JSON] = None
    metadata: Optional[strawberry.scalars.JSON] = None
