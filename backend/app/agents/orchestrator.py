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

orchestrator = Orchestrator()
