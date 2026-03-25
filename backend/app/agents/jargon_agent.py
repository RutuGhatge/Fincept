from app.agents.base_agent import BaseAgent
from typing import Dict, Any, List
import logging
import json
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
            prompt = f"""
You are a financial educator. Explain the financial term '{term}' as a valid JSON object with these exact keys:

- "short": One clear sentence (30–50 words). No markdown.
- "long": A detailed explanation (150–200 words). Use **bold** for key concepts, bullet points where helpful.
- "example": A real-world example (50–75 words). Use plain prose.
- "category": The financial category (e.g. Valuation, Banking, Macro, Trading, Derivatives).

Respond with ONLY the JSON object, no extra text, no code fences.
"""
            try:
                raw_response = await self.get_response(prompt)
            except Exception as e:
                logger.error(f"Gemini error in JargonAgent: {e}")
                return {
                    "term": term,
                    "error": str(e),
                    "source": "gemini_error"
                }
            
            # Basic JSON extraction (Gemini might wrap in code blocks)
            json_str = raw_response.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()
                
            try:
                ai_data = json.loads(json_str)
            except:
                # Fallback if AI doesn't return JSON
                ai_data = {
                    "short": raw_response[:100] + "...",
                    "long": raw_response,
                    "example": "N/A",
                    "category": "General"
                }
            
            # 3. Save to DB for future use - ONLY if not an error message
            if "Error:" not in ai_data.get("long", ""):
                new_entry = {
                    "term": term,
                    "short": ai_data.get("short", ""),
                    "long": ai_data.get("long", ""),
                    "definition": ai_data.get("long", ""), # Keep for legacy
                    "example": ai_data.get("example", ""),
                    "category": ai_data.get("category", "General"),
                    "source": "gemini",
                    "created_at": None 
                }
                await collection.insert_one(new_entry)
            
            return {
                "term": term, 
                "short": ai_data.get("short", ""),
                "long": ai_data.get("long", ""),
                "category": ai_data.get("category", "General"),
                "example": ai_data.get("example", ""),
                "source": "gemini_saved"
            }
            
        except Exception as e:
            logger.error(f"Error in JargonAgent: {e}")
            return {"term": term, "error": str(e), "source": "final_fallback"}
