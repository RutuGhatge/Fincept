from app.agents.base_agent import BaseAgent
from typing import Dict, Any, List
import logging
logger = logging.getLogger(__name__)

class NewsAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="NewsAgent", role="Financial News Analyst")


    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        task_type = task.get("type")
        data = task.get("data", {})
        if not isinstance(data, dict):
            data = {"raw_value": data}
        
        if task_type == "fetch_news":
            return await self._fetch_and_filter_news(data)
        elif task_type == "analyze_news":
            return await self._analyze_news_impact(data)
        
        return {"error": "Unknown task type for NewsAgent"}

    async def _fetch_and_filter_news(self, data: Dict[str, Any]) -> Dict[str, Any]:
        from app.tools.news_scraper import NewsScraper
        scraper = NewsScraper()
        
        portfolio = data.get("portfolio", [])
        news_items = await scraper.fetch_news()
        
        if not portfolio or not news_items:
            return {"news": news_items, "summary": "No portfolio found, showing general market news."}
            
        try:
            # Categorize using AI
            holdings = [h.get("symbol") or h.get("name") for h in portfolio]
            titles = [item.get("title") for item in news_items[:15]] # Limit to avoid token blast
            
            prompt = f"""
            Identify which of these news titles are most relevant to an investor holding: {holdings}.
            News: {titles}
            
            Return a JSON list of objects: {{"title": "...", "importance": "High/Medium/Low", "reason": "..."}}.
            Only return the JSON.
            """
            
            ai_response = await self.get_response(prompt)
            
            # Simple parsing
            import json, re
            match = re.search(r'\[.*\]', ai_response, re.DOTALL)
            categories = json.loads(match.group()) if match else []
            
            # Map categories back to news items
            cat_map = {c.get("title"): c for c in categories}
            for item in news_items:
                item_cat = cat_map.get(item.get("title"), {})
                item["importance"] = item_cat.get("importance", "Low")
                item["relevance_reason"] = item_cat.get("reason", "General market news")

            # Sort by importance
            importance_order = {"High": 0, "Medium": 1, "Low": 2}
            news_items.sort(key=lambda x: importance_order.get(x.get("importance", "Low"), 3))
            
            return {
                "news": news_items,
                "portfolio_context": True
            }
        except Exception as e:
            logger.error(f"Error categorizing news: {e}")
            return {"news": news_items, "error": str(e)}

    async def _analyze_news_impact(self, data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Analyze the impact of these news items: {data.get('news_items')} on the following assets: {data.get('assets')}."
        analysis = await self.get_response(prompt)
        return {"news_impact_analysis": analysis}
