from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from app.agents.base_agent import BaseAgent, AgentInput, AgentOutput
from app.models.portfolio import Portfolio, Holding, AssetType
from app.services.portfolio_service import PortfolioService
from app.tools.market_data_tool import MarketDataTool

logger = logging.getLogger(__name__)


class PortfolioAgent(BaseAgent):
    """
    Agent responsible for portfolio management operations including:
    - Portfolio creation and updates
    - Holding management
    - Portfolio valuation
    - Performance tracking
    """
    
    def __init__(self):
        super().__init__(
            name="PortfolioAgent",
            description="Manages portfolio operations, holdings, and valuations"
        )
        self.portfolio_service = PortfolioService()
        self.market_data_tool = MarketDataTool()
    
    def get_required_data(self) -> List[str]:
        """Returns required data fields for this agent"""
        return [
            "operation",  # create, update, get, add_holding, remove_holding, value
            "portfolio_id"  # Required for most operations except create
        ]
    
    def get_output_schema(self) -> Dict[str, Any]:
        """Returns the output schema for this agent"""
        return {
            "portfolio": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "total_value": {"type": "number"},
                    "holdings": {"type": "array"}
                }
            },
            "holdings": {
                "type": "array",
                "items": {"type": "object"}
            },
            "analytics": {
                "type": "object",
                "properties": {
                    "total_value": {"type": "number"},
                    "total_invested": {"type": "number"},
                    "daily_change": {"type": "number"},
                    "asset_allocation": {"type": "object"}
                }
            }
        }
    
    async def process(self, input_data: AgentInput) -> AgentOutput:
        """Process portfolio-related requests"""
        start_time = datetime.utcnow()
        
        try:
            # Validate input
            if not await self.validate_input(input_data):
                return AgentOutput(
                    success=False,
                    error="Invalid input data",
                    message="Missing required fields"
                )
            
            operation = input_data.data.get("operation")
            
            # Route to appropriate operation
            if operation == "create":
                return await self._create_portfolio(input_data)
            elif operation == "get":
                return await self._get_portfolio(input_data)
            elif operation == "update":
                return await self._update_portfolio(input_data)
            elif operation == "add_holding":
                return await self._add_holding(input_data)
            elif operation == "remove_holding":
                return await self._remove_holding(input_data)
            elif operation == "update_holding":
                return await self._update_holding(input_data)
            elif operation == "value":
                return await self._calculate_portfolio_value(input_data)
            elif operation == "analytics":
                return await self._get_portfolio_analytics(input_data)
            else:
                return AgentOutput(
                    success=False,
                    error=f"Unknown operation: {operation}",
                    message="Supported operations: create, get, update, add_holding, remove_holding, update_holding, value, analytics"
                )
                
        except Exception as e:
            logger.error(f"PortfolioAgent error: {e}")
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to process portfolio request"
            )
    
    async def _create_portfolio(self, input_data: AgentInput) -> AgentOutput:
        """Create a new portfolio"""
        try:
            portfolio_data = input_data.data.get("portfolio_data", {})
            portfolio = await self.portfolio_service.create_portfolio(
                user_id=input_data.user_id,
                **portfolio_data
            )
            
            return AgentOutput(
                success=True,
                data={"portfolio": portfolio.dict()},
                message="Portfolio created successfully"
            )
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to create portfolio"
            )
    
    async def _get_portfolio(self, input_data: AgentInput) -> AgentOutput:
        """Get portfolio details"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            portfolio = await self.portfolio_service.get_portfolio(
                portfolio_id=portfolio_id,
                user_id=input_data.user_id
            )
            
            if not portfolio:
                return AgentOutput(
                    success=False,
                    error="Portfolio not found",
                    message="Portfolio not found or access denied"
                )
            
            return AgentOutput(
                success=True,
                data={"portfolio": portfolio.dict()},
                message="Portfolio retrieved successfully"
            )
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to retrieve portfolio"
            )
    
    async def _update_portfolio(self, input_data: AgentInput) -> AgentOutput:
        """Update portfolio details"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            update_data = input_data.data.get("update_data", {})
            
            portfolio = await self.portfolio_service.update_portfolio(
                portfolio_id=portfolio_id,
                user_id=input_data.user_id,
                **update_data
            )
            
            return AgentOutput(
                success=True,
                data={"portfolio": portfolio.dict()},
                message="Portfolio updated successfully"
            )
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to update portfolio"
            )
    
    async def _add_holding(self, input_data: AgentInput) -> AgentOutput:
        """Add a holding to portfolio"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            holding_data = input_data.data.get("holding_data", {})
            
            portfolio = await self.portfolio_service.add_holding(
                portfolio_id=portfolio_id,
                user_id=input_data.user_id,
                **holding_data
            )
            
            return AgentOutput(
                success=True,
                data={"portfolio": portfolio.dict()},
                message="Holding added successfully"
            )
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to add holding"
            )
    
    async def _remove_holding(self, input_data: AgentInput) -> AgentOutput:
        """Remove a holding from portfolio"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            symbol = input_data.data.get("symbol")
            
            portfolio = await self.portfolio_service.remove_holding(
                portfolio_id=portfolio_id,
                user_id=input_data.user_id,
                symbol=symbol
            )
            
            return AgentOutput(
                success=True,
                data={"portfolio": portfolio.dict()},
                message="Holding removed successfully"
            )
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to remove holding"
            )
    
    async def _update_holding(self, input_data: AgentInput) -> AgentOutput:
        """Update a holding in portfolio"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            symbol = input_data.data.get("symbol")
            update_data = input_data.data.get("update_data", {})
            
            portfolio = await self.portfolio_service.update_holding(
                portfolio_id=portfolio_id,
                user_id=input_data.user_id,
                symbol=symbol,
                **update_data
            )
            
            return AgentOutput(
                success=True,
                data={"portfolio": portfolio.dict()},
                message="Holding updated successfully"
            )
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to update holding"
            )
    
    async def _calculate_portfolio_value(self, input_data: AgentInput) -> AgentOutput:
        """Calculate current portfolio value with live prices"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            
            # Get portfolio
            portfolio = await self.portfolio_service.get_portfolio(
                portfolio_id=portfolio_id,
                user_id=input_data.user_id
            )
            
            if not portfolio:
                return AgentOutput(
                    success=False,
                    error="Portfolio not found"
                )
            
            # Get current market data for all holdings
            symbols = [holding.symbol for holding in portfolio.holdings]
            market_data = await self.market_data_tool.get_multiple_prices(symbols)
            
            # Calculate portfolio value
            total_value = 0
            updated_holdings = []
            
            for holding in portfolio.holdings:
                current_price = market_data.get(holding.symbol, {}).get("price")
                if current_price:
                    holding.current_price = current_price
                    market_value = holding.quantity * current_price
                    total_value += market_value
                    updated_holdings.append({
                        **holding.dict(),
                        "market_value": market_value,
                        "unrealized_pnl": market_value - (holding.quantity * holding.average_cost),
                        "unrealized_pnl_percent": ((market_value / (holding.quantity * holding.average_cost)) - 1) * 100
                    })
                else:
                    updated_holdings.append(holding.dict())
            
            analytics = {
                "total_value": total_value,
                "total_invested": sum(h.quantity * h.average_cost for h in portfolio.holdings),
                "daily_change": 0,  # Would need previous day's data
                "holdings_count": len(portfolio.holdings)
            }
            
            return AgentOutput(
                success=True,
                data={
                    "portfolio_id": portfolio_id,
                    "analytics": analytics,
                    "holdings": updated_holdings
                },
                message="Portfolio value calculated successfully"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to calculate portfolio value"
            )
    
    async def _get_portfolio_analytics(self, input_data: AgentInput) -> AgentOutput:
        """Get comprehensive portfolio analytics"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            
            # Get portfolio value first
            value_result = await self._calculate_portfolio_value(input_data)
            if not value_result.success:
                return value_result
            
            analytics = value_result.data.get("analytics", {})
            holdings = value_result.data.get("holdings", [])
            
            # Calculate asset allocation
            asset_allocation = {}
            sector_allocation = {}
            
            for holding in holdings:
                asset_type = holding.get("asset_type", "unknown")
                sector = holding.get("sector", "unknown")
                market_value = holding.get("market_value", 0)
                
                if market_value > 0:
                    asset_allocation[asset_type] = asset_allocation.get(asset_type, 0) + market_value
                    if sector != "unknown":
                        sector_allocation[sector] = sector_allocation.get(sector, 0) + market_value
            
            # Convert to percentages
            total_value = analytics.get("total_value", 0)
            if total_value > 0:
                asset_allocation = {k: (v / total_value) * 100 for k, v in asset_allocation.items()}
                sector_allocation = {k: (v / total_value) * 100 for k, v in sector_allocation.items()}
            
            # Top holdings
            top_holdings = sorted(
                [h for h in holdings if h.get("market_value", 0) > 0],
                key=lambda x: x.get("market_value", 0),
                reverse=True
            )[:10]
            
            analytics.update({
                "asset_allocation": asset_allocation,
                "sector_allocation": sector_allocation,
                "top_holdings": top_holdings
            })
            
            return AgentOutput(
                success=True,
                data={
                    "portfolio_id": portfolio_id,
                    "analytics": analytics
                },
                message="Portfolio analytics retrieved successfully"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to get portfolio analytics"
            )
