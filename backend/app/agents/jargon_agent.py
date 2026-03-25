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
                    "full_form": existing.get("full_form", existing["term"]),
                    "short": existing.get("short", existing.get("definition", "")[:100]),
                    "long": existing.get("long", existing.get("definition", "")),
                    "example": existing.get("example", ""),
                    "category": existing.get("category", "General Finance"),
                    "source": "database"
                }
            
            # 2. Fallback to Gemini
            prompt = f"""
You are a financial educator AI assistant called the Jargon Agent. Your ONLY job is to explain financial and investment terms.

First, determine if '{term}' is a finance, investing, economics, or business term.

If it is NOT a finance term, respond with ONLY this exact JSON:
{{"not_finance": true, "message": "I'm only here to explain finance and investment terms. Please search for a financial jargon!"}}

If it IS a finance term, respond with ONLY this JSON object (no extra text, no code fences):
{{
  "full_form": "Full expanded form if acronym, else write the term itself",
  "short": "One clear sentence, 30-50 words, plain text only",
  "long": "Detailed explanation 150-200 words. Use **bold** for key concepts, use bullet points with - for key takeaways.",
  "example": "A real-world investing example, 50-75 words, plain prose",
  "category": "Pick one: General Finance, Valuation, Banking, Macro, Trading, Derivatives, Mutual Funds, Fixed Income"
}}
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
                ai_data = {
                    "full_form": term,
                    "short": raw_response[:100] + "...",
                    "long": raw_response,
                    "example": "N/A",
                    "category": "General Finance"
                }

            # If Gemini says it's not a finance term, return refusal without saving
            if ai_data.get("not_finance"):
                return {
                    "term": term,
                    "not_finance": True,
                    "message": ai_data.get("message", "I'm only here to explain finance and investment terms. Please search for a financial jargon!"),
                    "source": "jargon_agent"
                }
            
            # Save to DB matching the exact schema
            new_entry = {
                "term": term,
                "full_form": ai_data.get("full_form", term),
                "short": ai_data.get("short", ""),
                "long": ai_data.get("long", ""),
                "example": ai_data.get("example", ""),
                "category": ai_data.get("category", "General Finance"),
                "source": "gemini",
            }
            await collection.insert_one(new_entry)
            
            return {
                "term": term,
                "full_form": new_entry["full_form"],
                "short": new_entry["short"],
                "long": new_entry["long"],
                "example": new_entry["example"],
                "category": new_entry["category"],
                "source": "gemini_saved"
            }
            
        except Exception as e:
            logger.error(f"Error in JargonAgent: {e}")
            return {"term": term, "error": str(e), "source": "final_fallback"}
