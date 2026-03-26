from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import json

class Settings(BaseSettings):
    PROJECT_NAME: str = "Investment Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB (Handles both MONGODB_URL and MONGO_URL for deployment compatibility)
    MONGODB_URL: Optional[str] = None
    MONGO_URL: Optional[str] = None
    DATABASE_NAME: str = "investment_intelligence"
    
    # AI Keys
    # Note: .env uses GEMINI_API_KEY, but code uses GOOGLE_API_KEY in some places.
    # We'll allow both or map one to the other.
    GOOGLE_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_FALLBACK_MODELS: List[str] = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite-001", "gemini-2.5-pro"]
    
    # Financial Data APIs
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    NEWS_API_KEY: Optional[str] = None
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["*", "https://fincept.vercel.app"]
    
    # Cache
    CACHE_ENABLED: bool = True
    CACHE_EXPIRATION: int = 3600  # 1 hour
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra="ignore")

    def __init__(self, **values):
        super().__init__(**values)
        
        # Mapping MONGO_URL/MONGODB_URL for platform compatibility
        mongo_url = self.MONGODB_URL or self.MONGO_URL or "mongodb://localhost:27017"
        self.MONGODB_URL = mongo_url
        
        # Mapping GEMINI_API_KEY/GOOGLE_API_KEY
        if self.GEMINI_API_KEY and not self.GOOGLE_API_KEY:
            self.GOOGLE_API_KEY = self.GEMINI_API_KEY
            
        # Robust CORS Origin parsing
        current_origins = self.ALLOWED_ORIGINS
        if isinstance(current_origins, str):
            val = current_origins.strip()
            if val.startswith("[") and val.endswith("]"):
                try:
                    self.ALLOWED_ORIGINS = json.loads(val)
                except:
                    self.ALLOWED_ORIGINS = [val.strip("[]'\" ")]
            elif "," in val:
                self.ALLOWED_ORIGINS = [o.strip() for o in val.split(",")]
            else:
                self.ALLOWED_ORIGINS = [val] if val else ["*"]
        
        # Ensure we always have at least a list of one string if empty
        if not self.ALLOWED_ORIGINS:
            self.ALLOWED_ORIGINS = ["*"]

settings = Settings()
