from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import logging

from app.schemas.news import (
    NewsArticle, NewsFilter, NewsSummary
)
from app.services.news_service import NewsService
from app.agents.orchestrator import AgentOrchestrator
from app.db.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/latest", response_model=List[NewsArticle])
async def get_latest_news(
    category: Optional[str] = "market_news",
    limit: int = 20,
    hours_back: int = 24,
    db=Depends(get_db)
):
    """Get latest financial news"""
    try:
        # Use orchestrator to fetch news
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "news",
            "data": {
                "operation": "fetch",
                "category": category,
                "limit": limit,
                "hours_back": hours_back
            }
        }
        
        result = await orchestrator.process_request(
            user_id="system",  # System request for general news
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to fetch news")
            )
        
        return result["data"]["news"]["articles"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching latest news: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}", response_model=List[NewsArticle])
async def get_portfolio_news(
    portfolio_id: str,
    user_id: str,
    hours_back: int = 24,
    limit: int = 50,
    db=Depends(get_db)
):
    """Get news relevant to portfolio holdings"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "news",
            "data": {
                "operation": "portfolio_news",
                "portfolio_id": portfolio_id,
                "hours_back": hours_back,
                "limit": limit
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get portfolio news")
            )
        
        return result["data"]["news"]["articles"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting portfolio news: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/portfolio/{portfolio_id}/summary", response_model=NewsSummary)
async def get_portfolio_news_summary(
    portfolio_id: str,
    user_id: str,
    hours_back: int = 24,
    db=Depends(get_db)
):
    """Get portfolio news summary with sentiment analysis"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "news",
            "data": {
                "operation": "portfolio_news",
                "portfolio_id": portfolio_id,
                "hours_back": hours_back,
                "include_summary": True
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get news summary")
            )
        
        return result["data"]["news"]["summary"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting news summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/filter", response_model=List[NewsArticle])
async def filter_news(
    news_filter: NewsFilter,
    user_id: Optional[str] = None,
    db=Depends(get_db)
):
    """Filter news based on criteria"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "news",
            "data": {
                "operation": "filter",
                **news_filter.dict()
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id or "system",
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to filter news")
            )
        
        return result["data"]["news"]["articles"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error filtering news: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/article/{article_id}", response_model=NewsArticle)
async def get_article(
    article_id: str,
    db=Depends(get_db)
):
    """Get a specific news article"""
    try:
        news_service = NewsService()
        article = await news_service.get_article_by_id(article_id)
        
        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found"
            )
        
        return article
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting article: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/article/{article_id}/summarize")
async def summarize_article(
    article_id: str,
    summary_length: str = "medium",
    db=Depends(get_db)
):
    """Generate AI summary for a news article"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "news",
            "data": {
                "operation": "summarize",
                "article_ids": [article_id],
                "summary_length": summary_length
            }
        }
        
        result = await orchestrator.process_request(
            user_id="system",
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to summarize article")
            )
        
        return result["data"]["news"]["articles"][0]  # Return the summarized article
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error summarizing article: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/sentiment/portfolio/{portfolio_id}")
async def get_portfolio_sentiment(
    portfolio_id: str,
    user_id: str,
    hours_back: int = 24,
    db=Depends(get_db)
):
    """Get sentiment analysis for portfolio-related news"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "news",
            "data": {
                "operation": "portfolio_news",
                "portfolio_id": portfolio_id,
                "hours_back": hours_back,
                "include_sentiment": True
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id,
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to get sentiment analysis")
            )
        
        return result["data"]["news"]["sentiment_summary"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting sentiment analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/trending")
async def get_trending_topics(
    category: Optional[str] = None,
    hours_back: int = 6,
    db=Depends(get_db)
):
    """Get trending financial topics"""
    try:
        news_service = NewsService()
        trending = await news_service.get_trending_topics(
            category=category,
            hours_back=hours_back
        )
        
        return trending
        
    except Exception as e:
        logger.error(f"Error getting trending topics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/symbols/{symbol}/news")
async def get_symbol_news(
    symbol: str,
    hours_back: int = 24,
    limit: int = 20,
    db=Depends(get_db)
):
    """Get news for a specific symbol"""
    try:
        news_service = NewsService()
        articles = await news_service.get_symbol_news(
            symbol=symbol.upper(),
            hours_back=hours_back,
            limit=limit
        )
        
        return articles
        
    except Exception as e:
        logger.error(f"Error getting symbol news: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/analyze/batch")
async def analyze_news_batch(
    article_ids: List[str],
    user_id: Optional[str] = None,
    db=Depends(get_db)
):
    """Analyze multiple news articles for sentiment and relevance"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "news",
            "data": {
                "operation": "analyze",
                "article_ids": article_ids
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id or "system",
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to analyze news batch")
            )
        
        return result["data"]["news"]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing news batch: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
