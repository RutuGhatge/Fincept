#!/usr/bin/env python3
"""
Simple test script to verify geopolitical API fix
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agents.orchestrator import orchestrator

async def test_geopolitics_fix():
    """Test the geopolitical analysis with fallback handling"""
    print("Testing geopolitical analysis with quota exhausted scenario...")
    
    # Test with sample symbols
    symbols = ['AXIS LARGE & MID CAP FUND', 'HDFC BANKING AND PSU DEBT FUND']
    
    try:
        result = await orchestrator.process_geopolitics_chain(symbols)
        
        print("=== RESULT ===")
        print(f"Success: {result.get('success', False)}")
        
        if result.get('success'):
            data = result.get('data', {})
            print(f"Geo News items: {len(data.get('geo_news', []))}")
            print(f"Portfolio impacts: {len(data.get('portfolio_impact', []))}")
            print(f"Reasoning steps: {len(data.get('reasoning_path', []))}")
            
            # Show sample data
            if data.get('geo_news'):
                print(f"Sample news: {data['geo_news'][0].get('title', 'N/A')}")
            
            if data.get('portfolio_impact'):
                print(f"Sample impact: {data['portfolio_impact'][0].get('symbol', 'N/A')} - {data['portfolio_impact'][0].get('impact', 'N/A')}")
        else:
            print(f"Error: {result.get('error', 'Unknown error')}")
            
        print("=== TEST COMPLETED ===")
        return result
        
    except Exception as e:
        print(f"Test failed with exception: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    asyncio.run(test_geopolitics_fix())
