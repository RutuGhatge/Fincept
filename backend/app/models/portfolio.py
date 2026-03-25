from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class AssetType(str, Enum):
    STOCK = "stock"
    MUTUAL_FUND = "mutual_fund"


class Asset(BaseModel):
    symbol: str
    name: str
    quantity: float
    average_price: float
    current_price: Optional[float] = None
    type: str  # stock, crypto, etc.

class Portfolio(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    name: str
    description: Optional[str] = None
    assets: List[Asset] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
