from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config.settings import settings
from app.db.database import db
from app.routers import portfolio, analysis, news, jargon, recommendations, tasks
from app.agents.orchestrator import AgentOrchestrator

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Investment Intelligence API...")
    await db.connect()
    
    # Initialize agent orchestrator
    app.state.orchestrator = AgentOrchestrator()
    
    logger.info("API startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Investment Intelligence API...")
    await db.disconnect()
    logger.info("API shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-agent AI-powered investment intelligence system",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(news.router, prefix="/api/v1/news", tags=["news"])
app.include_router(jargon.router, prefix="/api/v1/jargon", tags=["jargon"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["background-tasks"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Investment Intelligence API",
        "version": settings.APP_VERSION,
        "status": "active"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        await db.client.admin.command('ping')
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "version": settings.APP_VERSION
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": str(exc) if settings.DEBUG else None}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
