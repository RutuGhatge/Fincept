from app.agents.base_agent import BaseAgent
from typing import Dict, Any, List
import logging

class AnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="AnalysisAgent", role="Financial Analysis and Risk Assessment")

    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        task_type = task.get("type")
        data = task.get("data")
        
        if task_type == "analyze_performance":
            return await self._analyze_performance(data)
        elif task_type == "assess_risk":
            return await self._assess_risk(data)
        elif task_type == "provide_recommendations":
            return await self._provide_recommendations(data)
        
        return {"error": "Unknown task type for AnalysisAgent"}

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
