from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

from app.agents.base_agent import BaseAgent, AgentInput, AgentOutput
from app.models.analysis import PortfolioAnalysis, AnalysisType, AnalysisStatus
from app.services.analysis_service import AnalysisService
from app.tools.market_data_tool import MarketDataTool
from app.tools.risk_calculator import RiskCalculator

logger = logging.getLogger(__name__)


class AnalysisAgent(BaseAgent):
    """
    Agent responsible for portfolio analysis including:
    - Performance analysis
    - Risk assessment
    - Asset allocation analysis
    - Portfolio optimization suggestions
    """
    
    def __init__(self):
        super().__init__(
            name="AnalysisAgent",
            description="Performs comprehensive portfolio analysis and risk assessment"
        )
        self.analysis_service = AnalysisService()
        self.market_data_tool = MarketDataTool()
        self.risk_calculator = RiskCalculator()
    
    def get_required_data(self) -> List[str]:
        """Returns required data fields for this agent"""
        return [
            "analysis_type",  # performance, risk, allocation, recommendation
            "portfolio_id"
        ]
    
    def get_output_schema(self) -> Dict[str, Any]:
        """Returns the output schema for this agent"""
        return {
            "analysis": {
                "type": "object",
                "properties": {
                    "total_return": {"type": "number"},
                    "annualized_return": {"type": "number"},
                    "volatility": {"type": "number"},
                    "sharpe_ratio": {"type": "number"},
                    "max_drawdown": {"type": "number"},
                    "risk_score": {"type": "number"}
                }
            },
            "recommendations": {
                "type": "array",
                "items": {"type": "object"}
            },
            "insights": {
                "type": "array",
                "items": {"type": "string"}
            }
        }
    
    async def process(self, input_data: AgentInput) -> AgentOutput:
        """Process analysis requests"""
        try:
            if not await self.validate_input(input_data):
                return AgentOutput(
                    success=False,
                    error="Invalid input data",
                    message="Missing required fields"
                )
            
            analysis_type = input_data.data.get("analysis_type")
            
            # Route to appropriate analysis
            if analysis_type == "performance":
                return await self._performance_analysis(input_data)
            elif analysis_type == "risk":
                return await self._risk_analysis(input_data)
            elif analysis_type == "allocation":
                return await self._allocation_analysis(input_data)
            elif analysis_type == "comprehensive":
                return await self._comprehensive_analysis(input_data)
            elif analysis_type == "recommendation":
                return await self._recommendation_analysis(input_data)
            else:
                return AgentOutput(
                    success=False,
                    error=f"Unknown analysis type: {analysis_type}",
                    message="Supported types: performance, risk, allocation, comprehensive, recommendation"
                )
                
        except Exception as e:
            logger.error(f"AnalysisAgent error: {e}")
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to process analysis request"
            )
    
    async def _performance_analysis(self, input_data: AgentInput) -> AgentOutput:
        """Perform portfolio performance analysis"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            period_days = input_data.data.get("period_days", 365)
            
            # Get historical data for portfolio
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=period_days)
            
            # This would typically fetch from database
            # For now, we'll simulate analysis
            performance_metrics = await self._calculate_performance_metrics(
                portfolio_id, start_date, end_date
            )
            
            insights = self._generate_performance_insights(performance_metrics)
            
            return AgentOutput(
                success=True,
                data={
                    "analysis_type": "performance",
                    "period_days": period_days,
                    "metrics": performance_metrics,
                    "insights": insights
                },
                message="Performance analysis completed successfully"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to perform performance analysis"
            )
    
    async def _risk_analysis(self, input_data: AgentInput) -> AgentOutput:
        """Perform portfolio risk analysis"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            
            # Calculate risk metrics
            risk_metrics = await self._calculate_risk_metrics(portfolio_id)
            
            # Generate risk insights
            risk_factors = self._identify_risk_factors(risk_metrics)
            risk_score = self._calculate_risk_score(risk_metrics)
            
            return AgentOutput(
                success=True,
                data={
                    "analysis_type": "risk",
                    "risk_metrics": risk_metrics,
                    "risk_factors": risk_factors,
                    "risk_score": risk_score,
                    "risk_level": self._get_risk_level(risk_score)
                },
                message="Risk analysis completed successfully"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to perform risk analysis"
            )
    
    async def _allocation_analysis(self, input_data: AgentInput) -> AgentOutput:
        """Perform asset allocation analysis"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            
            # Get current allocation
            allocation = await self._get_current_allocation(portfolio_id)
            
            # Analyze allocation efficiency
            allocation_analysis = self._analyze_allocation_efficiency(allocation)
            
            # Generate allocation recommendations
            recommendations = self._generate_allocation_recommendations(
                allocation, allocation_analysis
            )
            
            return AgentOutput(
                success=True,
                data={
                    "analysis_type": "allocation",
                    "current_allocation": allocation,
                    "analysis": allocation_analysis,
                    "recommendations": recommendations
                },
                message="Allocation analysis completed successfully"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to perform allocation analysis"
            )
    
    async def _comprehensive_analysis(self, input_data: AgentInput) -> AgentOutput:
        """Perform comprehensive portfolio analysis"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            
            # Run all analysis types
            performance_result = await self._performance_analysis(input_data)
            risk_result = await self._risk_analysis(input_data)
            allocation_result = await self._allocation_analysis(input_data)
            
            # Combine results
            comprehensive_analysis = {
                "performance": performance_result.data if performance_result.success else {},
                "risk": risk_result.data if risk_result.success else {},
                "allocation": allocation_result.data if allocation_result.success else {}
            }
            
            # Generate overall insights
            overall_insights = self._generate_overall_insights(comprehensive_analysis)
            
            return AgentOutput(
                success=True,
                data={
                    "analysis_type": "comprehensive",
                    "comprehensive_analysis": comprehensive_analysis,
                    "overall_insights": overall_insights,
                    "summary": self._generate_analysis_summary(comprehensive_analysis)
                },
                message="Comprehensive analysis completed successfully"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to perform comprehensive analysis"
            )
    
    async def _recommendation_analysis(self, input_data: AgentInput) -> AgentOutput:
        """Generate portfolio recommendations"""
        try:
            portfolio_id = input_data.data.get("portfolio_id")
            
            # First run comprehensive analysis
            comprehensive_result = await self._comprehensive_analysis(input_data)
            
            if not comprehensive_result.success:
                return comprehensive_result
            
            # Generate recommendations based on analysis
            recommendations = await self._generate_recommendations(
                comprehensive_result.data.get("comprehensive_analysis", {})
            )
            
            return AgentOutput(
                success=True,
                data={
                    "analysis_type": "recommendation",
                    "recommendations": recommendations,
                    "priority": self._prioritize_recommendations(recommendations)
                },
                message="Recommendations generated successfully"
            )
            
        except Exception as e:
            return AgentOutput(
                success=False,
                error=str(e),
                message="Failed to generate recommendations"
            )
    
    async def _calculate_performance_metrics(self, portfolio_id: str, 
                                            start_date: datetime, 
                                            end_date: datetime) -> Dict[str, float]:
        """Calculate performance metrics for a portfolio"""
        # This would typically fetch historical portfolio values from database
        # For now, return simulated metrics
        
        return {
            "total_return": 15.5,  # Percentage
            "annualized_return": 12.3,
            "volatility": 18.7,
            "sharpe_ratio": 0.85,
            "max_drawdown": -12.3,
            "beta": 1.1,
            "alpha": 2.1,
            "information_ratio": 0.45
        }
    
    def _generate_performance_insights(self, metrics: Dict[str, float]) -> List[str]:
        """Generate insights from performance metrics"""
        insights = []
        
        if metrics.get("total_return", 0) > 10:
            insights.append("Portfolio has delivered strong returns exceeding 10%")
        
        if metrics.get("sharpe_ratio", 0) > 1:
            insights.append("Excellent risk-adjusted returns with Sharpe ratio above 1")
        elif metrics.get("sharpe_ratio", 0) < 0.5:
            insights.append("Consider improving risk-adjusted returns")
        
        if metrics.get("max_drawdown", 0) < -15:
            insights.append("Portfolio experienced significant drawdown - consider risk management")
        
        if metrics.get("alpha", 0) > 0:
            insights.append("Portfolio outperformed benchmark with positive alpha")
        
        return insights
    
    async def _calculate_risk_metrics(self, portfolio_id: str) -> Dict[str, Any]:
        """Calculate risk metrics for a portfolio"""
        # Simulated risk calculations
        return {
            "portfolio_volatility": 18.7,
            "value_at_risk_95": -8.5,  # 95% VaR
            "conditional_var_95": -12.3,  # Expected shortfall
            "beta": 1.1,
            "correlation_to_market": 0.85,
            "concentration_risk": 0.35,  # Top 5 holdings concentration
            "sector_concentration": 0.45,
            "geographic_concentration": 0.25
        }
    
    def _identify_risk_factors(self, risk_metrics: Dict[str, Any]) -> List[str]:
        """Identify key risk factors"""
        factors = []
        
        if risk_metrics.get("portfolio_volatility", 0) > 20:
            factors.append("High portfolio volatility")
        
        if risk_metrics.get("concentration_risk", 0) > 0.4:
            factors.append("High concentration in few holdings")
        
        if risk_metrics.get("sector_concentration", 0) > 0.5:
            factors.append("Sector concentration risk")
        
        if risk_metrics.get("beta", 0) > 1.2:
            factors.append("High market sensitivity")
        
        return factors
    
    def _calculate_risk_score(self, risk_metrics: Dict[str, Any]) -> float:
        """Calculate overall risk score (1-10)"""
        score = 5.0  # Base score
        
        # Adjust for volatility
        volatility = risk_metrics.get("portfolio_volatility", 15)
        score += (volatility - 15) / 5
        
        # Adjust for concentration
        concentration = risk_metrics.get("concentration_risk", 0.3)
        score += concentration * 3
        
        # Adjust for beta
        beta = risk_metrics.get("beta", 1.0)
        score += (beta - 1.0) * 2
        
        return max(1.0, min(10.0, score))
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Get risk level description"""
        if risk_score <= 3:
            return "Low"
        elif risk_score <= 6:
            return "Medium"
        elif risk_score <= 8:
            return "High"
        else:
            return "Very High"
    
    async def _get_current_allocation(self, portfolio_id: str) -> Dict[str, Any]:
        """Get current portfolio allocation"""
        # This would fetch from database
        return {
            "stocks": 60.0,
            "bonds": 25.0,
            "mutual_funds": 10.0,
            "cash": 5.0,
            "sectors": {
                "technology": 35.0,
                "healthcare": 15.0,
                "finance": 20.0,
                "consumer": 15.0,
                "others": 15.0
            }
        }
    
    def _analyze_allocation_efficiency(self, allocation: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze allocation efficiency"""
        return {
            "diversification_score": 7.5,
            "efficiency_score": 6.8,
            "rebalancing_needed": True,
            "overweight_sectors": ["technology"],
            "underweight_sectors": ["bonds", "consumer"]
        }
    
    def _generate_allocation_recommendations(self, allocation: Dict[str, Any], 
                                          analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate allocation recommendations"""
        recommendations = []
        
        if analysis.get("rebalancing_needed", False):
            recommendations.append({
                "type": "rebalancing",
                "priority": "medium",
                "action": "Rebalance portfolio to target allocation",
                "details": "Consider reducing technology exposure and increasing bond allocation"
            })
        
        return recommendations
    
    async def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate comprehensive recommendations"""
        recommendations = []
        
        # Performance-based recommendations
        performance = analysis.get("performance", {}).get("metrics", {})
        if performance.get("sharpe_ratio", 0) < 0.5:
            recommendations.append({
                "type": "performance",
                "priority": "high",
                "action": "Improve risk-adjusted returns",
                "details": "Consider adding low-correlation assets to improve Sharpe ratio"
            })
        
        # Risk-based recommendations
        risk = analysis.get("risk", {})
        if risk.get("risk_score", 5) > 7:
            recommendations.append({
                "type": "risk",
                "priority": "high",
                "action": "Reduce portfolio risk",
                "details": "Consider diversification and reducing concentration"
            })
        
        return recommendations
    
    def _prioritize_recommendations(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Prioritize recommendations"""
        priority_order = {"high": 1, "medium": 2, "low": 3}
        return sorted(recommendations, key=lambda x: priority_order.get(x.get("priority", "low"), 3))
    
    def _generate_overall_insights(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate overall insights from comprehensive analysis"""
        insights = []
        
        performance = analysis.get("performance", {}).get("metrics", {})
        risk = analysis.get("risk", {})
        
        if performance.get("total_return", 0) > 0 and risk.get("risk_score", 5) < 7:
            insights.append("Portfolio demonstrates good balance of returns and risk")
        
        if risk.get("concentration_risk", 0) > 0.4:
            insights.append("Consider diversifying to reduce concentration risk")
        
        return insights
    
    def _generate_analysis_summary(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate analysis summary"""
        return {
            "overall_health": "Good",
            "key_strengths": ["Strong returns", "Diversified sectors"],
            "areas_for_improvement": ["Risk management", "Allocation efficiency"],
            "action_items_count": len(analysis.get("allocation", {}).get("recommendations", []))
        }
