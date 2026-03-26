import google.generativeai as genai
from google.api_core import exceptions
from app.config.settings import settings
import logging
import asyncio

logger = logging.getLogger(__name__)

async def get_gemini_response(prompt: str, model_names: list = None) -> str:
    """
    Fetches a response from Gemini with automatic fallback to alternative models 
    if a ResourceExhausted (429) error occurs.
    """
    if not model_names:
        model_names = settings.GEMINI_FALLBACK_MODELS
    
    if not settings.GOOGLE_API_KEY:
        raise ValueError("Google API Key not configured in settings.")

    genai.configure(api_key=settings.GOOGLE_API_KEY)
    
    last_exception = None
    
    for idx, model_name in enumerate(model_names):
        try:
            # Using WARNING level for visibility in logs as INFO is often ignored
            logger.warning(f"AI Call: Trying model {model_name}...") 
            model = genai.GenerativeModel(model_name)
            response = await model.generate_content_async(prompt)
            # Log success 
            logger.info(f"AI Success with model: {model_name}")
            return response.text
        except exceptions.ResourceExhausted as e:
            if idx < len(model_names) - 1:
                next_model = model_names[idx+1]
                logger.warning(f"Rate limit hit for {model_name}. Waiting 1s then falling back to {next_model}...")
                await asyncio.sleep(1)
            else:
                logger.error(f"Rate limit hit for {model_name}. No more fallback models available.")
            last_exception = e
            continue
        except Exception as e:
            logger.error(f"Unexpected error with model {model_name}: {e}")
            last_exception = e
            continue
            
    logger.error("All Gemini models exhausted or failed.")
    if last_exception:
        raise last_exception
    raise Exception("Failed to get response from any Gemini model.")
