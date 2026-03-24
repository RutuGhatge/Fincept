from pymongo import ASCENDING, DESCENDING
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum


from app.models.base import PyObjectId


class AssetType(str, Enum):
    STOCK = "stock"
    MUTUAL_FUND = "mutual_fund"
    ETF = "etf"
    BOND = "bond"
    CRYPTO = "crypto"
    COMMODITY = "commodity"


class Holding(BaseModel):
    symbol: str = Field(..., description="Asset symbol (e.g., 'AAPL', 'INFY')")
    name: str = Field(..., description="Full asset name")
    asset_type: AssetType = Field(..., description="Type of asset")
    quantity: float = Field(..., gt=0, description="Number of units/shares")
    average_cost: float = Field(..., gt=0, description="Average purchase price per unit")
    current_price: Optional[float] = Field(None, description="Current market price")
    currency: str = Field(default="USD", description="Currency code")
    exchange: Optional[str] = Field(None, description="Exchange name")
    sector: Optional[str] = Field(None, description="Sector/industry")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional asset metadata")
    last_updated: Optional[datetime] = Field(None, description="Last price update timestamp")


class Portfolio(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="User ID who owns this portfolio")
    name: str = Field(..., description="Portfolio name")
    description: Optional[str] = Field(None, description="Portfolio description")
    holdings: List[Holding] = Field(default_factory=list, description="List of holdings")
    total_value: Optional[float] = Field(None, description="Total portfolio value")
    total_invested: Optional[float] = Field(None, description="Total amount invested")
    currency: str = Field(default="USD", description="Base currency for portfolio")
    is_active: bool = Field(default=True, description="Whether portfolio is active")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional portfolio metadata")
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }


class PortfolioHistory(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    portfolio_id: PyObjectId = Field(..., description="Portfolio ID")
    date: datetime = Field(..., description="Snapshot date")
    total_value: float = Field(..., description="Total portfolio value at snapshot")
    holdings_count: int = Field(..., description="Number of holdings at snapshot")
    daily_return: Optional[float] = Field(None, description="Daily return percentage")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional history metadata")
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }


# MongoDB indexes for Portfolio collections
PORTFOLIO_INDEXES = [
    ("user_id", ASCENDING),
    ("is_active", ASCENDING),
    ("created_at", DESCENDING),
    ("user_id", ASCENDING, "is_active", ASCENDING),
]

PORTFOLIO_HISTORY_INDEXES = [
    ("portfolio_id", ASCENDING, "date", DESCENDING),
    ("date", DESCENDING),
]
