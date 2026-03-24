import yfinance as yf
from typing import Dict, Any, Optional
import logging
import requests

logger = logging.getLogger(__name__)

class MarketDataService:
    @staticmethod
    def get_current_price(symbol: str) -> Optional[float]:
        try:
            # 1. Instantly route Mutual Funds to MFAPI to bypass Yahoo Finance slowness
            is_mutual_fund = "FUND" in symbol.upper() or " " in symbol or len(symbol) > 15
            
            if is_mutual_fund:
                price = MarketDataService._fetch_from_mfapi(symbol)
                if price is not None:
                    return price
                    
            # 2. Heuristic for Indian stocks (useful for Zerodha/Groww) via yfinance
            fetch_symbol = symbol
            if not fetch_symbol.endswith('.NS') and not fetch_symbol.endswith('.BO'):
                fetch_symbol = f"{symbol}.NS"
                
            ticker = yf.Ticker(fetch_symbol)
            todays_data = ticker.history(period='1d')
            
            if not todays_data.empty:
                return float(todays_data['Close'].iloc[0])
            
            # 3. Fallback to exact symbol in yfinance
            ticker_fallback = yf.Ticker(symbol)
            fb_data = ticker_fallback.history(period='1d')
            if not fb_data.empty:
                return float(fb_data['Close'].iloc[0])
                
            # 4. Final safety net: if yfinance failed on a stock, maybe it was a weirdly named Mutual Fund
            if not is_mutual_fund:
                price = MarketDataService._fetch_from_mfapi(symbol)
                if price is not None:
                    return price
                
            return None
        except Exception as e:
            logger.warning(f"Could not fetch price for {symbol}: {e}")
            return None

    @staticmethod
    def _fetch_from_mfapi(symbol: str) -> Optional[float]:
        try:
            # Strip ISIN codes (e.g., INF846K01146) to improve search accuracy
            search_query = symbol.split("INF")[0].strip() if "INF" in symbol else symbol
            
            import requests
            search_res = requests.get(f"https://api.mfapi.in/mf/search?q={search_query}", timeout=4.0)
            if search_res.status_code == 200:
                results = search_res.json()
                if results and isinstance(results, list) and len(results) > 0:
                    best_match = results[0]
                    # Attempt to strictly match the Growth variant as it's the default in most Indian portfolios
                    for res in results:
                        name = res.get("schemeName", "").upper()
                        if "GROWTH" in name and "IDCW" not in name and "DIVIDEND" not in name:
                            best_match = res
                            break
                            
                    scheme_code = best_match.get("schemeCode")
                    if scheme_code:
                        nav_res = requests.get(f"https://api.mfapi.in/mf/{scheme_code}/latest", timeout=4.0)
                        if nav_res.status_code == 200:
                            nav_data = nav_res.json()
                            if nav_data.get("status") == "SUCCESS" and "data" in nav_data and len(nav_data["data"]) > 0:
                                return float(nav_data["data"][0]["nav"])
        except Exception as mf_err:
            logger.warning(f"MF API fetch failed for {symbol}: {mf_err}")
        return None
        return None
