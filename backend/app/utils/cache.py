"""
Simple in-memory cache for MVP
For production, replace with Redis or dedicated caching solution
"""
import time
from typing import Any, Optional, Dict
from threading import Lock
import logging

logger = logging.getLogger(__name__)


class SimpleCache:
    """Simple thread-safe in-memory cache with TTL"""
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = Lock()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        with self._lock:
            if key in self._cache:
                item = self._cache[key]
                if time.time() < item["expires_at"]:
                    return item["value"]
                else:
                    # Expired, remove it
                    del self._cache[key]
                    logger.debug(f"Cache expired for key: {key}")
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """Set value in cache with TTL"""
        with self._lock:
            self._cache[key] = {
                "value": value,
                "expires_at": time.time() + ttl_seconds
            }
            logger.debug(f"Cached key: {key}, TTL: {ttl_seconds}s")
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                logger.debug(f"Deleted cache key: {key}")
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cache"""
        with self._lock:
            count = len(self._cache)
            self._cache.clear()
            logger.debug(f"Cleared {count} cache entries")
    
    def cleanup_expired(self) -> int:
        """Remove expired entries and return count of removed items"""
        current_time = time.time()
        expired_keys = []
        
        with self._lock:
            for key, item in self._cache.items():
                if current_time >= item["expires_at"]:
                    expired_keys.append(key)
            
            for key in expired_keys:
                del self._cache[key]
        
        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
        
        return len(expired_keys)
    
    def size(self) -> int:
        """Get current cache size"""
        with self._lock:
            return len(self._cache)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            return {
                "size": len(self._cache),
                "keys": list(self._cache.keys())
            }


# Global cache instance
cache = SimpleCache()


def cache_key(*args, **kwargs) -> str:
    """Generate cache key from arguments"""
    key_parts = [str(arg) for arg in args]
    key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
    return ":".join(key_parts)


def cached(ttl_seconds: int = 300):
    """Decorator for caching function results"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key
            key = cache_key(func.__name__, *args, **kwargs)
            
            # Try to get from cache
            result = cache.get(key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(key, result, ttl_seconds)
            return result
        
        return wrapper
    return decorator
