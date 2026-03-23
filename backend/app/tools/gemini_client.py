"""
Gemini AI client for investment intelligence
"""
import google.generativeai as genai
from typing import Dict, Any, Optional, List
import logging
import json

from app.config.settings import settings

logger = logging.getLogger(__name__)


class GeminiClient:
    """Gemini AI client wrapper"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured")
            return
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize model
        try:
            self.model_client = genai.GenerativeModel(self.model)
            logger.info(f"Initialized Gemini model: {self.model}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {e}")
            self.model_client = None
    
    async def generate_response(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate response from Gemini"""
        if not self.model_client:
            return "AI service not available. Please check GEMINI_API_KEY configuration."
        
        try:
            # Build full prompt with context
            full_prompt = self._build_prompt(prompt, context)
            
            # Generate response
            response = self.model_client.generate_content(full_prompt)
            
            if response.text:
                return response.text.strip()
            else:
                logger.warning("Empty response from Gemini")
                return "I apologize, but I couldn't generate a response. Please try again."
                
        except Exception as e:
            logger.error(f"Error generating Gemini response: {e}")
            return f"Error generating AI response: {str(e)}"
    
    async def analyze_financial_data(self, data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
        """Analyze financial data using Gemini"""
        if not self.model_client:
            return {"error": "AI service not available"}
        
        try:
            # Build analysis prompt
            prompt = self._build_analysis_prompt(data, analysis_type)
            
            # Generate response
            response = self.model_client.generate_content(prompt)
            
            if response.text:
                # Try to parse as JSON
                try:
                    return json.loads(response.text)
                except json.JSONDecodeError:
                    return {"analysis": response.text, "raw": True}
            else:
                return {"error": "No analysis generated"}
                
        except Exception as e:
            logger.error(f"Error in financial analysis: {e}")
            return {"error": str(e)}
    
    async def explain_financial_term(self, term: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Explain financial term using Gemini"""
        if not self.model_client:
            return {"error": "AI service not available"}
        
        try:
            # Build explanation prompt
            prompt = self._build_jargon_prompt(term, context)
            
            # Generate response
            response = self.model_client.generate_content(prompt)
            
            if response.text:
                # Try to parse as structured response
                try:
                    return json.loads(response.text)
                except json.JSONDecodeError:
                    return {
                        "simple_definition": response.text,
                        "detailed_explanation": response.text,
                        "examples": []
                    }
            else:
                return {"error": "No explanation generated"}
                
        except Exception as e:
            logger.error(f"Error explaining financial term: {e}")
            return {"error": str(e)}
    
    async def summarize_text(self, text: str, length: str = "medium") -> str:
        """Summarize text using Gemini"""
        if not self.model_client:
            return "AI service not available"
        
        try:
            # Build summary prompt
            prompt = self._build_summary_prompt(text, length)
            
            # Generate response
            response = self.model_client.generate_content(prompt)
            
            if response.text:
                return response.text.strip()
            else:
                return "Unable to generate summary"
                
        except Exception as e:
            logger.error(f"Error summarizing text: {e}")
            return f"Error generating summary: {str(e)}"
    
    def _build_prompt(self, user_prompt: str, context: Optional[Dict[str, Any]]) -> str:
        """Build full prompt with context"""
        base_prompt = """You are an intelligent investment assistant with expertise in financial analysis, portfolio management, and market intelligence. You provide accurate, helpful, and actionable insights.

Guidelines:
- Be clear and concise
- Provide specific, actionable advice
- Consider risk factors
- Use simple language when explaining concepts
- Be honest about limitations
- Focus on user's specific situation when context is provided"""
        
        if context:
            context_str = "\n\nContext:\n"
            for key, value in context.items():
                context_str += f"- {key}: {value}\n"
            base_prompt += context_str
        
        base_prompt += f"\n\nUser Request: {user_prompt}"
        
        return base_prompt
    
    def _build_analysis_prompt(self, data: Dict[str, Any], analysis_type: str) -> str:
        """Build analysis prompt for financial data"""
        prompts = {
            "portfolio_performance": """
Analyze the following portfolio performance data and provide insights:
{data}

Please provide:
1. Overall performance assessment
2. Key strengths and weaknesses
3. Risk factors
4. Specific recommendations
5. Confidence level in analysis

Format as JSON with keys: assessment, strengths, weaknesses, risks, recommendations, confidence
""",
            "risk_analysis": """
Analyze the risk profile of this portfolio:
{data}

Please provide:
1. Overall risk level (1-10 scale)
2. Main risk factors
3. Diversification assessment
4. Risk mitigation recommendations
5. Risk-adjusted performance outlook

Format as JSON with keys: risk_score, risk_factors, diversification, mitigation, outlook
""",
            "asset_allocation": """
Analyze this asset allocation:
{data}

Please provide:
1. Allocation efficiency score (1-10)
2. Over/under-weighted assets
3. Rebalancing recommendations
4. Optimization suggestions
5. Expected impact of changes

Format as JSON with keys: efficiency_score, imbalances, rebalancing, optimization, impact
"""
        }
        
        base_prompt = prompts.get(analysis_type, prompts["portfolio_performance"])
        return base_prompt.format(data=json.dumps(data, indent=2))
    
    def _build_jargon_prompt(self, term: str, context: Optional[Dict[str, Any]]) -> str:
        """Build prompt for financial term explanation"""
        base_prompt = f"""Explain the financial term "{term}" in simple, clear language.

Please provide:
1. Simple definition (1-2 sentences)
2. Detailed explanation (2-3 paragraphs)
3. 3 practical examples
4. 3 related terms
5. Context for investors

Format as JSON with keys: simple_definition, detailed_explanation, examples, related_terms, context"""
        
        if context:
            context_str = "\n\nUser Context:\n"
            for key, value in context.items():
                context_str += f"- {key}: {value}\n"
            base_prompt += context_str
        
        return base_prompt
    
    def _build_summary_prompt(self, text: str, length: str) -> str:
        """Build prompt for text summarization"""
        length_instructions = {
            "short": "Provide a 1-2 sentence summary",
            "medium": "Provide a 2-3 paragraph summary",
            "long": "Provide a detailed 4-5 paragraph summary"
        }
        
        instruction = length_instructions.get(length, length_instructions["medium"])
        
        return f"""{instruction}

Text to summarize:
{text}

Focus on key points and main insights. Use clear, professional language."""


# Global Gemini client instance
gemini_client = GeminiClient()
