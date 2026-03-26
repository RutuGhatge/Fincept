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
        elif task_type == "review_and_refine":
            return await self._review_and_refine(data)
        elif task_type == "analyze_geopolitics":
            return await self._analyze_geopolitics(data)
        
        return {"error": "Unknown task type for AnalysisAgent"}

    async def _get_portfolio_insights(self, data: Dict[str, Any]) -> Dict[str, Any]:
        portfolio = data.get("portfolio", [])
        news = data.get("news", [])
        
        portfolio_summary = ", ".join([f"{h.get('symbol') or h.get('name')}: {h.get('market_value', 'N/A')}" for h in portfolio])
        news_titles = [n.get("title") for n in news[:5]]
        
        prompt = f"""
        You are an institutional-grade portfolio auditor.
        Portfolio: {portfolio_summary}
        Recent Context: {news_titles}
        
        Perform a deep health audit and return a JSON object with:
        1. "health_score": Numeric value 0-100.
        2. "risk_level": "Low", "Medium", "High", or "Extreme".
        3. "top_insights": List of 3 key observations.
        4. "sector_allocation_critique": A brief professional observation on their sector exposure.
        5. "action_hints": List of 3 specific, actionable steps.
        6. "reasoning_path": List of 3 logical steps the agent took to reach this audit.
        
        Only return the JSON.
        """
        
        response_text = await self.get_response(prompt)
        try:
            import json, re
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            return json.loads(match.group()) if match else {"error": "Invalid AI format"}
        except Exception as e:
            logger.error(f"Error parsing insights: {e}")
            return {"error": str(e), "raw": response_text}

    async def _review_and_refine(self, data: Dict[str, Any]) -> Dict[str, Any]:
        previous_output = data.get("previous_output")
        original_task = data.get("original_task")
        
        prompt = f"""
        You are acting as a CRITIC and REFINER for a financial AI system.
        
        The system previously generated this output for the task '{original_task}':
        ---
        {previous_output}
        ---
        
        Your goal is to REVIEW this output for:
        1. Logical consistency (no contradictory advice).
        2. Sector accuracy (ensure stocks are mapped to correct sectors).
        3. Strategic depth (ensure recommendations are actionable and not generic).
        4. Tone (must be professional and institutional-grade).
        
        If you find issues, FIX THEM in the final output. If the output is already perfect, return it as is but slightly polished.
        
        Return ONLY the refined final response.
        """
        
        refined_output = await self.get_response(prompt)
        
        # If the original output was a dict, try to maintain structure or just return as is
        if isinstance(previous_output, dict):
            # Attempt to merge or update the main content field
            # This is a bit heuristic, but let's assume the main field is 'insights' or 'impact'
            result = previous_output.copy()
            for key in ["insights", "performance_analysis", "risk_assessment", "geo_news", "portfolio_impact"]:
                if key in result:
                    result[key] = refined_output
            result["refined"] = True
            return result
            
        return {"refined_output": refined_output}

    async def _analyze_geopolitics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        geo_news = data.get("geo_news", [])
        symbols = data.get("symbols", [])
        
        if not geo_news or not symbols:
            return {"portfolio_impact": []}
            
        geo_summary = "\n".join([f"- {g['title']} ({g.get('region','Global')})" for g in geo_news[:8]])
        symbols_str = ", ".join(symbols[:15])
        
        prompt = f"""
        You are a geopolitical risk analyst.
        Portfolio holdings: {symbols_str}
        Current top geopolitical events:
        {geo_summary}
        
        Identify which holdings are genuinely impacted by these events.
        For each impacted holding, explain:
        1. WHY: The causal link (e.g., supply chain, currency, regulation).
        2. HOW: The direction of impact (Positive/Negative/Watch).
        3. ACTION: A 1-sentence suggestion.
        
        Output a JSON array of objects:
        {{
          "symbol": "SYMBOL",
          "holding_name": "Full Name",
          "geo_event": "The Event",
          "impact": "Positive/Negative/Watch",
          "impact_reason": "2-sentence clear explanation",
          "action_hint": "Actionable suggestion"
        }}
        """
        
        response = await self.get_response(prompt)
        import json, re
        match = re.search(r'\[.*\]', response, re.DOTALL)
        result = json.loads(match.group()) if match else []
        
        return {"portfolio_impact": result}

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
