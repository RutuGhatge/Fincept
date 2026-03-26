from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from app.config.settings import settings
from app.utils.ai_utils import get_gemini_response
import logging

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, **kwargs):
        logger.debug(f"Initializing BaseAgent: name={name}, role={role}, kwargs={kwargs}")
        self.name = name
        self.role = role
        self.llm = None
        self.fallback_models = settings.GEMINI_FALLBACK_MODELS
        super().__init__()
        self._setup_llm()


    def _setup_llm(self):
        try:
            if settings.GOOGLE_API_KEY:
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                # Use the model specified in settings
                self.llm = genai.GenerativeModel(settings.GEMINI_MODEL)
            else:
                logger.warning(f"No Google API key found for agent {self.name}")
        except Exception as e:
            logger.error(f"Error setting up LLM for agent {self.name}: {e}")

    async def get_response(self, prompt: str) -> str:
        try:
            return await get_gemini_response(prompt, self.fallback_models)
        except Exception as e:
            logger.error(f"Error in agent {self.name}: {e}")
            raise e

    @abstractmethod
    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Process a specific task and return results as a dictionary."""
        return {}
