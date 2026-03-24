from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import portfolio, analysis, news, jargon
from app.db.database import connect_to_mongo, close_mongo_connection
from app.config.settings import settings
import logging

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and Shutdown events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Root API
@app.get("/")
def read_root():
    return {
        "message": "Investment Intelligence API",
        "version": settings.VERSION,
        "status": "active"
    }

# Include routers
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(news.router, prefix="/api/v1/news", tags=["news"])
app.include_router(jargon.router, prefix="/api/v1/jargon", tags=["jargon"])
