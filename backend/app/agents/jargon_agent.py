from app.agents.base_agent import BaseAgent
from typing import Dict, Any, List
import logging

class JargonAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="JargonAgent", role="Financial Jargon Decoder")

    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        task_type = task.get("type")
        data = task.get("data")
        
        if task_type == "explain_term":
            return await self._explain_term(data)
        
        return {"error": "Unknown task type for JargonAgent"}

    async def _explain_term(self, data: Dict[str, Any]) -> Dict[str, Any]:
        term = data.get("term")
        prompt = f"Explain the financial term '{term}' in simple language that a non-expert can understand. Use analogies if helpful."
        explanation = await self.get_response(prompt)
        return {"term": term, "explanation": explanation}
