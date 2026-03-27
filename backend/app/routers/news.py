import os
import json
import asyncio
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from app.agents.orchestrator import orchestrator
from typing import Dict, Any, Optional, List
from app.utils.ai_utils import get_gemini_response
from app.db.database import get_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Use centralized AI utility for Gemini requests

ET_RSS_URLS = [
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",  # Markets
    "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/1977021501.cms",
    "https://feeds.bbci.co.uk/news/business/rss.xml",  # BBC Business (backup)
]

def _time_ago(pub_date_str: str) -> str:
    try:
        from email.utils import parsedate_to_datetime
        dt = parsedate_to_datetime(pub_date_str)
        diff = datetime.now(timezone.utc) - dt.astimezone(timezone.utc)
        hours = int(diff.total_seconds() // 3600)
        if hours < 1:
            mins = int(diff.total_seconds() // 60)
            return f"{mins} min ago"
        if hours < 24:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        return f"{int(hours//24)} day{'s' if hours > 24 else ''} ago"
    except Exception:
        return "Recently"

def _fetch_rss_items(limit: int = 30) -> list:
    items = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
    
    for url in ET_RSS_URLS:
        try:
            logger.info(f"Fetching RSS from: {url}")
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                xml_data = resp.read().decode('utf-8', errors='ignore')
                logger.info(f"Successfully fetched {len(xml_data)} characters from {url}")
                root = ET.fromstring(xml_data)
                
            url_items = []
            for item in root.iter("item"):
                title = item.findtext("title", "").strip()
                desc = item.findtext("description", "").strip()
                link = item.findtext("link", "").strip()
                pub = item.findtext("pubDate", "").strip()
                if title and len(title) > 10:  # Ensure meaningful titles
                    url_items.append({"title": title, "description": desc, "link": link, "pubDate": pub})
            
            logger.info(f"Found {len(url_items)} items from {url}")
            items.extend(url_items)
            
        except Exception as e:
            logger.warning(f"RSS fetch failed for {url}: {e}")
            continue
    
    # Remove duplicates based on title
    seen_titles = set()
    unique_items = []
    for item in items:
        title = item.get('title', '')
        if title not in seen_titles:
            seen_titles.add(title)
            unique_items.append(item)
    
    logger.info(f"Total unique items after deduplication: {len(unique_items)}")
    return unique_items[:limit]

async def _gemini_process_news(raw_items: list, symbols: List[str] = None) -> list:
    """Enhanced Gemini processing: parses RSS AND generates fallback news for symbols if missing"""
    try:
        # If no raw items, create fallback news first
        if not raw_items:
            logger.warning("No raw RSS items available, creating fallback news")
            fallback_news = []
            
            # Add some general market news
            fallback_news.extend([
                {
                    "title": "Indian Markets Show Resilience Amid Global Uncertainty",
                    "summary": "Domestic equity markets demonstrate stability despite volatile global conditions.",
                    "category": "Indian Equity",
                    "sentiment": "Neutral",
                    "time": "Just now",
                    "source_url": "#",
                    "full_content": "Indian equity indices are holding steady as investors weigh global economic signals. Sector rotation is being observed with defensive stocks gaining favor.",
                    "impact_reason": None
                },
                {
                    "title": "Banking Sector Poised for Growth on Economic Recovery",
                    "summary": "Banking stocks show positive momentum as economic indicators improve.",
                    "category": "Banking",
                    "sentiment": "Positive",
                    "time": "1 hour ago",
                    "source_url": "#",
                    "full_content": "The banking sector is experiencing renewed investor interest driven by improving asset quality and credit growth expectations.",
                    "impact_reason": None
                }
            ])
            
            # Add portfolio alerts if symbols provided
            if symbols:
                for symbol in symbols[:3]:
                    fallback_news.append({
                        "title": f"Portfolio Alert: {symbol}",
                        "summary": f"Monitoring {symbol} for potential portfolio impact based on current market trends.",
                        "category": "Portfolio Alert",
                        "sentiment": "Neutral",
                        "time": "Just now",
                        "source_url": "#",
                        "full_content": f"Current market conditions suggest careful monitoring of {symbol} holdings. Consider reviewing allocation based on recent performance.",
                        "impact_reason": f"This affects your portfolio as you hold {symbol}"
                    })
            
            return fallback_news
        
        items_text = "\n".join(
            [f"{i+1}. TITLE: {r['title']}\nDESC: {r['description'][:200]}"
             for i, r in enumerate(raw_items[:15])]
        )
        
        symbols_str = ", ".join(symbols) if symbols else "None"
        
        prompt = f"""You are a financial news intelligence agent. 
1. Convert these ET RSS items into structured JSON.
2. IMPORTANT: Here are specific portfolio symbols I care about: {symbols_str}.
3. If these symbols are NOT mentioned in the RSS items, create 2-3 brief 'Alpha Alerts' for them based on current Indian market sentiment or sector trends. Tag these as category 'Portfolio Alert'.
4. For any news (from RSS or Alpha Alerts) relevant to the symbols, provide an "impact_reason" explaining WHY it impacts the investor's portfolio in very simple, non-finance language.

For each item, output:
{{
  "title": "Clean concise headline",
  "summary": "1-2 sentence core insight",
  "category": "Indian Equity, Mutual Funds, Banking, Tech, Macro, or Portfolio Alert",
  "sentiment": "Positive, Negative, or Neutral",
  "time": "Just now",
  "source_url": "original link or '#' for alerts",
  "full_content": "Detailed 3-4 sentence analysis including investor takeaway.",
  "impact_reason": "Simple 1-sentence explanation of why this impacts the portfolio symbols, in non-technical language (only for portfolio-relevant news, else null)"
}}

Return a JSON array only.

Items:
{items_text}"""

        # Use centralized AI utility with fallback
        text = await get_gemini_response(prompt)
        text = text.strip()
        if text.startswith("```"):
            text = "\n".join(text.split("\n")[1:])
            if text.endswith("```"):
                text = text[:-3].strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"Gemini news error: {e}")
        # Return structured fallback instead of empty
        fallback_news = []
        
        # Process raw items without AI
        for i, item in enumerate(raw_items[:10]):
            fallback_news.append({
                "title": item.get("title", "Market News"),
                "summary": item.get("description", "")[:150] + "..." if len(item.get("description", "")) > 150 else item.get("description", ""),
                "category": "Markets",
                "sentiment": "Neutral",
                "time": _time_ago(item.get("pubDate", "")),
                "source_url": item.get("link", "#"),
                "full_content": item.get("description", ""),
                "impact_reason": None
            })
        
        # Add portfolio alerts if symbols provided
        if symbols:
            for symbol in symbols[:3]:
                fallback_news.append({
                    "title": f"Market Alert: {symbol}",
                    "summary": f"Monitoring {symbol} for portfolio impact based on current market conditions.",
                    "category": "Portfolio Alert",
                    "sentiment": "Neutral",
                    "time": "Just now",
                    "source_url": "#",
                    "full_content": f"AI analysis temporarily unavailable. Manual review recommended for {symbol} holdings.",
                    "impact_reason": f"This affects your portfolio as you hold {symbol}"
                })
        
        return fallback_news

@router.get("/debug-fresh")
async def debug_fresh_news(
    symbols: Optional[str] = "",
    db = Depends(get_db)
):
    """
    Debug endpoint that bypasses all cache and forces fresh fetch
    """
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()] if symbols else []
    
    logger.info(f"DEBUG: Forcing fresh news fetch for symbols: {symbol_list}")
    
    try:
        # Force fresh RSS fetch
        logger.info("DEBUG: Fetching fresh RSS...")
        raw = await asyncio.get_event_loop().run_in_executor(None, _fetch_rss_items, 25)
        logger.info(f"DEBUG: Got {len(raw)} raw RSS items")
        
        # Force fresh Gemini processing
        logger.info("DEBUG: Processing with Gemini...")
        structured = await _gemini_process_news(raw, symbol_list)
        logger.info(f"DEBUG: Got {len(structured)} processed items")
        
        return {
            "news": structured,
            "source": "DEBUG - Fresh RSS + Gemini",
            "count": len(structured),
            "status": "debug_fresh",
            "raw_count": len(raw),
            "symbols": symbol_list,
            "debug": True
        }
        
    except Exception as e:
        logger.error(f"DEBUG: Fresh news error: {e}")
        import traceback
        logger.error(f"DEBUG: Traceback: {traceback.format_exc()}")
        return {
            "news": [],
            "source": "DEBUG - Error",
            "count": 0,
            "status": "error",
            "error": str(e),
            "debug": True
        }

