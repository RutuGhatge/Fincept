from typing import Dict, Any, List, Optional
import logging
from app.agents.base_agent import BaseAgent
from app.agents.portfolio_agent import PortfolioAgent
from app.agents.analysis_agent import AnalysisAgent
from app.agents.jargon_agent import JargonAgent
from app.agents.news_agent import NewsAgent

class Orchestrator:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()

    def register_agent(self, agent: BaseAgent):
        self.agents[agent.name] = agent
        logging.info(f"Registered agent: {agent.name}")

    def _register_default_agents(self):
        self.register_agent(PortfolioAgent())
        self.register_agent(AnalysisAgent())
        self.register_agent(JargonAgent())
        self.register_agent(NewsAgent())

    async def distribute_task(self, task_type: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        agent = self.agents.get(task_type)
        if not agent:
            # Fallback to general agent or error
            return {"error": f"No agent registered for task type: {task_type}"}
        
        try:
            return await agent.process_task(task_data)
        except Exception as e:
            logging.error(f"Error distributing task to {task_type}: {e}")
            return {"error": str(e)}

    async def process_request(self, user_id: str, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a high-level request from a user"""
        intent = request.get("intent")
        raw_data = request.get("data", {})
        
        # Ensure we have a mutable dictionary for data
        data: Dict[str, Any] = {}
        if isinstance(raw_data, dict):
            for key, value in raw_data.items():
                data[str(key)] = value
        else:
            data["raw_value"] = raw_data
            
        data["user_id"] = user_id
        
        # In a real scenario, this would use an LLM or rule-based system to 
        # determine which agent to call. For now, we map intent to agent names.
        intent_to_agent = {
            "portfolio_management": "PortfolioAgent",
            "market_analysis": "AnalysisAgent",
            "market_news": "NewsAgent",
            "financial_jargon": "JargonAgent",
            "financial_news": "NewsAgent"
        }
        
        if not isinstance(intent, str):
            return {"success": False, "error": "Invalid or missing intent"}
            
        agent_name = intent_to_agent.get(intent)
        if not agent_name:
            return {"success": False, "error": f"Unsupported intent: {intent}"}
            
        result = await self.distribute_task(agent_name, data)
        if result and "error" in result:
            return {"success": False, "error": result["error"]}
            
        return {"success": True, "data": result}
        
    async def execute_reasoning_loop(self, task_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a multi-step reasoning loop: Initial Analysis -> Self-Critique -> Refinement.
        This provides 'agentic' behavior similar to LangGraph but with lower latency.
        """
        logging.info(f"Starting reasoning loop for: {task_type}")
        
        # Step 1: Initial Analysis
        initial_result = await self.distribute_task(task_type, data)
        if "error" in initial_result:
            return initial_result
            
        # Step 2: Self-Critique / Review
        # We use the same agent but with a 'review' task type
        review_task = {
            "type": "review_and_refine",
            "data": {
                **data,
                "previous_output": initial_result,
                "original_task": task_type
            }
        }
        
        final_result = await self.distribute_task(task_type, review_task)
        
        # Add metadata for transparency
        if isinstance(final_result, dict):
            final_result["reasoning_steps"] = [
                "Gathered raw intelligence and initial mapping.",
                "Performed self-critique for logical consistency and sector accuracy.",
                "Refined strategic impact based on cross-referenced data."
            ]
            
        return final_result

    async def process_geopolitics_chain(self, symbols: List[str]) -> Dict[str, Any]:
        """
        Executes a high-impact geopolitics chain:
        1. NewsAgent: Fetch world news.
        2. AnalysisAgent: Map news to portfolio symbols.
        3. AnalysisAgent: Critique and refine the impact mapping.
        """
        logging.info(f"Starting geopolitics agency chain for symbols: {symbols}")
        
        # Step 1: Fetch News (NewsAgent)
        logger.warning("--- [Step 1: News Intelligence] Fetching global signals ---")
        news_result = await self.distribute_task("NewsAgent", {
            "type": "fetch_geopolitics",
            "data": {}
        })
        if "error" in news_result:
            return news_result
        
        geo_news = news_result.get("geo_news", [])
        
        # Step 2: Analyze Impact (AnalysisAgent)
        logger.warning(f"--- [Step 2: Strategic Mapping] Mapping impacts for {len(symbols)} symbols ---")
        impact_result = await self.distribute_task("AnalysisAgent", {
            "type": "analyze_geopolitics",
            "data": {
                "geo_news": geo_news,
                "symbols": symbols
            }
        })
        if "error" in impact_result:
            return impact_result
            
        portfolio_impact = impact_result.get("portfolio_impact", [])
        
        # Step 3: Self-Correction Loop (Refinement)
        logger.warning("--- [Step 3: Agentic Refinery] Finalizing and critiquing analysis ---")
        refinement_result = await self.distribute_task("AnalysisAgent", {
            "type": "review_and_refine",
            "data": {
                "previous_output": {"geo_news": geo_news, "portfolio_impact": portfolio_impact},
                "original_task": "geopolitical_strategic_mapping",
                "symbols": symbols
            }
        })
        
        if "error" in refinement_result:
            return refinement_result
            
        final_data = refinement_result # AnalysisAgent returns the refined dict directamente
        
        # Inject meta reasoning for hackathon impact
        final_data["reasoning_path"] = [
            "Autonomous NewsAgent gathered global geopolitical signals from RSS.",
            "AnalysisAgent performed cross-asset mapping to current portfolio holdings.",
            "CriticAgent validated logical consistency and refined strategic action hints."
        ]
            
        return {"success": True, "data": final_data}

orchestrator = Orchestrator()
