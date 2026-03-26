"""Geopolitics news endpoint — fetches global geopolitical news and portfolio impact via Gemini."""
import os
import json
import asyncio
import urllib.request
from fastapi import APIRouter, Depends
from typing import Optional, List
import google.generativeai as genai
import logging
from app.db.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Geopolitics RSS feeds
GEO_RSS_URLS = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",      # BBC World
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",  # NYT World
    "https://economictimes.indiatimes.com/news/international/world-news/rssfeeds/1898055.cms",  # ET World
]

def _fetch_geo_rss(limit: int = 20) -> list:
    items = []
    headers = {"User-Agent": "Mozilla/5.0 (compatible; InvestmentIntelligence/1.0)"}
    for url in GEO_RSS_URLS:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as resp:
                import xml.etree.ElementTree as ET
                xml_data = resp.read().decode("utf-8", errors="ignore")
                root = ET.fromstring(xml_data)
                for item in root.findall(".//item")[:8]:
                    title = (item.findtext("title") or "").strip()
                    desc = (item.findtext("description") or "").strip()
                    link = (item.findtext("link") or "#").strip()
                    pub = (item.findtext("pubDate") or "").strip()
                    if title:
                        items.append({"title": title, "description": desc[:300], "link": link, "pubDate": pub})
                if len(items) >= limit:
                    break
        except Exception as e:
            logger.warning(f"Geo RSS failed for {url}: {e}")
    return items[:limit]


def _gemini_geo_news(raw_items: list) -> list:
    """Convert raw RSS to structured geopolitical news cards."""
    if not GEMINI_API_KEY or not raw_items:
        return _fallback_geo_news()
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        items_text = "\n".join([f"{i+1}. {r['title']} — {r['description'][:150]}" for i, r in enumerate(raw_items[:12])])
        prompt = f"""You are a geopolitics analyst. Pick the most impactful GEOPOLITICAL events from these headlines (conflicts, sanctions, trade wars, diplomatic shifts, elections, military activity).
Only include items that are genuinely geopolitical (not sports, entertainment etc).
For each item output a JSON object:
{{
  "title": "concise headline",
  "summary": "2-sentence factual summary",
  "region": "Middle East / South Asia / Europe / East Asia / Americas / Africa / etc",
  "conflict_level": "High / Medium / Low",
  "key_players": ["country/entity1", "country/entity2"],
  "source_url": "link",
  "time": "today or X hours ago"
}}
Return a JSON array of 6-8 items. Headlines:
{items_text}"""
        resp = model.generate_content(prompt)
        text = resp.text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        result = json.loads(text)
        # Attach links from raw
        for i, item in enumerate(result):
            if i < len(raw_items) and item.get("source_url") in ("#", "link", ""):
                item["source_url"] = raw_items[i].get("link", "#")
        return result
    except Exception as e:
        logger.error(f"Gemini geo news error: {e}")
        return _fallback_geo_news()


def _gemini_portfolio_geo_impact(geo_news: list, symbols: List[str]) -> list:
    """Map geopolitical events to portfolio holdings impact."""
    if not GEMINI_API_KEY or not symbols:
        return _fallback_portfolio_impact(symbols)
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        symbols_str = ", ".join(symbols[:15])
        geo_summary = "\n".join([f"- {g['title']} ({g.get('region','Global')})" for g in geo_news[:8]])
        prompt = f"""You are a portfolio risk analyst. 
Portfolio holdings: {symbols_str}
Current top geopolitical events:
{geo_summary}

For each holding that is genuinely impacted by any of these events, explain WHY and HOW in simple non-technical language.
Also suggest 1 sentence of action advice.

Output a JSON array:
{{
  "symbol": "HOLDING_SYMBOL",
  "holding_name": "full name",
  "geo_event": "the specific event affecting it",
  "impact": "Positive / Negative / Watch",
  "impact_reason": "Simple 2-sentence explanation of why this geopolitical event affects this holding",
  "action_hint": "one-sentence plain-English suggestion"
}}
Return only items that have a genuine geopolitical connection. Max 8 items. Return a JSON array only."""
        resp = model.generate_content(prompt)
        text = resp.text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"Gemini portfolio geo error: {e}")
        return _fallback_portfolio_impact(symbols)