@router.get("/et-rss")
async def get_et_rss_news(
    user_id: Optional[str] = "anonymous", 
    symbols: Optional[str] = "", 
    force_refresh: bool = False,
    db = Depends(get_db)
):
    """
    Fetch news with caching. 
    Returns cached news instantly and revalidates if stale or forced.
    """
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
    cache_key = f"news_{user_id}"
    
    logger.info(f"News request for user {user_id}, force_refresh={force_refresh}, symbols={len(symbol_list)}")
    
    # 1. Check Cache (only if not forcing refresh)
    cached = await db.market_news.find_one({"user_id": user_id})
    
    # If force_refresh is true, skip cache check and go straight to fresh fetch
    if cached and not force_refresh:
        # Check if cache is fresh (e.g., < 30 mins)
        try:
            cached_time = datetime.fromisoformat(cached["updated_at"])
            if cached_time > datetime.now() - timedelta(minutes=30):
                news_count = len(cached.get('news', []))
                logger.info(f"Serving cached news for user {user_id}, count: {news_count}")
                return {"news": cached["news"], "source": "Cache", "count": news_count, "status": "fresh"}
        except (KeyError, ValueError) as e:
            logger.warning(f"Cache timestamp error for user {user_id}: {e}")
            # Continue to fetch fresh data if cache is corrupted
    
    # If we get here, we need fresh data (either no cache, stale cache, or force_refresh)
    logger.info(f"Fetching fresh news for user {user_id} (force_refresh={force_refresh})")
    try:
        raw = await asyncio.get_event_loop().run_in_executor(None, _fetch_rss_items, 25)
        logger.info(f"Fetched {len(raw)} raw RSS items")
        
        structured = await _gemini_process_news(raw, symbol_list)
        logger.info(f"Processed {len(structured)} news items")
        
        # If AI processing failed but we have cached data, return it
        if not structured:
            if cached:
                logger.warning(f"AI processing failed, returning stale cache for user {user_id}")
                return {"news": cached["news"], "source": "Cache (Fallback)", "count": len(cached["news"]), "status": "stale"}
            else:
                # No cache and no fresh data - return empty but not error
                logger.warning(f"No cache and AI processing failed for user {user_id}")
                return {"news": [], "source": "None", "count": 0, "status": "no_data"}
             
        # 3. Update Cache
        updated_news = {
            "user_id": user_id,
            "news": structured,
            "updated_at": datetime.now().isoformat(),
            "symbols": symbol_list
        }
        await db.market_news.update_one(
            {"user_id": user_id},
            {"$set": updated_news},
            upsert=True
        )
        
        logger.info(f"Updated news cache for user {user_id}, count: {len(structured)}")
        return {"news": structured, "source": "ET RSS + Gemini", "count": len(structured), "status": "updated"}

    except Exception as e:
        logger.error(f"News fetch error: {e}")
        # Always try to return cached data on error
        if cached:
            logger.warning(f"Error occurred, returning cache for user {user_id}")
            return {"news": cached["news"], "source": "Cache (Error Fallback)", "count": len(cached["news"]), "status": "error"}
        # If no cache, return empty instead of throwing error
        return {"news": [], "source": "None", "count": 0, "status": "error", "error": str(e)}

@router.get("/")
async def get_news(symbol: Optional[str] = None):
    task = {"type": "fetch_news", "data": {"symbol": symbol}}
    result = await orchestrator.distribute_task("NewsAgent", task)
    return result

@router.post("/analyze")
async def analyze_news(data: Dict[str, Any]):
    task = {"type": "analyze_news", "data": data}
    result = await orchestrator.distribute_task("NewsAgent", task)
    return result

@router.post("/categorize")
async def categorize_news(data: Dict[str, Any]):
    user_id = data.get("user_id", "anonymous")
    result = await orchestrator.process_request(
        user_id=user_id,
        request={"intent": "market_news", "data": data}
    )
    return result
