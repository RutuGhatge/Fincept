from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from app.config.settings import settings
import logging

class BaseAgent(ABC):
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.llm = None
        self._setup_llm()

    def _setup_llm(self):
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.llm = genai.GenerativeModel('gemini-1.5-flash')
        else:
            logging.warning(f"No Google API key found for agent {self.name}")

    async def get_response(self, prompt: str) -> str:
        if not self.llm:
            return f"Agent {self.name} is not fully configured (missing API key)."
        
        try:
            response = await self.llm.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logging.error(f"Error in agent {self.name}: {e}")
            return f"Error: {e}"

    @abstractmethod
    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        pass
