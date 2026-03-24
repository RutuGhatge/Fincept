from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
import logging

class Orchestrator:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}

    def register_agent(self, agent: BaseAgent):
        self.agents[agent.name] = agent
        logging.info(f"Registered agent: {agent.name}")

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

orchestrator = Orchestrator()
