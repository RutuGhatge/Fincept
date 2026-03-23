from typing import Dict, Any, List, Optional, Union
import logging
import asyncio
from datetime import datetime
import uuid

from app.agents.base_agent import BaseAgent, AgentInput, AgentOutput
# Agent imports moved to initialization for robustness

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Central orchestrator that coordinates multiple specialized agents
    to handle complex user requests through multi-agent collaboration
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize agents robustly
        self.agents = {}
        
        try:
            from app.agents.portfolio_agent import PortfolioAgent
            self.agents["portfolio"] = PortfolioAgent()
        except Exception as e:
            self.logger.warning(f"Failed to load PortfolioAgent: {e}")
            
        try:
            from app.agents.analysis_agent import AnalysisAgent
            self.agents["analysis"] = AnalysisAgent()
        except Exception as e:
            self.logger.warning(f"Failed to load AnalysisAgent: {e}")
            
        try:
            from app.agents.news_agent import NewsAgent
            self.agents["news"] = NewsAgent()
        except Exception as e:
            self.logger.warning(f"Failed to load NewsAgent: {e}")
            
        try:
            from app.agents.jargon_agent import JargonAgent
            self.agents["jargon"] = JargonAgent()
        except Exception as e:
            self.logger.warning(f"Failed to load JargonAgent: {e}")
        
        # Agent capabilities mapping
        self.agent_capabilities = {
            "portfolio": ["create_portfolio", "get_portfolio", "update_portfolio", 
                         "add_holding", "remove_holding", "portfolio_value", "portfolio_analytics"],
            "analysis": ["performance_analysis", "risk_analysis", "allocation_analysis", 
                        "comprehensive_analysis", "recommendations"],
            "news": ["fetch_news", "filter_news", "analyze_news", "summarize_news", "portfolio_news"],
            "jargon": ["explain_term", "answer_question", "define_concept"]
        }
        
        # Request routing rules
        self.routing_rules = self._initialize_routing_rules()
        
        # Agent collaboration patterns
        self.collaboration_patterns = self._initialize_collaboration_patterns()
    
    async def process_request(self, user_id: str, request: Dict[str, Any], 
                            context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process user request by routing to appropriate agents and coordinating responses
        
        Args:
            user_id: User identifier
            request: User request containing intent and parameters
            context: Additional context for processing
            
        Returns:
            Dict containing the response and metadata
        """
        request_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        try:
            self.logger.info(f"Processing request {request_id} for user {user_id}")
            
            # Parse user intent
            intent = self._parse_intent(request)
            
            # Determine required agents and execution plan
            execution_plan = self._create_execution_plan(intent, request, context)
            
            # Execute agents according to plan
            results = await self._execute_agents(execution_plan, user_id, request_id, context)
            
            # Combine and format results
            final_response = self._combine_results(results, intent, execution_plan)
            
            # Add metadata
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            final_response["metadata"] = {
                "request_id": request_id,
                "processing_time_ms": processing_time,
                "agents_used": execution_plan["agents"],
                "intent": intent,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.logger.info(f"Completed request {request_id} in {processing_time:.2f}ms")
            
            return final_response
            
        except Exception as e:
            self.logger.error(f"Failed to process request {request_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to process request",
                "metadata": {
                    "request_id": request_id,
                    "processing_time_ms": (datetime.utcnow() - start_time).total_seconds() * 1000
                }
            }
    
    def _parse_intent(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Parse user intent from request"""
        message = request.get("message", "").lower()
        data = request.get("data", {})
        
        # Direct intent specification
        if "intent" in request:
            return {
                "type": request["intent"],
                "confidence": 1.0,
                "entities": data.get("entities", {}),
                "parameters": data
            }
        
        # Intent classification based on keywords
        intent_patterns = {
            "portfolio_management": {
                "keywords": ["portfolio", "holdings", "add", "remove", "update", "create", "value"],
                "agents": ["portfolio"]
            },
            "analysis": {
                "keywords": ["analyze", "performance", "risk", "recommendation", "allocation"],
                "agents": ["analysis"]
            },
            "news": {
                "keywords": ["news", "market", "headlines", "sentiment", "latest"],
                "agents": ["news"]
            },
            "jargon": {
                "keywords": ["what is", "explain", "define", "meaning", "term"],
                "agents": ["jargon"]
            },
            "comprehensive": {
                "keywords": ["overview", "summary", "complete", "all"],
                "agents": ["portfolio", "analysis", "news"]
            }
        }
        
        # Find best matching intent
        best_intent = None
        best_score = 0
        
        for intent_type, pattern in intent_patterns.items():
            score = sum(1 for keyword in pattern["keywords"] if keyword in message)
            if score > best_score:
                best_score = score
                best_intent = intent_type
        
        if not best_intent:
            best_intent = "general"
        
        return {
            "type": best_intent,
            "confidence": min(best_score / 3, 1.0),  # Normalize confidence
            "entities": self._extract_entities(message),
            "parameters": data
        }
    
    def _extract_entities(self, message: str) -> Dict[str, Any]:
        """Extract entities from user message"""
        entities = {}
        
        # Simple entity extraction (in production, use NLP)
        import re
        
        # Extract symbols (e.g., AAPL, GOOGL)
        symbols = re.findall(r'\b[A-Z]{2,5}\b', message.upper())
        if symbols:
            entities["symbols"] = symbols
        
        # Extract numbers (potential quantities, prices)
        numbers = re.findall(r'\b\d+\.?\d*\b', message)
        if numbers:
            entities["numbers"] = [float(n) for n in numbers]
        
        # Extract financial terms
        financial_terms = ["dividend", "pe ratio", "etf", "bull", "bear", "volatility"]
        found_terms = [term for term in financial_terms if term in message.lower()]
        if found_terms:
            entities["financial_terms"] = found_terms
        
        return entities
    
    def _create_execution_plan(self, intent: Dict[str, Any], request: Dict[str, Any], 
                             context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Create execution plan for agents"""
        intent_type = intent["type"]
        parameters = intent["parameters"]
        
        # Base execution plan
        plan = {
            "agents": [],
            "sequence": [],
            "parallel": [],
            "data_flow": {}
        }
        
        # Determine agents based on intent
        if intent_type == "portfolio_management":
            plan["agents"] = ["portfolio"]
            plan["sequence"] = [{"agent": "portfolio", "depends_on": []}]
            
        elif intent_type == "analysis":
            plan["agents"] = ["analysis", "portfolio"]
            plan["sequence"] = [
                {"agent": "portfolio", "depends_on": []},
                {"agent": "analysis", "depends_on": ["portfolio"]}
            ]
            
        elif intent_type == "news":
            plan["agents"] = ["news", "portfolio"]
            plan["parallel"] = [
                {"agent": "portfolio", "depends_on": []},
                {"agent": "news", "depends_on": []}
            ]
            
        elif intent_type == "jargon":
            plan["agents"] = ["jargon"]
            plan["sequence"] = [{"agent": "jargon", "depends_on": []}]
            
        elif intent_type == "comprehensive":
            plan["agents"] = ["portfolio", "analysis", "news"]
            plan["parallel"] = [
                {"agent": "portfolio", "depends_on": []},
                {"agent": "news", "depends_on": []}
            ]
            plan["sequence"] = [
                {"agent": "portfolio", "depends_on": []},
                {"agent": "news", "depends_on": []},
                {"agent": "analysis", "depends_on": ["portfolio"]}
            ]
        
        # Add data flow information
        plan["data_flow"] = self._create_data_flow(plan, parameters)
        
        return plan
    
    def _create_data_flow(self, plan: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Create data flow mapping between agents"""
        data_flow = {}
        
        # Initial data
        data_flow["initial"] = parameters
        
        # Agent outputs become inputs for dependent agents
        for step in plan.get("sequence", []):
            agent = step["agent"]
            depends_on = step.get("depends_on", [])
            
            data_flow[agent] = {
                "inputs": parameters,
                "dependencies": depends_on
            }
        
        for step in plan.get("parallel", []):
            agent = step["agent"]
            data_flow[agent] = {
                "inputs": parameters,
                "dependencies": []
            }
        
        return data_flow
    
    async def _execute_agents(self, execution_plan: Dict[str, Any], user_id: str, 
                            request_id: str, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute agents according to execution plan"""
        results = {}
        
        try:
            # Execute parallel agents first
            parallel_tasks = []
            for step in execution_plan.get("parallel", []):
                agent_name = step["agent"]
                if agent_name in self.agents:
                    task = self._execute_single_agent(
                        self.agents[agent_name], 
                        execution_plan["data_flow"][agent_name]["inputs"],
                        user_id, 
                        request_id, 
                        context
                    )
                    parallel_tasks.append((agent_name, task))
            
            # Wait for parallel tasks
            if parallel_tasks:
                parallel_results = await asyncio.gather(
                    *[task for _, task in parallel_tasks], 
                    return_exceptions=True
                )
                
                for (agent_name, _), result in zip(parallel_tasks, parallel_results):
                    if isinstance(result, Exception):
                        results[agent_name] = {
                            "success": False,
                            "error": str(result)
                        }
                    else:
                        results[agent_name] = result
            
            # Execute sequential agents
            for step in execution_plan.get("sequence", []):
                agent_name = step["agent"]
                depends_on = step.get("depends_on", [])
                
                if agent_name in self.agents:
                    # Prepare inputs with dependencies
                    agent_inputs = execution_plan["data_flow"][agent_name]["inputs"].copy()
                    
                    # Add results from dependencies
                    for dep_agent in depends_on:
                        if dep_agent in results and results[dep_agent].get("success"):
                            agent_inputs.update({
                                f"{dep_agent}_result": results[dep_agent].get("data", {})
                            })
                    
                    # Execute agent
                    result = await self._execute_single_agent(
                        self.agents[agent_name],
                        agent_inputs,
                        user_id,
                        request_id,
                        context
                    )
                    
                    results[agent_name] = result
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error executing agents: {e}")
            return {"error": str(e)}
    
    async def _execute_single_agent(self, agent: BaseAgent, inputs: Dict[str, Any], 
                                  user_id: str, request_id: str, 
                                  context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute a single agent"""
        try:
            # Prepare agent input
            agent_input = AgentInput(
                user_id=user_id,
                request_id=request_id,
                data=inputs,
                context=context
            )
            
            # Execute agent
            result = await agent.process(agent_input)
            
            return {
                "success": result.success,
                "data": result.data,
                "message": result.message,
                "confidence": result.confidence,
                "error": result.error
            }
            
        except Exception as e:
            self.logger.error(f"Error executing agent {agent.name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Agent {agent.name} failed"
            }
    
    def _combine_results(self, results: Dict[str, Any], intent: Dict[str, Any], 
                        execution_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Combine results from multiple agents"""
        combined = {
            "success": True,
            "intent": intent["type"],
            "data": {},
            "messages": [],
            "agents_used": execution_plan["agents"]
        }
        
        # Check if any agent failed
        failed_agents = [name for name, result in results.items() 
                         if not result.get("success", True)]
        
        if failed_agents:
            combined["success"] = False
            combined["error"] = f"Agents failed: {', '.join(failed_agents)}"
            return combined
        
        # Combine successful results
        for agent_name, result in results.items():
            if result.get("success"):
                combined["data"][agent_name] = result.get("data", {})
                if result.get("message"):
                    combined["messages"].append(result["message"])
        
        # Add intent-specific formatting
        combined = self._format_response_by_intent(combined, intent)
        
        return combined
    
    def _format_response_by_intent(self, response: Dict[str, Any], 
                                  intent: Dict[str, Any]) -> Dict[str, Any]:
        """Format response based on intent type"""
        intent_type = intent["type"]
        
        if intent_type == "comprehensive":
            # Create a summary view for comprehensive requests
            summary = self._create_comprehensive_summary(response["data"])
            response["summary"] = summary
            
        elif intent_type == "portfolio_management":
            # Focus on portfolio-specific data
            if "portfolio" in response["data"]:
                response["portfolio"] = response["data"]["portfolio"]
        
        elif intent_type == "analysis":
            # Focus on analysis results
            if "analysis" in response["data"]:
                response["analysis"] = response["data"]["analysis"]
        
        return response
    
    def _create_comprehensive_summary(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create comprehensive summary from multiple agent results"""
        summary = {
            "portfolio_health": "Unknown",
            "key_insights": [],
            "recommendations": [],
            "alerts": []
        }
        
        # Portfolio summary
        if "portfolio" in data:
            portfolio_data = data["portfolio"]
            if "analytics" in portfolio_data:
                analytics = portfolio_data["analytics"]
                total_value = analytics.get("total_value", 0)
                daily_change = analytics.get("daily_change", 0)
                
                if total_value > 0:
                    summary["portfolio_health"] = "Good" if daily_change >= 0 else "Declining"
                    summary["key_insights"].append(f"Portfolio value: ${total_value:,.2f}")
                    summary["key_insights"].append(f"Daily change: ${daily_change:,.2f}")
        
        # Analysis summary
        if "analysis" in data:
            analysis_data = data["analysis"]
            if "metrics" in analysis_data:
                metrics = analysis_data["metrics"]
                if "risk_score" in metrics:
                    risk_score = metrics["risk_score"]
                    if risk_score > 7:
                        summary["alerts"].append("High portfolio risk detected")
                
                if "recommendations" in analysis_data:
                    summary["recommendations"].extend(analysis_data["recommendations"])
        
        # News summary
        if "news" in data:
            news_data = data["news"]
            if "summary" in news_data:
                news_summary = news_data["summary"]
                if "headline" in news_summary:
                    summary["key_insights"].append(f"Market news: {news_summary['headline']}")
        
        return summary
    
    def _initialize_routing_rules(self) -> Dict[str, Any]:
        """Initialize routing rules for agent selection"""
        return {
            "portfolio": {
                "keywords": ["portfolio", "holdings", "add", "remove", "create"],
                "required_params": ["operation"],
                "optional_params": ["portfolio_id", "holding_data"]
            },
            "analysis": {
                "keywords": ["analyze", "risk", "performance", "recommendation"],
                "required_params": ["analysis_type", "portfolio_id"],
                "optional_params": ["period_days"]
            },
            "news": {
                "keywords": ["news", "market", "headlines"],
                "required_params": ["operation"],
                "optional_params": ["category", "limit", "portfolio_id"]
            },
            "jargon": {
                "keywords": ["what is", "explain", "define"],
                "required_params": ["query"],
                "optional_params": ["context"]
            }
        }
    
    def _initialize_collaboration_patterns(self) -> Dict[str, Any]:
        """Initialize agent collaboration patterns"""
        return {
            "portfolio_analysis": {
                "sequence": ["portfolio", "analysis"],
                "data_flow": {
                    "portfolio": ["portfolio_id"],
                    "analysis": ["portfolio_id", "portfolio_data"]
                }
            },
            "news_with_portfolio": {
                "parallel": ["portfolio", "news"],
                "merge_strategy": "portfolio_context"
            },
            "comprehensive_overview": {
                "parallel": ["portfolio", "news"],
                "sequence": ["analysis"],
                "dependencies": {
                    "analysis": ["portfolio"]
                }
            }
        }
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get information about all available agents"""
        return {
            agent_name: agent.get_agent_info()
            for agent_name, agent in self.agents.items()
        }
    
    def get_capabilities(self) -> Dict[str, List[str]]:
        """Get capabilities of all agents"""
        return self.agent_capabilities
