from pymongo import ASCENDING, DESCENDING
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId


from app.models.base import PyObjectId


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    email: str = Field(..., description="User email address")
    name: str = Field(..., description="User full name")
    hashed_password: str = Field(..., description="Hashed password")
    is_active: bool = Field(default=True, description="Whether user is active")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="User preferences")
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
    }


# MongoDB indexes for User collection
USER_INDEXES = [
    ("email", ASCENDING),  # Unique index for email
    ("created_at", DESCENDING),
]
