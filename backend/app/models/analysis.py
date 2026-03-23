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


class AnalysisType(str, Enum):
    PORTFOLIO_PERFORMANCE = "portfolio_performance"
    RISK_ASSESSMENT = "risk_assessment"
    ASSET_ALLOCATION = "asset_allocation"
    SECTOR_ANALYSIS = "asset_allocation"
    RECOMMENDATION = "recommendation"


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class PortfolioAnalysis(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    portfolio_id: PyObjectId = Field(..., description="Portfolio ID being analyzed")
    user_id: PyObjectId = Field(..., description="User ID who owns the portfolio")
    analysis_type: AnalysisType = Field(..., description="Type of analysis performed")
    status: AnalysisStatus = Field(default=AnalysisStatus.PENDING, description="Analysis status")
    
    # Analysis results
    total_return: Optional[float] = Field(None, description="Total return percentage")
    annualized_return: Optional[float] = Field(None, description="Annualized return")
    volatility: Optional[float] = Field(None, description="Portfolio volatility")
    sharpe_ratio: Optional[float] = Field(None, description="Sharpe ratio")
    beta: Optional[float] = Field(None, description="Portfolio beta")
    max_drawdown: Optional[float] = Field(None, description="Maximum drawdown")
    
    # Asset allocation
    asset_allocation: Dict[str, float] = Field(default_factory=dict, description="Asset allocation percentages")
    sector_allocation: Dict[str, float] = Field(default_factory=dict, description="Sector allocation percentages")
    geographic_allocation: Dict[str, float] = Field(default_factory=dict, description="Geographic allocation")
    
    # Risk metrics
    risk_score: Optional[float] = Field(None, ge=1, le=10, description="Risk score (1-10)")
    risk_factors: List[str] = Field(default_factory=list, description="Identified risk factors")
    
    # Recommendations
    recommendations: List[Dict[str, Any]] = Field(default_factory=list, description="AI-generated recommendations")
    insights: List[str] = Field(default_factory=list, description="Key insights from analysis")
    
    # Metadata
    analysis_period_days: Optional[int] = Field(None, description="Analysis period in days")
    benchmark: Optional[str] = Field(None, description="Benchmark used for comparison")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="Confidence in analysis results")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Analysis creation timestamp")
    started_at: Optional[datetime] = Field(None, description="Analysis start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Analysis completion timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    
    # Error handling
    error_message: Optional[str] = Field(None, description="Error message if analysis failed")
    retry_count: int = Field(default=0, description="Number of retry attempts")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class AgentResponse(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    agent_name: str = Field(..., description="Name of the agent that generated the response")
    request_id: Optional[str] = Field(None, description="Request ID for tracking")
    user_id: PyObjectId = Field(..., description="User ID")
    portfolio_id: Optional[PyObjectId] = Field(None, description="Related portfolio ID")
    
    # Request/Response data
    input_data: Dict[str, Any] = Field(default_factory=dict, description="Input data sent to agent")
    output_data: Dict[str, Any] = Field(default_factory=dict, description="Output data from agent")
    reasoning: Optional[str] = Field(None, description="Agent reasoning process")
    confidence: Optional[float] = Field(None, ge=0, le=1, description="Confidence in response")
    
    # Processing metadata
    processing_time_ms: Optional[int] = Field(None, description="Processing time in milliseconds")
    tokens_used: Optional[int] = Field(None, description="Number of tokens used (if applicable)")
    model_version: Optional[str] = Field(None, description="AI model version used")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Response creation timestamp")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# MongoDB indexes for Analysis collections
PORTFOLIO_ANALYSIS_INDEXES = [
    ("portfolio_id", ASCENDING, "analysis_type", ASCENDING),
    ("user_id", ASCENDING),
    ("status", ASCENDING),
    ("created_at", DESCENDING),
    ("portfolio_id", ASCENDING, "created_at", DESCENDING),
]

AGENT_RESPONSE_INDEXES = [
    ("agent_name", ASCENDING),
    ("user_id", ASCENDING),
    ("portfolio_id", ASCENDING),
    ("request_id", ASCENDING),
    ("created_at", DESCENDING),
]
