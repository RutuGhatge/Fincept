from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
import re

from app.agents.base_agent import BaseAgent, AgentInput, AgentOutput
from app.models.news import NewsArticle, NewsCategory
from app.services.news_service import NewsService
from app.tools.news_scraper import NewsScraper
from app.tools.sentiment_analyzer import SentimentAnalyzer

logger = logging.getLogger(__name__)


class NewsAgent(BaseAgent):
    """
    Agent responsible for financial news intelligence including:
    - News fetching and aggregation
    - Portfolio-relevant news filtering
    - Sentiment analysis
    - News summarization
    """
    
    def __init__(self):
        super().__init__(
            name="NewsAgent",
            description="Fetches, filters, and analyzes financial news relevant to user portfolio"
        )
        self.news_service = NewsService()
        self.news_scraper = NewsScraper()
        self.sentiment_analyzer = SentimentAnalyzer()
    
    def get_required_data(self) -> List[str]:
        """Returns required data fields for this agent"""
        return [
            "operation",  # fetch, filter, analyze, summarize
            "user_id"
        ]
    
    def get_output_schema(self) -> Dict[str, Any]:
        """Returns the output schema for this agent"""
        return {
            "articles": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "summary": {"type": "string"},
                        "sentiment_score": {"type": "number"},
                        "relevance_score": {"type": "number"}
                    }
                }
            },
            "sentiment_summary": {
                "type": "object",
                "properties": {
                    "overall_sentiment": {"type": "string"},
                    "sentiment_distribution": {"type": "object"}
                }
            }
        }
    
    async def process(self, input_data: AgentInput) -> AgentOutput:
        """Process news-related requests"""
        try:
            if not await self.validate_input(input_data):
                return AgentOutput(
                    success=False,
                    error="Invalid input data",
                    message="Missing required fields"
                )
            
            operation = input_data.data.get("operation")
            
            # Route to appropriate operation
            if operation == "fetch":
                return await self._fetch_news(input_data)
            elif operation == "filter":
                return await self._filter_news(input_data)
            elif operation == "analyze":
                return await self._analyze_news(input_data)
            elif operation == "summarize":
                return await self._summarize_news(input_data)
            elif operation == "portfolio_news":
                return await self._get_portfolio_news(input_data)
            else:
                return AgentOutput(
                    success=False,
                    error=f"Unknown operation: {operation}",
                    message="Supported operations: fetch, filter, analyze, summarize, portfolio_news"
                )
                
        except Exception as e:
            logger.error(f"NewsAgent error: {e}")
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to process news request"
            )
    
    async def _fetch_news(self, input_data: AgentInput) -> AgentOutput:
        """Fetch latest financial news"""
        try:
            category = input_data.data.get("category", "market_news")
            limit = input_data.data.get("limit", 50)
            
            # Fetch news from various sources
            articles = await self.news_scraper.fetch_news(
                category=category,
                limit=limit,
                hours_back=24
            )
            
            # Store articles in database
            stored_articles = []
            for article_data in articles:
                article = await self.news_service.create_article(article_data)
                stored_articles.append(article.dict())
            
            return AgentOutput(
                success=True,
                data={
                    "articles": stored_articles,
                    "count": len(stored_articles),
                    "category": category
                },
                message=f"Fetched {len(stored_articles)} news articles"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to fetch news"
            )
    
    async def _filter_news(self, input_data: AgentInput) -> AgentOutput:
        """Filter news based on portfolio holdings"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            keywords = input_data.data.get("keywords", [])
            symbols = input_data.data.get("symbols", [])
            
            # Get portfolio holdings if portfolio_id provided
            if portfolio_id:
                # This would fetch from portfolio service
                symbols.extend(["AAPL", "GOOGL", "MSFT"])  # Placeholder
            
            # Filter news based on keywords and symbols
            filtered_articles = await self.news_service.filter_articles(
                keywords=keywords,
                symbols=symbols,
                hours_back=48
            )
            
            return AgentOutput(
                success=True,
                data={
                    "articles": [article.dict() for article in filtered_articles],
                    "count": len(filtered_articles),
                    "filters": {
                        "keywords": keywords,
                        "symbols": symbols
                    }
                },
                message=f"Filtered to {len(filtered_articles)} relevant articles"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to filter news"
            )
    
    async def _analyze_news(self, input_data: AgentInput) -> AgentOutput:
        """Analyze news sentiment and relevance"""
        try:
            article_ids = input_data.data.get("article_ids", [])
            portfolio_symbols = input_data.data.get("portfolio_symbols", [])
            
            # Get articles
            articles = await self.news_service.get_articles_by_ids(article_ids)
            
            analyzed_articles = []
            sentiment_distribution = {"positive": 0, "negative": 0, "neutral": 0}
            
            for article in articles:
                # Perform sentiment analysis
                sentiment_result = await self.sentiment_analyzer.analyze(
                    text=article.content,
                    title=article.title
                )
                
                # Calculate relevance score
                relevance_score = self._calculate_relevance_score(
                    article, portfolio_symbols
                )
                
                # Update article with analysis
                article.sentiment_score = sentiment_result.get("score")
                article.sentiment_label = sentiment_result.get("label")
                article.sentiment_confidence = sentiment_result.get("confidence")
                article.relevance_score = relevance_score
                article.is_processed = True
                
                # Update sentiment distribution
                label = sentiment_result.get("label", "neutral")
                sentiment_distribution[label] = sentiment_distribution.get(label, 0) + 1
                
                # Save updated article
                await self.news_service.update_article(article.id, article.dict())
                analyzed_articles.append(article.dict())
            
            # Calculate overall sentiment
            total_articles = len(analyzed_articles)
            overall_sentiment = max(
                sentiment_distribution.items(), 
                key=lambda x: x[1]
            )[0] if total_articles > 0 else "neutral"
            
            return AgentOutput(
                success=True,
                data={
                    "articles": analyzed_articles,
                    "sentiment_summary": {
                        "overall_sentiment": overall_sentiment,
                        "sentiment_distribution": sentiment_distribution,
                        "total_analyzed": total_articles
                    }
                },
                message=f"Analyzed {total_articles} articles"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to analyze news"
            )
    
    async def _summarize_news(self, input_data: AgentInput) -> AgentOutput:
        """Generate AI summaries for news articles"""
        try:
            article_ids = input_data.data.get("article_ids", [])
            summary_length = input_data.data.get("summary_length", "medium")
            
            # Get articles
            articles = await self.news_service.get_articles_by_ids(article_ids)
            
            summarized_articles = []
            
            for article in articles:
                # Generate summary using AI
                summary = await self._generate_article_summary(
                    article.content,
                    article.title,
                    summary_length
                )
                
                # Update article with summary
                article.summary = summary
                article.is_summarized = True
                
                # Save updated article
                await self.news_service.update_article(article.id, article.dict())
                summarized_articles.append(article.dict())
            
            return AgentOutput(
                success=True,
                data={
                    "articles": summarized_articles,
                    "count": len(summarized_articles)
                },
                message=f"Generated summaries for {len(summarized_articles)} articles"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to summarize news"
            )
    
    async def _get_portfolio_news(self, input_data: AgentInput) -> AgentOutput:
        """Get comprehensive portfolio news feed"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            hours_back = input_data.data.get("hours_back", 24)
            
            # Get portfolio holdings
            # This would fetch from portfolio service
            portfolio_symbols = ["AAPL", "GOOGL", "MSFT", "TSLA"]  # Placeholder
            sectors = ["Technology", "Automotive"]  # Placeholder
            
            # Fetch relevant news
            relevant_articles = await self.news_service.get_portfolio_relevant_news(
                symbols=portfolio_symbols,
                sectors=sectors,
                hours_back=hours_back
            )
            
            # Analyze sentiment and relevance
            analyzed_articles = []
            for article in relevant_articles:
                # Sentiment analysis
                sentiment_result = await self.sentiment_analyzer.analyze(
                    text=article.content,
                    title=article.title
                )
                
                # Relevance scoring
                relevance_score = self._calculate_relevance_score(
                    article, portfolio_symbols, sectors
                )
                
                # Generate summary if not exists
                if not article.summary:
                    summary = await self._generate_article_summary(
                        article.content,
                        article.title,
                        "short"
                    )
                    article.summary = summary
                
                # Update article
                article.sentiment_score = sentiment_result.get("score")
                article.sentiment_label = sentiment_result.get("label")
                article.relevance_score = relevance_score
                
                analyzed_articles.append(article.dict())
            
            # Sort by relevance and sentiment
            analyzed_articles.sort(
                key=lambda x: (x.get("relevance_score", 0), abs(x.get("sentiment_score", 0))),
                reverse=True
            )
            
            # Generate news summary
            news_summary = self._generate_news_summary(analyzed_articles)
            
            return AgentOutput(
                success=True,
                data={
                    "articles": analyzed_articles[:20],  # Top 20 articles
                    "summary": news_summary,
                    "portfolio_id": portfolio_id,
                    "timeframe": f"Last {hours_back} hours"
                },
                message=f"Retrieved {len(analyzed_articles)} relevant articles"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to get portfolio news"
            )
    
    def _calculate_relevance_score(self, article: NewsArticle, 
                                 symbols: List[str], 
                                 sectors: List[str] = None) -> float:
        """Calculate relevance score for an article"""
        score = 0.0
        
        # Check symbol mentions
        article_text = f"{article.title} {article.content}".lower()
        for symbol in symbols:
            if symbol.lower() in article_text:
                score += 0.3
        
        # Check sector mentions
        if sectors:
            for sector in sectors:
                if sector.lower() in article_text:
                    score += 0.2
        
        # Category relevance
        if article.category in [NewsCategory.STOCK_NEWS, NewsCategory.MARKET_NEWS]:
            score += 0.2
        
        # Recency bonus
        hours_ago = (datetime.utcnow() - article.published_at).total_seconds() / 3600
        if hours_ago < 6:
            score += 0.1
        elif hours_ago < 24:
            score += 0.05
        
        return min(1.0, score)
    
    async def _generate_article_summary(self, content: str, title: str, 
                                      length: str) -> str:
        """Generate AI summary for an article"""
        # This would use OpenAI or similar AI service
        # For now, return a simple extractive summary
        
        sentences = content.split('.')
        if length == "short":
            return '. '.join(sentences[:2]) + '.'
        elif length == "medium":
            return '. '.join(sentences[:3]) + '.'
        else:  # long
            return '. '.join(sentences[:5]) + '.'
    
    def _generate_news_summary(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary of news articles"""
        if not articles:
            return {"headline": "No relevant news", "summary": ""}
        
        # Count sentiment distribution
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        mentioned_symbols = set()
        
        for article in articles:
            sentiment = article.get("sentiment_label", "neutral")
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
            mentioned_symbols.update(article.get("mentioned_symbols", []))
        
        # Determine overall sentiment
        overall_sentiment = max(sentiment_counts.items(), key=lambda x: x[1])[0]
        
        # Generate headline
        if overall_sentiment == "positive":
            headline = f"Positive sentiment for {', '.join(list(mentioned_symbols)[:3])}"
        elif overall_sentiment == "negative":
            headline = f"Negative sentiment affecting portfolio holdings"
        else:
            headline = "Mixed sentiment in portfolio-related news"
        
        return {
            "headline": headline,
            "overall_sentiment": overall_sentiment,
            "sentiment_distribution": sentiment_counts,
            "mentioned_symbols": list(mentioned_symbols),
            "article_count": len(articles)
        }
