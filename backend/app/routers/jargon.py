from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import logging

from app.schemas.jargon import (
    JargonQuery, JargonExplanation, JargonSuggestion
)
from app.agents.orchestrator import AgentOrchestrator
from app.db.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/explain", response_model=JargonExplanation)
async def explain_financial_term(
    query: JargonQuery,
    user_id: Optional[str] = None,
    db=Depends(get_db)
):
    """Explain a financial term or concept"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "jargon",
            "data": {
                "query": query.term,
                "context": query.context or {}
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id or "anonymous",
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to explain term")
            )
        
        jargon_data = result["data"]["jargon"]
        
        if jargon_data.get("type") == "suggestion":
            # Return suggestions if term not found
            return JargonExplanation(
                term=query.term,
                found=False,
                suggestions=jargon_data.get("suggestions", []),
                message=jargon_data.get("message")
            )
        else:
            # Return explanation
            explanation = jargon_data.get("explanation", {})
            return JargonExplanation(
                term=query.term,
                found=True,
                simple_definition=explanation.get("simple_definition"),
                detailed_explanation=explanation.get("detailed_explanation"),
                examples=explanation.get("examples", []),
                related_terms=explanation.get("related_terms", []),
                context_notes=explanation.get("portfolio_context")
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error explaining financial term: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/ask", response_model=dict)
async def ask_financial_question(
    question: str,
    context: Optional[dict] = None,
    user_id: Optional[str] = None,
    db=Depends(get_db)
):
    """Ask a financial question and get an answer"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "jargon",
            "data": {
                "query": question,
                "context": context or {}
            }
        }
        
        result = await orchestrator.process_request(
            user_id=user_id or "anonymous",
            request=request_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to answer question")
            )
        
        jargon_data = result["data"]["jargon"]
        
        if jargon_data.get("type") == "answer":
            answer = jargon_data.get("answer", {})
            return {
                "question": question,
                "simple_answer": answer.get("simple_answer"),
                "detailed_answer": answer.get("detailed_answer"),
                "explained_terms": answer.get("explained_terms", []),
                "found_terms": answer.get("key_terms", [])
            }
        else:
            # Handle term explanation case
            explanation = jargon_data.get("explanation", {})
            return {
                "question": question,
                "simple_answer": explanation.get("simple_definition"),
                "detailed_answer": explanation.get("detailed_explanation"),
                "explained_terms": [{
                    "term": explanation.get("term"),
                    "definition": explanation.get("simple_definition"),
                    "explanation": explanation.get("detailed_explanation")
                }],
                "found_terms": [explanation.get("term")]
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error answering financial question: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/search", response_model=List[str])
async def search_financial_terms(
    query: str,
    limit: int = 10,
    db=Depends(get_db)
):
    """Search for financial terms"""
    try:
        # This would use the jargon agent's search functionality
        orchestrator = AgentOrchestrator()
        
        # For now, return a simple search result
        # In production, this would search the jargon database
        common_terms = [
            "dividend", "pe ratio", "etf", "bull market", "bear market",
            "diversification", "market cap", "asset allocation", "compound interest", "volatility"
        ]
        
        matching_terms = [
            term for term in common_terms 
            if query.lower() in term.lower() or term.lower() in query.lower()
        ]
        
        return matching_terms[:limit]
        
    except Exception as e:
        logger.error(f"Error searching financial terms: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/categories", response_model=List[str])
async def get_financial_categories(db=Depends(get_db)):
    """Get categories of financial terms"""
    try:
        categories = [
            "Basic Concepts",
            "Investment Types",
            "Market Analysis",
            "Risk Management",
            "Portfolio Management",
            "Economic Indicators",
            "Trading Terms",
            "Tax Terms",
            "Regulatory Terms"
        ]
        
        return categories
        
    except Exception as e:
        logger.error(f"Error getting financial categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/category/{category_name}", response_model=List[str])
async def get_terms_by_category(
    category_name: str,
    db=Depends(get_db)
):
    """Get financial terms by category"""
    try:
        # Simple category mapping (in production, this would be database-driven)
        category_terms = {
            "basic concepts": ["dividend", "compound interest", "volatility"],
            "investment types": ["etf", "mutual fund", "stock", "bond"],
            "market analysis": ["pe ratio", "market cap", "beta"],
            "risk management": ["diversification", "asset allocation", "hedging"],
            "portfolio management": ["rebalancing", "asset allocation", "diversification"],
            "economic indicators": ["gdp", "inflation", "interest rate"],
            "trading terms": ["bid", "ask", "spread", "volume"],
            "tax terms": ["capital gains", "tax loss harvesting", "cost basis"],
            "regulatory terms": ["sec", "fidelity bond", "insider trading"]
        }
        
        terms = category_terms.get(category_name.lower(), [])
        return terms
        
    except Exception as e:
        logger.error(f"Error getting terms by category: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/popular", response_model=List[dict])
async def get_popular_terms(
    limit: int = 20,
    db=Depends(get_db)
):
    """Get popular financial terms"""
    try:
        # In production, this would be based on actual usage data
        popular_terms = [
            {"term": "dividend", "frequency": 145},
            {"term": "pe ratio", "frequency": 132},
            {"term": "etf", "frequency": 128},
            {"term": "bull market", "frequency": 115},
            {"term": "bear market", "frequency": 108},
            {"term": "diversification", "frequency": 98},
            {"term": "market cap", "frequency": 87},
            {"term": "asset allocation", "frequency": 76},
            {"term": "compound interest", "frequency": 72},
            {"term": "volatility", "frequency": 68}
        ]
        
        return popular_terms[:limit]
        
    except Exception as e:
        logger.error(f"Error getting popular terms: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/related/{term}", response_model=List[str])
async def get_related_terms(
    term: str,
    db=Depends(get_db)
):
    """Get terms related to a specific financial term"""
    try:
        orchestrator = AgentOrchestrator()
        
        request_data = {
            "intent": "jargon",
            "data": {
                "query": term,
                "context": {"get_related": True}
            }
        }
        
        result = await orchestrator.process_request(
            user_id="system",
            request=request_data
        )
        
        if result.get("success") and result["data"]["jargon"].get("explanation"):
            related_terms = result["data"]["jargon"]["explanation"].get("related_terms", [])
            return related_terms
        else:
            # Fallback to basic related terms
            related_mapping = {
                "dividend": ["dividend yield", "ex-dividend date", "dividend reinvestment"],
                "pe ratio": ["earnings per share", "market cap", "valuation"],
                "etf": ["index fund", "mutual fund", "diversification", "expense ratio"],
                "bull market": ["bear market", "market correction", "bullish"],
                "volatility": ["beta", "standard deviation", "risk"]
            }
            
            return related_mapping.get(term.lower(), [])
        
    except Exception as e:
        logger.error(f"Error getting related terms: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/learn/quiz")
async def generate_learning_quiz(
    topics: List[str],
    difficulty: str = "beginner",
    question_count: int = 5,
    db=Depends(get_db)
):
    """Generate a learning quiz based on financial topics"""
    try:
        # Simple quiz generation (in production, this would use AI)
        quiz_questions = []
        
        for topic in topics[:question_count]:
            question = {
                "question": f"What is {topic}?",
                "options": [
                    f"Definition of {topic}",
                    f"Related concept to {topic}",
                    f"Opposite of {topic}",
                    f"Unrelated to {topic}"
                ],
                "correct_answer": 0,
                "explanation": f"This is the correct definition of {topic}"
            }
            quiz_questions.append(question)
        
        return {
            "quiz_id": f"quiz_{len(topics)}_{difficulty}",
            "questions": quiz_questions,
            "difficulty": difficulty,
            "topics": topics
        }
        
    except Exception as e:
        logger.error(f"Error generating quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
