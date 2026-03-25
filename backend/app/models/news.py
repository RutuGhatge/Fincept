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


class NewsCategory(str, Enum):
    MARKET_NEWS = "market_news"
    STOCK_NEWS = "stock_news"
    ECONOMIC = "economic"
    POLICY = "policy"
    SECTOR = "sector"
    COMPANY = "company"
    CRYPTOCURRENCY = "cryptocurrency"
    COMMODITIES = "commodities"


class NewsSource(BaseModel):
    name: str = Field(..., description="Source name")
    url: Optional[str] = Field(None, description="Source URL")
    reliability_score: Optional[float] = Field(None, ge=0, le=1, description="Source reliability score")


class NewsArticle(BaseModel):
    title: str = Field(..., description="Article title")
    content: str = Field(..., description="Article content/full text")
    source: NewsSource = Field(..., description="News source information")
    url: str = Field(..., description="Article URL")
    category: NewsCategory = Field(..., description="News category")
    published_at: datetime = Field(..., description="Publication timestamp")
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    summary: Optional[str] = Field(None, description="AI-generated summary")
    author: Optional[str] = Field(None, description="Article author")
    tags: List[str] = Field(default_factory=list, description="Article tags")
    mentioned_symbols: List[str] = Field(default_factory=list, description="Stock symbols mentioned")
    mentioned_companies: List[str] = Field(default_factory=list, description="Company names mentioned")
    
    # Sentiment analysis
    sentiment_score: Optional[float] = Field(None, ge=-1, le=1, description="Sentiment score (-1 to 1)")
    sentiment_label: Optional[str] = Field(None, description="Sentiment label (positive, negative, neutral)")
    sentiment_confidence: Optional[float] = Field(None, ge=0, le=1, description="Confidence in sentiment analysis")
    
    # Relevance scoring
    relevance_score: Optional[float] = Field(None, ge=0, le=1, description="Relevance to user portfolio")
    relevance_factors: List[str] = Field(default_factory=list, description="Factors contributing to relevance")
    
    # Metadata
    published_at: datetime = Field(..., description="Publication timestamp")
    scraped_at: datetime = Field(default_factory=datetime.utcnow, description="Scraping timestamp")
    last_updated: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    word_count: Optional[int] = Field(None, description="Article word count")
    read_time_minutes: Optional[int] = Field(None, description="Estimated reading time in minutes")
    
    # Processing flags
    is_processed: bool = Field(default=False, description="Whether article has been processed by AI")
    is_summarized: bool = Field(default=False, description="Whether article has been summarized")
    processing_error: Optional[str] = Field(None, description="Error during processing")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserNewsFeed(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="User ID")
    article_id: PyObjectId = Field(..., description="News article ID")
    
    # User interaction
    is_read: bool = Field(default=False, description="Whether user has read the article")
    is_bookmarked: bool = Field(default=False, description="Whether user has bookmarked the article")
    user_rating: Optional[int] = Field(None, ge=1, le=5, description="User rating (1-5)")
    user_notes: Optional[str] = Field(None, description="User notes on the article")
    
    # Personalization
    personalized_relevance: Optional[float] = Field(None, ge=0, le=1, description="Personalized relevance score")
    recommendation_reason: Optional[str] = Field(None, description="Why this was recommended")
    
    # Timestamps
    added_at: datetime = Field(default_factory=datetime.utcnow, description="When added to feed")
    read_at: Optional[datetime] = Field(None, description="When user read the article")
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# MongoDB indexes for News collections
NEWS_ARTICLE_INDEXES = [
    ("published_at", DESCENDING),
    ("category", ASCENDING),
    ("mentioned_symbols", ASCENDING),
    ("sentiment_score", DESCENDING),
    ("is_processed", ASCENDING),
    ("source.name", ASCENDING),
    ("published_at", DESCENDING, "category", ASCENDING),
]

USER_NEWS_FEED_INDEXES = [
    ("user_id", ASCENDING, "added_at", DESCENDING),
    ("user_id", ASCENDING, "is_read", ASCENDING),
    ("user_id", ASCENDING, "is_bookmarked", ASCENDING),
    ("added_at", DESCENDING),
]
