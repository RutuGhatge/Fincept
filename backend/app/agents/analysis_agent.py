from app.agents.base_agent import BaseAgent
from typing import Dict, Any, List
import logging
logger = logging.getLogger(__name__)

class AnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="AnalysisAgent", role="Financial Analysis and Risk Assessment")


    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        task_type = task.get("type")
        data = task.get("data", {})
        if not isinstance(data, dict):
            data = {"raw_value": data}
        
        if task_type == "analyze_performance":
            return await self._analyze_performance(data)
        elif task_type == "assess_risk":
            return await self._assess_risk(data)
        elif task_type == "provide_recommendations":
            return await self._provide_recommendations(data)
        elif task_type == "allocate_budget":
            return await self._allocate_budget(data)
        elif task_type == "get_portfolio_insights":
            return await self._get_portfolio_insights(data)
        
        return {"error": "Unknown task type for AnalysisAgent"}

    async def _get_portfolio_insights(self, data: Dict[str, Any]) -> Dict[str, Any]:
        portfolio = data.get("portfolio", [])
        news = data.get("news", [])
        
        portfolio_summary = ", ".join([f"{h.get('symbol') or h.get('name')}: {h.get('market_value', 'N/A')}" for h in portfolio])
        news_titles = [n.get("title") for n in news[:5]]
        
        prompt = f"""
        Provide deep financial insights for a portfolio containing: {portfolio_summary}.
        Consider this recent market news: {news_titles}.
        
        Your response should include:
        1. Current health of the portfolio.
        2. Potential risks based on market news.
        3. Strategic recommendations for the next 3-6 months.
        
        Keep it professional and data-driven.
        """
        
        insights = await self.get_response(prompt)
        return {"insights": insights}

    async def _allocate_budget(self, data: Dict[str, Any]) -> Dict[str, Any]:
        budget = data.get("budget")
        goal = data.get("goal")
        age = data.get("age")
        profession = data.get("profession")
        portfolio = data.get("portfolio", []) # Current holdings
        
        portfolio_summary = ""
        if portfolio:
            portfolio_summary = "Current Portfolio: " + ", ".join([f"{p.get('symbol') or p.get('name')}: {p.get('market_value', 'N/A')}" for p in portfolio])
        else:
            portfolio_summary = "Current Portfolio: Empty"

        prompt = f"""
        As an expert financial advisor, suggest how to allocate a budget of {budget} INR for an investor with the following profile:
        - Age: {age}
        - Profession: {profession}
        - Goal: {goal}
        {portfolio_summary}
        
        Provide your suggestions in a structured JSON format with:
        1. suggestions: A list of objects with fund_name, allocation_amount, and reason.
        2. total_allocated: Total sum of allocated amounts.
        3. summary: A brief explanation of the strategy.
        4. diversification_score: A score from 0.0 to 1.0.
        
        Only return the JSON.
        """
        
        response_text = await self.get_response(prompt)
        
        # Parse JSON from response
        try:
            import json
            import re
            # Find JSON block if Gemini adds markdown
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                return result
            else:
                return {"error": "Could not parse AI response", "raw_response": response_text}
        except Exception as e:
            logger.error(f"Error parsing allocation response: {e}")
            return {"error": "Failed to generate allocation suggestions", "raw_response": response_text}

    async def _analyze_performance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Analyze the performance of this portfolio: {data.get('portfolio_performance')}. Identify key drivers of returns and areas for improvement."
        analysis = await self.get_response(prompt)
        return {"performance_analysis": analysis}

    async def _assess_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Assess the risk profile of this portfolio: {data.get('portfolio_assets')}. Consider market volatility, sector concentration, and individual asset risks."
        risk_assessment = await self.get_response(prompt)
        return {"risk_assessment": risk_assessment}

    async def _provide_recommendations(self, data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Based on the analysis of {data.get('analysis_data')} and the user's risk tolerance of {data.get('risk_tolerance')}, provide strategic investment recommendations."
        recommendations = await self.get_response(prompt)
        return {"recommendations": recommendations}
