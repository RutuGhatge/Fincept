from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Investment Intelligence API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database Settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "investment_intelligence"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Gemini AI Settings
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-pro"
    
    # Simple in-memory caching for MVP
    # For production, consider Redis or dedicated caching solution
    CACHE_TTL_SECONDS: int = 300  # 5 minutes default cache
    
    # External APIs
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None
    
    # CORS Settings
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
