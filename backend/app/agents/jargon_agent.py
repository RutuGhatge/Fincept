from typing import Dict, Any, List, Optional
import logging
import re
from datetime import datetime

from app.agents.base_agent import BaseAgent, AgentInput, AgentOutput
from app.tools.gemini_client import gemini_client

logger = logging.getLogger(__name__)


class JargonAgent(BaseAgent):
    """
    Agent responsible for explaining financial jargon and concepts:
    - Simple language explanations
    - Context-aware definitions
    - Examples and analogies
    - Related concepts
    """
    
    def __init__(self):
        super().__init__(
            name="JargonAgent",
            description="Explains financial terms and concepts in simple, understandable language"
        )
        
        # Financial jargon database (in production, this would be in a database)
        self.jargon_db = self._initialize_jargon_db()
    
    def get_required_data(self) -> List[str]:
        """Returns required data fields for this agent"""
        return [
            "query",  # The term or question to explain
            "context"  # Optional context for better explanation
        ]
    
    def get_output_schema(self) -> Dict[str, Any]:
        """Returns the output schema for this agent"""
        return {
            "explanation": {
                "type": "object",
                "properties": {
                    "term": {"type": "string"},
                    "simple_definition": {"type": "string"},
                    "detailed_explanation": {"type": "string"},
                    "examples": {"type": "array", "items": {"type": "string"}},
                    "related_terms": {"type": "array", "items": {"type": "string"}}
                }
            }
        }
    
    async def process(self, input_data: AgentInput) -> AgentOutput:
        """Process jargon explanation requests"""
        try:
            if not await self.validate_input(input_data):
                return AgentOutput(
                    success=False,
                    error="Invalid input data",
                    message="Missing required fields"
                )
            
            query = input_data.data.get("query", "").strip()
            context = input_data.data.get("context", {})
            
            if not query:
                return AgentOutput(
                    success=False,
                    error="Empty query",
                    message="Please provide a term or question to explain"
                )
            
            # Determine if this is a direct term lookup or a question
            if self._is_direct_term_lookup(query):
                return await self._explain_term(query, context)
            else:
                return await self._answer_question(query, context)
                
        except Exception as e:
            logger.error(f"JargonAgent error: {e}")
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to process jargon request"
            )
    
    async def _explain_term(self, term: str, context: Dict[str, Any]) -> AgentOutput:
        """Explain a specific financial term"""
        try:
            # Use Gemini AI for explanation
            explanation = await gemini_client.explain_financial_term(term, context)
            
            if "error" in explanation:
                return AgentOutput(
                    success=False,
                    error=explanation["error"],
                    message="Failed to explain term"
                )
            
            return AgentOutput(
                success=True,
                data={
                    "type": "explanation",
                    "term": term,
                    "explanation": explanation
                },
                message=f"Explained financial term: {term}"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to explain term"
            )
    
    async def _answer_question(self, question: str, context: Dict[str, Any]) -> AgentOutput:
        """Answer a financial question"""
        try:
            # Use Gemini AI for question answering
            prompt = f"Please answer this financial question: {question}"
            if context:
                prompt += f"\n\nContext: {context}"
            
            answer = await gemini_client.generate_response(prompt, context)
            
            return AgentOutput(
                success=True,
                data={
                    "type": "answer",
                    "question": question,
                    "answer": {
                        "simple_answer": answer,
                        "detailed_answer": answer,
                        "explained_terms": [],
                        "found_terms": []
                    }
                },
                message="Answered financial question"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to answer question"
            )
    
    def _is_direct_term_lookup(self, query: str) -> bool:
        """Check if query is a direct term lookup"""
        # Remove common question words and check if it's likely a term
        question_words = ["what", "how", "why", "when", "where", "explain", "define", "meaning"]
        words = query.lower().split()
        
        # If query starts with question words, it's likely a question
        if any(words[0].startswith(qw) for qw in question_words):
            return False
        
        # If query is short (1-3 words), likely a term lookup
        if len(words) <= 3:
            return True
        
        # If query contains "is" or "means", likely a question
        if "is" in words or "means" in words:
            return False
        
        return True
    
    def _normalize_term(self, term: str) -> str:
        """Normalize term for lookup"""
        # Remove common prefixes/suffixes
        term = re.sub(r'^(what\s+is\s+|define\s+|explain\s+)', '', term, flags=re.IGNORECASE)
        term = re.sub(r'(\?|\s+meaning|\s+definition)$', '', term, flags=re.IGNORECASE)
        
        # Convert to singular form (simple version)
        term = re.sub(r's$', '', term)
        
        return term.strip().lower()
    
    def _find_similar_terms(self, term: str) -> List[str]:
        """Find similar terms in the database"""
        term_lower = term.lower()
        similar = []
        
        for db_term in self.jargon_db.keys():
            # Simple similarity check (in production, use more sophisticated matching)
            if (term_lower in db_term or db_term in term_lower or
                self._levenshtein_distance(term_lower, db_term) <= 2):
                similar.append(db_term)
        
        return similar[:5]  # Return top 5 suggestions
    
    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance between two strings"""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    def _generate_contextual_explanation(self, jargon_entry: Dict[str, Any], 
                                        context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate context-aware explanation"""
        explanation = jargon_entry.copy()
        
        # Add context-specific examples
        if context.get("portfolio_type") == "beginner":
            explanation["examples"] = [
                exp for exp in explanation.get("examples", [])
                if "beginner" in exp.lower() or "simple" in exp.lower()
            ]
        elif context.get("portfolio_type") == "advanced":
            explanation["examples"] = [
                exp for exp in explanation.get("examples", [])
                if "advanced" in exp.lower() or "complex" in exp.lower()
            ]
        
        # Add portfolio-specific context
        if context.get("holdings"):
            relevant_holdings = context["holdings"][:3]  # Top 3 holdings
            explanation["portfolio_context"] = f"This concept is relevant to your holdings in {', '.join(relevant_holdings)}"
        
        return explanation
    
    def _extract_key_terms(self, question: str) -> List[str]:
        """Extract financial terms from a question"""
        question_lower = question.lower()
        key_terms = []
        
        # Look for terms in our database
        for term in self.jargon_db.keys():
            if term in question_lower:
                key_terms.append(term)
        
        return key_terms
    
    def _generate_answer(self, question: str, key_terms: List[str], 
                        context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate answer to financial question"""
        # Get explanations for all key terms
        term_explanations = []
        for term in key_terms:
            jargon_entry = self.jargon_db.get(term)
            if jargon_entry:
                term_explanations.append({
                    "term": term,
                    "definition": jargon_entry["simple_definition"],
                    "explanation": jargon_entry["detailed_explanation"]
                })
        
        # Generate contextual answer
        answer = {
            "simple_answer": self._generate_simple_answer(question, term_explanations),
            "detailed_answer": self._generate_detailed_answer(question, term_explanations),
            "explained_terms": term_explanations
        }
        
        return answer
    
    def _generate_simple_answer(self, question: str, term_explanations: List[Dict]) -> str:
        """Generate a simple answer to the question"""
        if not term_explanations:
            return "I couldn't identify specific financial terms in your question. Could you rephrase it?"
        
        # Simple template-based answer generation
        if "difference" in question.lower() or "vs" in question.lower():
            if len(term_explanations) >= 2:
                term1, term2 = term_explanations[0], term_explanations[1]
                return f"{term1['term']} is {term1['definition'].lower()}, while {term2['term']} is {term2['definition'].lower()}."
        
        # Default answer
        main_term = term_explanations[0]
        return f"{main_term['term']} {main_term['definition'].lower()}. {main_term['explanation']}"
    
    def _generate_detailed_answer(self, question: str, term_explanations: List[Dict]) -> str:
        """Generate a detailed answer to the question"""
        if not term_explanations:
            return "I need more specific financial terms to provide a detailed explanation."
        
        detailed_parts = []
        for term_exp in term_explanations:
            detailed_parts.append(
                f"**{term_exp['term'].title()}:** {term_exp['explanation']}"
            )
        
        return "\n\n".join(detailed_parts)
    
    def _initialize_jargon_db(self) -> Dict[str, Dict[str, Any]]:
        """Initialize the financial jargon database"""
        return {
            "dividend": {
                "simple_definition": "A portion of a company's profits paid to shareholders",
                "detailed_explanation": "Dividends are payments made by publicly-traded companies to their shareholders as a reward for investing in the company. They are typically paid quarterly and represent a share of the company's earnings.",
                "examples": [
                    "If you own 100 shares of a company that pays a $1 dividend per share, you'll receive $100",
                    "Beginner example: Think of it like a profit-sharing bonus for being part owner",
                    "Advanced example: Dividend yield is calculated as annual dividend per share divided by share price"
                ],
                "related_terms": ["dividend yield", "ex-dividend date", "dividend reinvestment"]
            },
            "p/e ratio": {
                "simple_definition": "A measure of how expensive a stock is relative to its earnings",
                "detailed_explanation": "The Price-to-Earnings (P/E) ratio compares a company's stock price to its earnings per share. It helps investors determine if a stock is overvalued or undervalued compared to its peers or historical averages.",
                "examples": [
                    "A P/E ratio of 20 means investors are willing to pay $20 for every $1 of earnings",
                    "Beginner example: Like comparing house prices to rental income - higher P/E means you're paying more for each dollar of profit",
                    "Advanced example: Trailing P/E uses past earnings, while forward P/E uses projected earnings"
                ],
                "related_terms": ["earnings per share", "market cap", "valuation"]
            },
            "etf": {
                "simple_definition": "A basket of different investments that trades like a single stock",
                "detailed_explanation": "An Exchange-Traded Fund (ETF) is a collection of stocks, bonds, or other assets that are bundled together and traded on stock exchanges. They offer diversification like mutual funds but with the flexibility of individual stocks.",
                "examples": [
                    "An S&P 500 ETF holds shares of all 500 companies in the S&P 500 index",
                    "Beginner example: Like buying a fruit basket instead of individual fruits - you get variety in one purchase",
                    "Advanced example: ETFs can track indices, sectors, commodities, or use specific investment strategies"
                ],
                "related_terms": ["index fund", "mutual fund", "diversification", "expense ratio"]
            },
            "bull market": {
                "simple_definition": "A period when stock prices are generally rising",
                "detailed_explanation": "A bull market is characterized by sustained increases in market prices, typically rising 20% or more from recent lows. It's accompanied by investor optimism, confidence, and expectations that strong results will continue.",
                "examples": [
                    "The period from 2009 to 2020 was generally considered a bull market in US stocks",
                    "Beginner example: Like an escalator going up - most stocks are moving higher over time",
                    "Advanced example: Bull markets often coincide with economic expansion, low unemployment, and high consumer confidence"
                ],
                "related_terms": ["bear market", "market correction", "bullish", "market sentiment"]
            },
            "bear market": {
                "simple_definition": "A period when stock prices are generally falling",
                "detailed_explanation": "A bear market is defined by a decline of 20% or more from recent highs. It's marked by widespread pessimism, investor fear, and selling pressure. Bear markets can last for months or even years.",
                "examples": [
                    "The 2008 financial crisis saw a major bear market with stocks falling over 50%",
                    "Beginner example: Like an escalator going down - most stocks are moving lower over time",
                    "Advanced example: Bear markets often precede or accompany economic recessions and rising unemployment"
                ],
                "related_terms": ["bull market", "market crash", "bearish", "recession"]
            },
            "diversification": {
                "simple_definition": "Spreading investments across different types of assets to reduce risk",
                "detailed_explanation": "Diversification is the practice of investing in various assets, sectors, and geographic regions to reduce the impact of any single investment's poor performance on your overall portfolio. It's based on the principle that different investments perform differently under various market conditions.",
                "examples": [
                    "Instead of putting all money in tech stocks, invest in stocks, bonds, real estate, and international markets",
                    "Beginner example: Like not putting all your eggs in one basket - if one basket drops, you still have others",
                    "Advanced example: Modern Portfolio Theory shows that proper diversification can improve risk-adjusted returns"
                ],
                "related_terms": ["asset allocation", "correlation", "portfolio", "risk management"]
            },
            "market cap": {
                "simple_definition": "The total value of all shares of a company",
                "detailed_explanation": "Market capitalization (market cap) is calculated by multiplying a company's current share price by the total number of outstanding shares. It's used to classify companies as large-cap, mid-cap, or small-cap, which helps investors understand the company's size and growth characteristics.",
                "examples": [
                    "If a company has 1 million shares trading at $50 each, its market cap is $50 million",
                    "Beginner example: Like the total price of all houses in a neighborhood - shows the overall size",
                    "Advanced example: Large-cap stocks (> $10 billion) are typically more stable, while small-cap stocks offer higher growth potential"
                ],
                "related_terms": ["large-cap", "mid-cap", "small-cap", "share price", "outstanding shares"]
            },
            "asset allocation": {
                "simple_definition": "How you divide your money among different types of investments",
                "detailed_explanation": "Asset allocation is the strategy of dividing an investment portfolio among different asset categories, such as stocks, bonds, and cash. The allocation is typically based on an investor's goals, risk tolerance, and investment timeline.",
                "examples": [
                    "A conservative investor might have 60% bonds, 30% stocks, and 10% cash",
                    "Beginner example: Like planning a balanced meal - you need different food groups for a healthy diet",
                    "Advanced example: Strategic asset allocation is long-term, while tactical allocation makes short-term adjustments based on market conditions"
                ],
                "related_terms": ["diversification", "rebalancing", "risk tolerance", "portfolio"]
            },
            "compound interest": {
                "simple_definition": "Earning interest on both your original money and the interest you've already earned",
                "detailed_explanation": "Compound interest is the addition of interest to the principal sum, where interest also earns interest over time. This creates a snowball effect where your money grows at an accelerating rate, making it one of the most powerful forces in long-term investing.",
                "examples": [
                    "$1,000 at 10% annual interest becomes $1,100 in year 1, then $1,210 in year 2 (interest on interest)",
                    "Beginner example: Like a snowball rolling downhill - it gets bigger faster as it picks up more snow",
                    "Advanced example: The Rule of 72 estimates how long it takes for money to double at a given interest rate (72 ÷ interest rate = years)"
                ],
                "related_terms": ["simple interest", "annual percentage yield", "return on investment", "time value of money"]
            },
            "volatility": {
                "simple_definition": "How much a stock's price moves up and down",
                "detailed_explanation": "Volatility measures the degree of variation in a trading price series over time. High volatility means large price swings and higher risk, while low volatility indicates more stable prices. It's a key measure of risk in investing.",
                "examples": [
                    "A stock that moves between $90-$110 has higher volatility than one that moves between $95-$105",
                    "Beginner example: Like a bumpy road versus a smooth highway - bumpy means more ups and downs",
                    "Advanced example: Beta measures volatility relative to the market (beta > 1 = more volatile than market)"
                ],
                "related_terms": ["beta", "standard deviation", "risk", "market volatility"]
            }
        }
