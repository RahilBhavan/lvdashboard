# models/trend_model.py
import pandas as pd
import numpy as np

def get_hedge_ratio(price_history: list) -> float:
    """
    Determines the hedge ratio using an EMA Crossover strategy.
    
    Args:
        price_history (list): List of historical closing prices.
        
    Returns:
        float: 1.0 if Short/Hedge (Downtrend), 0.0 if Long (Uptrend).
    """
    if len(price_history) < 25:
        return 0.0 # Insufficient data, default to Long

    df = pd.DataFrame(price_history, columns=['price'])
    
    # Calculate Exponential Moving Averages
    df['ema_12'] = df['price'].ewm(span=12, adjust=False).mean()
    df['ema_24'] = df['price'].ewm(span=24, adjust=False).mean()
    
    last_row = df.iloc[-1]
    
    # Trend Logic
    # Downtrend (Bearish) -> Hedge (Short exposure to neutralize Delta)
    if last_row['ema_12'] < last_row['ema_24']:
        return 1.0 
    
    # Uptrend (Bullish) -> No Hedge (Long exposure to capture upside)
    return 0.0
