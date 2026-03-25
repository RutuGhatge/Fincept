from app.agents.base_agent import BaseAgent
from typing import Dict, Any, List
import logging
logger = logging.getLogger(__name__)

class JargonAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="JargonAgent", role="Financial Jargon Decoder")


    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        task_type = task.get("type")
        data = task.get("data", {})
        if not isinstance(data, dict):
            data = {"raw_value": data}
        
        if task_type == "explain_term":
            return await self._explain_term(data)
        
        return {"error": "Unknown task type for JargonAgent"}

    async def _explain_term(self, data: Dict[str, Any]) -> Dict[str, Any]:
        term = data.get("term", "").strip()
        if not term:
            return {"error": "No term provided"}
            
        try:
            from app.db.database import get_db
            db = get_db()
            collection = db["jargon"]
            
            # 1. Check DB first (case-insensitive)
            # Use regex for basic fuzzy/case-insensitive match
            import re
            existing = await collection.find_one({"term": re.compile(f"^{re.escape(term)}$", re.IGNORECASE)})
            
            if existing:
                return {
                    "term": existing["term"], 
                    "explanation": existing["definition"],
                    "source": "database"
                }
            
            # 2. Fallback to Gemini
            prompt = f"Explain the financial term '{term}' in simple language that a non-expert can understand. Use analogies if helpful. Keep it concise but informative."
            explanation = await self.get_response(prompt)
            
            # 3. Save to DB for future use
            new_entry = {
                "term": term,
                "definition": explanation,
                "source": "gemini",
                "created_at": None # Could add timestamp here
            }
            await collection.insert_one(new_entry)
            
            return {
                "term": term, 
                "explanation": explanation,
                "source": "gemini_saved"
            }
            
        except Exception as e:
            logger.error(f"Error in JargonAgent: {e}")
            # Even if DB fails, try to return Gemini response
            explanation = await self.get_response(f"Explain financial term: {term}")
            return {"term": term, "explanation": explanation, "source": "fallback_gemini"}
