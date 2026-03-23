from pymongo import ASCENDING, DESCENDING
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum


from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate)
                ])
            ]),
            json_schema=core_schema.str_schema(),
            serialization=core_schema.plain_serializer_function_ser_schema(lambda x: str(x))
        )

    @classmethod
    def validate(cls, value):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid objectid")
        return ObjectId(value)


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
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class PortfolioHistory(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    portfolio_id: PyObjectId = Field(..., description="Portfolio ID")
    date: datetime = Field(..., description="Snapshot date")
    total_value: float = Field(..., description="Total portfolio value at snapshot")
    holdings_count: int = Field(..., description="Number of holdings at snapshot")
    daily_return: Optional[float] = Field(None, description="Daily return percentage")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional history metadata")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


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
