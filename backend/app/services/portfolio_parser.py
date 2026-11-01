import pandas as pd
from io import BytesIO
from typing import List, Dict, Any
import logging
from app.schemas.portfolio import HoldingCreate
from app.models.portfolio import AssetType

logger = logging.getLogger(__name__)

class PortfolioParser:
    @staticmethod
    def parse_file(contents: bytes, filename: str) -> List[HoldingCreate]:
        try:
            if filename.endswith('.csv'):
                df_dict = {"csv": pd.read_csv(BytesIO(contents), header=None)}
            elif filename.endswith('.xlsx') or filename.endswith('.xls'):
                # Read all sheets concurrently into a dictionary of DataFrames
                df_dict = pd.read_excel(BytesIO(contents), header=None, sheet_name=None)
            
            # Avoid duplication: if a 'Combined' sheet exists, use ONLY that sheet
            combined_key = None
            for k in df_dict.keys():
                if str(k).strip().lower() == 'combined':
                    combined_key = k
                    break
            if combined_key:
                df_dict = {combined_key: df_dict[combined_key]}

            holdings = []
            
            for sheet_name, df in df_dict.items():
                if df.empty:
                    continue
                    
                # Find the actual header row for this specific sheet
                header_row_idx = None
                for idx, row in df.iterrows():
                    row_strs = [str(x).lower().strip() for x in row.values]
                    if any(k in row_strs for k in ["instrument", "symbol", "scrip", "stock name", "scheme name"]):
                        header_row_idx = idx
                        break
                        
                if header_row_idx is None:
                    continue
                        
                df.columns = df.iloc[header_row_idx]
                df = df.iloc[header_row_idx + 1:].reset_index(drop=True)

                # Clean column names (lowercase, strip whitespace)
                df.columns = [str(col).lower().strip() for col in df.columns]
                logger.info(f"Detected columns in {sheet_name}: {list(df.columns)}")
                
                for _, row in df.iterrows():
                    row_dict = row.to_dict()
                    
                    # Match common column names dynamically across brokers
                    symbol = PortfolioParser._find_val(["instrument", "symbol", "scrip", "stock name", "stock", "company", "company name", "scheme name", "stock_name", "fund_name"], row_dict)
                    quantity = PortfolioParser._find_val(["qty", "qty.", "quantity", "quantity available", "holdings", "shares", "total qty", "net qty", "available qty", "units", "quantity_available"], row_dict)
                    average_cost = PortfolioParser._find_val(["avg. cost", "average price", "avg price", "avg. price", "average cost", "avgcost", "purchase price", "buy price", "average_price"], row_dict)
                    current_price = PortfolioParser._find_val(["previous closing price", "previous closing", "ltp", "close", "current price", "cmp", "prev closing", "last price", "market price", "previous_closing_price"], row_dict)
                    
                    # Fallback for Mutual Fund Statements (e.g. Groww) where Average Cost isn't a column
                    if (average_cost is None or pd.isna(average_cost)) and quantity is not None and not pd.isna(quantity):
                        invested = PortfolioParser._find_val(["invested value", "invested amt", "invested"], row_dict)
                        if invested is not None and not pd.isna(invested) and float(quantity) > 0:
                            average_cost = float(invested) / float(quantity)

                    # Dynamic Asset Type
                    asset_type = AssetType.STOCK
                    if "scheme name" in row_dict and symbol == row_dict["scheme name"]:
                        asset_type = AssetType.MUTUAL_FUND
                    elif "isin" in row_dict and str(row_dict["isin"]).startswith("INF"):
                        asset_type = AssetType.MUTUAL_FUND

                    # Validation
                    if not symbol or pd.isna(symbol):
                        continue
                    if pd.isna(quantity) or float(quantity) <= 0:
                        continue
                    if average_cost is None or pd.isna(average_cost) or float(average_cost) <= 0:
                        continue
                    
                    # Use the file's current price directly — it's accurate (e.g. Zerodha previous closing)
                    file_current_price = None
                    if current_price is not None and not pd.isna(current_price):
                        try:
                            file_current_price = float(current_price)
                        except (ValueError, TypeError):
                            pass

                    # If no current price in file, fall back to average_cost (0 P&L shown)
                    if file_current_price is None or file_current_price <= 0:
                        file_current_price = float(average_cost)

                    logger.info(f"Parsed holding: {symbol}, qty={quantity}, avg_cost={average_cost}, file_current_price={file_current_price}")

                    holdings.append(HoldingCreate(
                        symbol=str(symbol).strip().upper(),
                        name=str(symbol).strip(),
                        asset_type=asset_type,
                        quantity=float(quantity),
                        average_cost=float(average_cost),
                        current_price=file_current_price,
                        currency="INR",
                        metadata={}
                    ))
            
            return holdings
            
        except Exception as e:
            logger.error(f"Error parsing portfolio file: {str(e)}")
            raise e

    @staticmethod
    def _find_val(possible_keys: List[str], row_dict: Dict[str, Any]) -> Any:
        for key in possible_keys:
            if key in row_dict:
                return row_dict[key]
        return None
