from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.portfolio import AssetType


class HoldingCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=100, description="Asset symbol")
    name: str = Field(..., min_length=1, max_length=200, description="Full asset name")
    asset_type: AssetType = Field(..., description="Type of asset")
    quantity: float = Field(..., gt=0, description="Number of units/shares")
    average_cost: float = Field(..., gt=0, description="Average purchase price per unit")
    currency: str = Field(default="USD", min_length=3, max_length=3, description="Currency code")
    exchange: Optional[str] = Field(None, max_length=50, description="Exchange name")
    sector: Optional[str] = Field(None, max_length=100, description="Sector/industry")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional asset metadata")

    @validator('symbol')
    def validate_symbol(cls, v):
        return v.upper().strip()

    @validator('currency')
    def validate_currency(cls, v):
        return v.upper()


class HoldingUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0, description="Number of units/shares")
    average_cost: Optional[float] = Field(None, gt=0, description="Average purchase price per unit")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional asset metadata")


class HoldingResponse(BaseModel):
    symbol: str
    name: str
    asset_type: AssetType
    quantity: float
    average_cost: float
    current_price: Optional[float]
    currency: str
    exchange: Optional[str]
    sector: Optional[str]
    metadata: Dict[str, Any]
    last_updated: Optional[datetime]
    market_value: Optional[float] = Field(None, description="Current market value (quantity * current_price)")
    unrealized_pnl: Optional[float] = Field(None, description="Unrealized P&L")
    unrealized_pnl_percent: Optional[float] = Field(None, description="Unrealized P&L percentage")

    class Config:
        from_attributes = True


class PortfolioCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Portfolio name")
    description: Optional[str] = Field(None, max_length=500, description="Portfolio description")
    currency: str = Field(default="USD", min_length=3, max_length=3, description="Base currency")
    holdings: Optional[List[HoldingCreate]] = Field(default_factory=list, description="Initial holdings")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    @validator('currency')
    def validate_currency(cls, v):
        return v.upper()


class PortfolioUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Portfolio name")
    description: Optional[str] = Field(None, max_length=500, description="Portfolio description")
    currency: Optional[str] = Field(None, min_length=3, max_length=3, description="Base currency")
    is_active: Optional[bool] = Field(None, description="Whether portfolio is active")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class PortfolioFileResponse(BaseModel):
    id: str
    filename: str
    upload_date: datetime
    holdings_count: int

    class Config:
        from_attributes = True


class PortfolioResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    holdings: List[HoldingResponse]
    total_value: Optional[float]
    total_invested: Optional[float]
    currency: str = "INR"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    files: List[PortfolioFileResponse] = []
    
    # Computed fields
    total_return: Optional[float] = Field(None, description="Total return amount")
    total_return_percent: Optional[float] = Field(None, description="Total return percentage")
    daily_change: Optional[float] = Field(None, description="Daily change amount")
    daily_change_percent: Optional[float] = Field(None, description="Daily change percentage")

    class Config:
        from_attributes = True


class PortfolioSummary(BaseModel):
    id: str
    name: str
    currency: str
    total_value: Optional[float]
    total_invested: Optional[float]
    holdings_count: int
    daily_change: Optional[float]
    daily_change_percent: Optional[float]
    total_return_percent: Optional[float]
    last_updated: Optional[datetime]

    class Config:
        from_attributes = True


class AddHoldingRequest(BaseModel):
    holding: HoldingCreate = Field(..., description="Holding to add")


class RemoveHoldingRequest(BaseModel):
    symbol: str = Field(..., description="Symbol of holding to remove")


class UpdateHoldingRequest(BaseModel):
    symbol: str = Field(..., description="Symbol of holding to update")
    updates: HoldingUpdate = Field(..., description="Updates to apply")


class PortfolioAnalytics(BaseModel):
    portfolio_id: str
    total_value: float
    asset_allocation: Dict[str, float]
    sector_allocation: Dict[str, float]
    top_holdings: List[Dict[str, Any]]
    performance_metrics: Dict[str, float]
    risk_metrics: Dict[str, Any]
    
    class Config:
        from_attributes = True
