
import sys
import os

# Add the backend directory to sys.path
backend_dir = r"c:\Users\Rutu Mahesh Ghatge\OneDrive\Desktop\Projects\Investment_Intelligence\backend"
sys.path.append(backend_dir)


try:
    from app.agents.analysis_agent import AnalysisAgent
    print("Imported AnalysisAgent successfully")
    
    print(f"AnalysisAgent MRO: {AnalysisAgent.mro()}")
    import app.agents.base_agent
    print(f"BaseAgent from file: {app.agents.base_agent.BaseAgent}")
    print(f"BaseAgent dir: {dir(app.agents.base_agent.BaseAgent)}")
    
    agent = AnalysisAgent()

    print("Instantiated AnalysisAgent successfully")
    print(f"Agent name: {agent.name}")
    print(f"Agent role: {agent.role}")

except Exception as e:
    import traceback
    print(f"Caught error: {e}")
    traceback.print_exc()
