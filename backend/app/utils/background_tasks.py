"""
Background task utilities using FastAPI's BackgroundTasks
For MVP, we'll use simple in-memory task tracking
"""
import asyncio
import uuid
from typing import Dict, Any, Optional, Callable
from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class BackgroundTaskManager:
    """Simple in-memory background task manager for MVP"""
    
    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.running_tasks: Dict[str, asyncio.Task] = {}
    
    async def run_task(self, func: Callable, *args, **kwargs) -> str:
        """Run a function in background and return task ID"""
        task_id = str(uuid.uuid4())
        
        # Initialize task record
        self.tasks[task_id] = {
            "id": task_id,
            "status": TaskStatus.PENDING,
            "created_at": datetime.utcnow(),
            "started_at": None,
            "completed_at": None,
            "result": None,
            "error": None,
            "progress": 0,
            "message": "Task queued"
        }
        
        # Create and run background task
        async def task_wrapper():
            try:
                # Update status to running
                self.tasks[task_id]["status"] = TaskStatus.RUNNING
                self.tasks[task_id]["started_at"] = datetime.utcnow()
                self.tasks[task_id]["message"] = "Task started"
                
                # Execute the function
                if asyncio.iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)
                
                # Update with success
                self.tasks[task_id]["status"] = TaskStatus.COMPLETED
                self.tasks[task_id]["completed_at"] = datetime.utcnow()
                self.tasks[task_id]["result"] = result
                self.tasks[task_id]["progress"] = 100
                self.tasks[task_id]["message"] = "Task completed successfully"
                
                logger.info(f"Background task {task_id} completed successfully")
                
            except Exception as e:
                # Update with error
                self.tasks[task_id]["status"] = TaskStatus.FAILED
                self.tasks[task_id]["completed_at"] = datetime.utcnow()
                self.tasks[task_id]["error"] = str(e)
                self.tasks[task_id]["message"] = f"Task failed: {str(e)}"
                
                logger.error(f"Background task {task_id} failed: {e}")
            
            finally:
                # Clean up running task reference
                if task_id in self.running_tasks:
                    del self.running_tasks[task_id]
        
        # Start the task
        background_task = asyncio.create_task(task_wrapper())
        self.running_tasks[task_id] = background_task
        
        logger.info(f"Started background task {task_id}")
        return task_id
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task status and details"""
        return self.tasks.get(task_id)
    
    def update_task_progress(self, task_id: str, progress: int, message: str = None):
        """Update task progress (for long-running tasks)"""
        if task_id in self.tasks:
            self.tasks[task_id]["progress"] = min(100, max(0, progress))
            if message:
                self.tasks[task_id]["message"] = message
    
    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task"""
        if task_id in self.running_tasks:
            task = self.running_tasks[task_id]
            task.cancel()
            
            try:
                await task
            except asyncio.CancelledError:
                pass
            
            # Update task status
            if task_id in self.tasks:
                self.tasks[task_id]["status"] = TaskStatus.FAILED
                self.tasks[task_id]["completed_at"] = datetime.utcnow()
                self.tasks[task_id]["error"] = "Task cancelled"
                self.tasks[task_id]["message"] = "Task was cancelled"
            
            del self.running_tasks[task_id]
            logger.info(f"Cancelled background task {task_id}")
            return True
        
        return False
    
    def cleanup_old_tasks(self, hours: int = 24):
        """Clean up tasks older than specified hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        old_task_ids = []
        
        for task_id, task in self.tasks.items():
            if task["created_at"] < cutoff_time:
                old_task_ids.append(task_id)
        
        for task_id in old_task_ids:
            del self.tasks[task_id]
            if task_id in self.running_tasks:
                del self.running_tasks[task_id]
        
        if old_task_ids:
            logger.info(f"Cleaned up {len(old_task_ids)} old tasks")
        
        return len(old_task_ids)
    
    def get_running_tasks_count(self) -> int:
        """Get count of currently running tasks"""
        return len(self.running_tasks)
    
    def get_all_tasks(self) -> Dict[str, Dict[str, Any]]:
        """Get all tasks"""
        return self.tasks.copy()


# Global task manager instance
task_manager = BackgroundTaskManager()


# Common background task functions
async def fetch_market_data_task(symbols: list, task_id: str = None):
    """Background task to fetch market data for multiple symbols"""
    try:
        from app.tools.market_data_tool import MarketDataTool
        market_tool = MarketDataTool()
        
        total_symbols = len(symbols)
        results = {}
        
        for i, symbol in enumerate(symbols):
            # Update progress
            if task_id:
                progress = int((i / total_symbols) * 100)
                task_manager.update_task_progress(
                    task_id, 
                    progress, 
                    f"Fetching data for {symbol}"
                )
            
            # Fetch data
            data = await market_tool.get_price(symbol)
            if data:
                results[symbol] = data
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.1)
        
        return results
        
    except Exception as e:
        logger.error(f"Market data fetch task failed: {e}")
        raise


async def analyze_portfolio_task(portfolio_id: str, analysis_type: str, task_id: str = None):
    """Background task to analyze portfolio"""
    try:
        from app.agents.analysis_agent import AnalysisAgent
        
        agent = AnalysisAgent()
        
        # Update progress
        if task_id:
            task_manager.update_task_progress(task_id, 25, "Initializing analysis")
        
        # Prepare task with correct mapping
        task_mapping = {
            "performance": "analyze_performance",
            "risk": "assess_risk",
            "allocation": "analyze_performance", # Fallback or specific allocation logic
            "recommendation": "provide_recommendations",
            "comprehensive": "analyze_performance" # Usually comprehensive starts with performance
        }
        
        task_type = task_mapping.get(analysis_type, "analyze_performance")
        
        task = {
            "type": task_type,
            "data": {
                "portfolio_id": portfolio_id,
                "analysis_type": analysis_type
            }
        }
        
        if task_id:
            task_manager.update_task_progress(task_id, 50, "Running analysis")
        
        # Run analysis
        result = await agent.process_task(task)
        
        if task_id:
            task_manager.update_task_progress(task_id, 90, "Finalizing results")
        
        return result
        
    except Exception as e:
        logger.error(f"Portfolio analysis task failed: {e}")
        raise


async def fetch_news_task(category: str = "market_news", limit: int = 50, task_id: Optional[str] = None):
    """Background task to fetch news"""
    try:
        from app.tools.news_scraper import NewsScraper
        
        scraper = NewsScraper()
        
        if task_id:
            task_manager.update_task_progress(task_id, 25, "Fetching news articles")
        
        articles = await scraper.fetch_news(category=category, limit=limit)
        
        if task_id:
            task_manager.update_task_progress(task_id, 75, "Processing articles")
        
        # Process and store articles
        from app.services.news_service import NewsService
        news_service = NewsService()
        
        stored_articles = []
        for article_data in articles:
            article = await news_service.create_article(article_data)
            stored_articles.append(article.dict())
        
        return stored_articles
        
    except Exception as e:
        logger.error(f"News fetch task failed: {e}")
        raise
