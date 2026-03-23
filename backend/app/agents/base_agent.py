from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
from pydantic import BaseModel
import time

from app.config.settings import settings
from app.models.analysis import AgentResponse

logger = logging.getLogger(__name__)


class AgentInput(BaseModel):
    """Base input structure for all agents"""
    user_id: str
    portfolio_id: Optional[str] = None
    request_id: Optional[str] = None
    data: Dict[str, Any] = {}
    context: Optional[Dict[str, Any]] = None


class AgentOutput(BaseModel):
    """Base output structure for all agents"""
    success: bool
    data: Dict[str, Any] = {}
    message: Optional[str] = None
    confidence: Optional[float] = None
    reasoning: Optional[str] = None
    processing_time_ms: Optional[int] = None
    error: Optional[str] = None


class BaseAgent(ABC):
    """Base class for all specialized agents"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.logger = logging.getLogger(f"{__name__}.{name}")
        
    @abstractmethod
    async def process(self, input_data: AgentInput) -> AgentOutput:
        """
        Process the input data and return agent output
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            AgentOutput: Results of processing
        """
        pass
    
    @abstractmethod
    def get_required_data(self) -> List[str]:
        """
        Returns list of required data fields for this agent
        """
        pass
    
    @abstractmethod
    def get_output_schema(self) -> Dict[str, Any]:
        """
        Returns the output schema for this agent
        """
        pass
    
    async def validate_input(self, input_data: AgentInput) -> bool:
        """
        Validate input data before processing
        
        Args:
            input_data: Input data to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        required_fields = self.get_required_data()
        
        for field in required_fields:
            if field not in input_data.data:
                self.logger.error(f"Missing required field: {field}")
                return False
                
        return True
    
    async def log_response(self, input_data: AgentInput, output: AgentOutput, 
                          processing_time_ms: int, tokens_used: Optional[int] = None):
        """
        Log agent response to database for analytics and debugging
        
        Args:
            input_data: Original input data
            output: Agent output
            processing_time_ms: Processing time in milliseconds
            tokens_used: Number of tokens used (if applicable)
        """
        try:
            # This would typically save to database
            # For now, we'll just log
            self.logger.info(f"Agent {self.name} processed request {input_data.request_id} "
                           f"in {processing_time_ms}ms with success: {output.success}")
                           
        except Exception as e:
            self.logger.error(f"Failed to log agent response: {e}")
    
    def get_agent_info(self) -> Dict[str, Any]:
        """
        Get agent information and capabilities
        """
        return {
            "name": self.name,
            "description": self.description,
            "required_data": self.get_required_data(),
            "output_schema": self.get_output_schema()
        }


class ToolInterface(ABC):
    """Interface for tools that agents can use"""
    
    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the tool with given parameters
        
        Args:
            parameters: Tool parameters
            
        Returns:
            Dict containing tool results
        """
        pass
    
    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        """
        Get the tool schema
        """
        pass


class AgentMemory:
    """Memory layer for agents to store and retrieve context"""
    
    def __init__(self):
        self.short_term_memory: Dict[str, Any] = {}
        self.long_term_memory: Dict[str, Any] = {}
    
    def store_short_term(self, key: str, value: Any, ttl_seconds: int = 3600):
        """Store data in short-term memory with TTL"""
        self.short_term_memory[key] = {
            "value": value,
            "expires_at": datetime.utcnow().timestamp() + ttl_seconds
        }
    
    def get_short_term(self, key: str) -> Optional[Any]:
        """Retrieve data from short-term memory"""
        if key in self.short_term_memory:
            item = self.short_term_memory[key]
            if item["expires_at"] > datetime.utcnow().timestamp():
                return item["value"]
            else:
                del self.short_term_memory[key]
        return None
    
    def store_long_term(self, key: str, value: Any):
        """Store data in long-term memory"""
        self.long_term_memory[key] = value
    
    def get_long_term(self, key: str) -> Optional[Any]:
        """Retrieve data from long-term memory"""
        return self.long_term_memory.get(key)
    
    def clear_expired(self):
        """Clear expired short-term memory entries"""
        current_time = datetime.utcnow().timestamp()
        expired_keys = [
            key for key, item in self.short_term_memory.items()
            if item["expires_at"] <= current_time
        ]
        for key in expired_keys:
            del self.short_term_memory[key]


class AgentContext:
    """Context manager for agent operations"""
    
    def __init__(self, agent: BaseAgent, input_data: AgentInput):
        self.agent = agent
        self.input_data = input_data
        self.start_time = None
        self.memory = AgentMemory()
    
    async def __aenter__(self):
        self.start_time = time.time()
        self.agent.logger.info(f"Starting agent {self.agent.name} for request {self.input_data.request_id}")
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        processing_time = int((time.time() - self.start_time) * 1000)
        self.agent.logger.info(f"Completed agent {self.agent.name} in {processing_time}ms")
        
        if exc_type:
            self.agent.logger.error(f"Agent {self.agent.name} failed: {exc_val}")
        
        return False  # Don't suppress exceptions