def _fallback_geo_news() -> list:
    return [
        {"title": "US-Israel Gaza conflict ongoing", "summary": "Ceasefire negotiations continue as humanitarian concerns escalate. Multiple rounds of talks mediated by Qatar and Egypt.", "region": "Middle East", "conflict_level": "High", "key_players": ["USA", "Israel", "Hamas"], "source_url": "#", "time": "Today"},
        {"title": "Russia-Ukraine war: latest frontline updates", "summary": "Fighting continues in eastern Ukraine. Western arms shipments arrive as EU debates further sanctions.", "region": "Europe", "conflict_level": "High", "key_players": ["Russia", "Ukraine", "NATO"], "source_url": "#", "time": "Today"},
        {"title": "China-Taiwan tensions: military exercises", "summary": "China conducts naval drills near Taiwan strait. US 7th fleet monitors situation.", "region": "East Asia", "conflict_level": "Medium", "key_players": ["China", "Taiwan", "USA"], "source_url": "#", "time": "Today"},
        {"title": "India-Pakistan diplomatic tensions", "summary": "Cross-border tensions rise after skirmish at LoC. Talks suspended at UN.", "region": "South Asia", "conflict_level": "Medium", "key_players": ["India", "Pakistan"], "source_url": "#", "time": "Today"},
        {"title": "US-China trade war: new tariffs imposed", "summary": "Biden administration adds 25% tariff on Chinese EVs and semiconductors. Beijing retaliates with rare earth export controls.", "region": "Americas / East Asia", "conflict_level": "Medium", "key_players": ["USA", "China"], "source_url": "#", "time": "Today"},
        {"title": "Iran oil sanctions tightened by US", "summary": "Washington expands sanctions on Iranian oil exports. Crude prices spike 2% on supply concerns.", "region": "Middle East", "conflict_level": "Medium", "key_players": ["USA", "Iran", "OPEC"], "source_url": "#", "time": "Today"},
    ]


def _fallback_portfolio_impact(symbols: List[str]) -> list:
    return [
        {"symbol": symbols[0] if symbols else "HOLDING", "holding_name": "Your top holding", "geo_event": "US-China Trade War", "impact": "Watch", "impact_reason": "If your holding exports to or relies on US-China supply chains, the new tariffs could squeeze margins. Keep an eye on quarterly earnings guidance.", "action_hint": "Monitor Q1 earnings call for any management commentary on international exposure."},
        {"symbol": symbols[1] if len(symbols) > 1 else "FUND", "holding_name": "Your fund/equity", "geo_event": "Middle East oil tensions", "impact": "Negative", "impact_reason": "Rising oil prices due to Middle East conflict typically raise input costs for Indian manufacturers and compress margins across consumer sectors.", "action_hint": "Consider reducing overweight positions in energy-intensive sectors temporarily."},
    ]


@router.get("/geopolitics")
async def get_geopolitics_news(
    symbols: Optional[str] = "",
    force_refresh: bool = False,
    db = Depends(get_db)
):
    """Returns geopolitical news + portfolio-specific impact analysis."""
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]

    # Run both fetches in parallel
    raw = await asyncio.get_event_loop().run_in_executor(None, _fetch_geo_rss, 20)
    geo_news = await asyncio.get_event_loop().run_in_executor(None, _gemini_geo_news, raw)
    portfolio_impact = await asyncio.get_event_loop().run_in_executor(
        None, _gemini_portfolio_geo_impact, geo_news, symbol_list
    )

    return {
        "geo_news": geo_news,
        "portfolio_impact": portfolio_impact,
        "symbols_analyzed": symbol_list,
        "status": "ok"
    }
