import asyncio
import logging
from app.agents.orchestrator import orchestrator

# Configure logging to capture everything
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('app')
# Also capture our utility logs
logging.getLogger('app.utils.ai_utils').setLevel(logging.DEBUG)

async def test_geo():
    symbols = ["RELIANCE", "TCS", "INFY"]
    print(f"Triggering geopolitics chain for: {symbols}")
    result = await orchestrator.process_geopolitics_chain(symbols)
    print("\n--- RESULT ---")
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(test_geo())
