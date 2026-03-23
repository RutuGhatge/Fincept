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


class MarketData(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    symbol: str = Field(..., description="Asset symbol")
    name: str = Field(..., description="Full asset name")
    asset_type: AssetType = Field(..., description="Type of asset")
    exchange: Optional[str] = Field(None, description="Exchange name")
    currency: str = Field(default="USD", description="Currency code")
    current_price: float = Field(..., gt=0, description="Current market price")
    previous_close: Optional[float] = Field(None, description="Previous closing price")
    day_change: Optional[float] = Field(None, description="Day change amount")
    day_change_percent: Optional[float] = Field(None, description="Day change percentage")
    volume: Optional[int] = Field(None, description="Trading volume")
    market_cap: Optional[float] = Field(None, description="Market capitalization")
    pe_ratio: Optional[float] = Field(None, description="Price-to-earnings ratio")
    dividend_yield: Optional[float] = Field(None, description="Dividend yield")
    sector: Optional[str] = Field(None, description="Sector/industry")
    country: Optional[str] = Field(None, description="Country of origin")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional market data")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class PriceHistory(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    symbol: str = Field(..., description="Asset symbol")
    date: datetime = Field(..., description="Price date")
    open_price: float = Field(..., gt=0, description="Opening price")
    high_price: float = Field(..., gt=0, description="Highest price")
    low_price: float = Field(..., gt=0, description="Lowest price")
    close_price: float = Field(..., gt=0, description="Closing price")
    volume: Optional[int] = Field(None, description="Trading volume")
    adjusted_close: Optional[float] = Field(None, description="Adjusted closing price")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class MutualFundNAV(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    scheme_code: str = Field(..., description="Mutual fund scheme code")
    scheme_name: str = Field(..., description="Mutual fund scheme name")
    nav: float = Field(..., gt=0, description="Net Asset Value")
    nav_date: datetime = Field(..., description="NAV date")
    fund_house: str = Field(..., description="Fund house name")
    fund_type: Optional[str] = Field(None, description="Fund type (equity, debt, hybrid)")
    category: Optional[str] = Field(None, description="Fund category")
    aum: Optional[float] = Field(None, description="Assets under management")
    expense_ratio: Optional[float] = Field(None, description="Expense ratio")
    risk_level: Optional[str] = Field(None, description="Risk level")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional fund metadata")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# MongoDB indexes for Market Data collections
MARKET_DATA_INDEXES = [
    ("symbol", ASCENDING),
    ("asset_type", ASCENDING),
    ("last_updated", DESCENDING),
    ("symbol", ASCENDING, "last_updated", DESCENDING),
]

PRICE_HISTORY_INDEXES = [
    ("symbol", ASCENDING, "date", DESCENDING),
    ("date", DESCENDING),
]

MUTUAL_FUND_NAV_INDEXES = [
    ("scheme_code", ASCENDING, "nav_date", DESCENDING),
    ("nav_date", DESCENDING),
    ("fund_house", ASCENDING),
]
