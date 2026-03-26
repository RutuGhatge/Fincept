import os
import json
import asyncio
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from app.agents.orchestrator import orchestrator
from typing import Dict, Any, Optional, List
import google.generativeai as genai
import logging
from app.db.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

ET_RSS_URLS = [
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",  # Markets
    "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/1977021501.cms",
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
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                xml_data = resp.read().decode('utf-8', errors='ignore')
                root = ET.fromstring(xml_data)
            for item in root.iter("item"):
                title = item.findtext("title", "").strip()
                desc = item.findtext("description", "").strip()
                link = item.findtext("link", "").strip()
                pub = item.findtext("pubDate", "").strip()
                if title:
                    items.append({"title": title, "description": desc, "link": link, "pubDate": pub})
        except Exception as e:
            logger.warning(f"RSS fetch failed for {url}: {e}")
    return items[:limit]

def _gemini_process_news(raw_items: list, symbols: List[str] = None) -> list:
    """Enhanced Gemini processing: parses RSS AND generates fallback news for symbols if missing"""
    if not GEMINI_API_KEY:
        return []
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
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

        resp = model.generate_content(prompt)
        text = resp.text.strip()
        if text.startswith("```"):
            text = "\n".join(text.split("\n")[1:])
            if text.endswith("```"):
                text = text[:-3].strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"Gemini news error: {e}")
        return []

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
    
    # 1. Check Cache
    cached = await db.market_news.find_one({"user_id": user_id})
    if cached and not force_refresh:
        # Check if cache is fresh (e.g., < 30 mins)
        if datetime.fromisoformat(cached["updated_at"]) > datetime.now() - timedelta(minutes=30):
            return {"news": cached["news"], "source": "Cache", "count": len(cached["news"]), "status": "fresh"}

    # 2. Revalidate/Refresh (Background usually, but here we'll wait since user wants latest)
    try:
        raw = await asyncio.get_event_loop().run_in_executor(None, _fetch_rss_items, 25)
        structured = await asyncio.get_event_loop().run_in_executor(None, _gemini_process_news, raw, symbol_list)
        
        if not structured and cached:
             return {"news": cached["news"], "source": "Cache (Fallback)", "count": len(cached["news"]), "status": "stale"}
             
        if not structured:
            raise HTTPException(status_code=503, detail="Could not retrieve intelligent news at this time.")

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
        
        return {"news": structured, "source": "ET RSS + Gemini", "count": len(structured), "status": "updated"}

    except Exception as e:
        logger.error(f"News fetch error: {e}")
        if cached:
            return {"news": cached["news"], "source": "Cache (Error Fallback)", "count": len(cached["news"]), "status": "error"}
        raise HTTPException(status_code=500, detail=str(e))

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
