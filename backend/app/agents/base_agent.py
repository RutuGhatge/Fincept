from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, **kwargs):
        logger.debug(f"Initializing BaseAgent: name={name}, role={role}, kwargs={kwargs}")
        self.name = name
        self.role = role
        self.llm = None
        super().__init__()
        self._setup_llm()


    def _setup_llm(self):
        try:
            if settings.GOOGLE_API_KEY:
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                self.llm = genai.GenerativeModel('gemini-1.5-flash')
            else:
                logger.warning(f"No Google API key found for agent {self.name}")
        except Exception as e:
            logger.error(f"Error setting up LLM for agent {self.name}: {e}")

    async def get_response(self, prompt: str) -> str:
        if self.llm is None:
            return f"Agent {self.name} is not fully configured (missing API key)."
        
        try:
            # Type hint for the linter
            model = self.llm
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error in agent {self.name}: {e}")
            return f"Error: {e}"

    @abstractmethod
    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Process a specific task and return results as a dictionary."""
        return {}
