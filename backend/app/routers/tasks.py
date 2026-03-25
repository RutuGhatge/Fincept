"""
Background task management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import List, Optional
import logging

from app.utils.background_tasks import task_manager, fetch_market_data_task, analyze_portfolio_task, fetch_news_task
from app.db.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/market-data/fetch")
async def start_market_data_fetch(
    symbols: List[str],
    background_tasks: BackgroundTasks,
    db=Depends(get_db)
):
    """Start background task to fetch market data for symbols"""
    try:
        if not symbols:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Symbols list cannot be empty"
            )
        
        # Start background task
        task_id = await task_manager.run_task(fetch_market_data_task, symbols)
        
        return {
            "task_id": task_id,
            "message": f"Started fetching market data for {len(symbols)} symbols",
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"Error starting market data fetch: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/portfolio/{portfolio_id}/analyze")
async def start_portfolio_analysis(
    portfolio_id: str,
    analysis_type: str,
    background_tasks: BackgroundTasks,
    db=Depends(get_db)
):
    """Start background task to analyze portfolio"""
    try:
        valid_types = ["performance", "risk", "allocation", "comprehensive", "recommendation"]
        if analysis_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid analysis type. Must be one of: {valid_types}"
            )
        
        # Start background task
        task_id = await task_manager.run_task(
            analyze_portfolio_task, 
            portfolio_id, 
            analysis_type
        )
        
        return {
            "task_id": task_id,
            "portfolio_id": portfolio_id,
            "analysis_type": analysis_type,
            "message": f"Started {analysis_type} analysis for portfolio {portfolio_id}",
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"Error starting portfolio analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/news/fetch")
async def start_news_fetch(
    background_tasks: BackgroundTasks,
    category: str = "market_news",
    limit: int = 50,
    db=Depends(get_db)
):
    """Start background task to fetch news"""
    try:
        valid_categories = ["market_news", "stock_news", "economic", "policy", "sector"]
        if category not in valid_categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category. Must be one of: {valid_categories}"
            )
        
        # Start background task
        task_id = await task_manager.run_task(fetch_news_task, category, limit)
        
        return {
            "task_id": task_id,
            "category": category,
            "limit": limit,
            "message": f"Started fetching {category} news",
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"Error starting news fetch: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/task/{task_id}")
async def get_task_status(
    task_id: str,
    db=Depends(get_db)
):
    """Get status of a background task"""
    try:
        task = task_manager.get_task_status(task_id)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return task
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting task status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/task/{task_id}")
async def cancel_task(
    task_id: str,
    db=Depends(get_db)
):
    """Cancel a running background task"""
    try:
        success = await task_manager.cancel_task(task_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or not running"
            )
        
        return {
            "task_id": task_id,
            "message": "Task cancelled successfully",
            "status": "cancelled"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/tasks")
async def get_all_tasks(
    limit: int = 50,
    status: Optional[str] = None,
    db=Depends(get_db)
):
    """Get all background tasks with optional status filter"""
    try:
        all_tasks = task_manager.get_all_tasks()
        
        # Filter by status if provided
        if status:
            all_tasks = {
                task_id: task for task_id, task in all_tasks.items()
                if task["status"] == status
            }
        
        # Sort by creation time (newest first) and limit
        sorted_tasks = sorted(
            all_tasks.items(),
            key=lambda x: x[1]["created_at"],
            reverse=True
        )
        
        return {
            "tasks": dict(sorted_tasks[:limit]),
            "total_count": len(sorted_tasks),
            "filtered_count": len(all_tasks),
            "running_count": task_manager.get_running_tasks_count()
        }
        
    except Exception as e:
        logger.error(f"Error getting tasks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/cleanup")
async def cleanup_old_tasks(
    hours: int = 24,
    db=Depends(get_db)
):
    """Clean up old tasks"""
    try:
        cleaned_count = task_manager.cleanup_old_tasks(hours)
        
        return {
            "cleaned_count": cleaned_count,
            "hours": hours,
            "message": f"Cleaned up {cleaned_count} tasks older than {hours} hours"
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up tasks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
