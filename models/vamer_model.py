# models/vamer_model.py
import pandas as pd
import numpy as np
from arch import arch_model

def predict_next_range(price_history: list) -> tuple:
    """
    Predicts the next trading range using GARCH(1,1) Volatility Forecasting.
    
    Args:
        price_history (list): List of historical closing prices.
        
    Returns:
        tuple: (tick_lower, tick_upper) for Uniswap V3
    """
    if len(price_history) < 100:
        raise ValueError("Insufficient data points")

    # 1. Calculate Log Returns
    df = pd.DataFrame(price_history, columns=['price'])
    df['returns'] = 100 * np.log(df['price'] / df['price'].shift(1))
    df = df.dropna()

    # 2. Fit GARCH(1,1) Model
    # Volatility Adjusted Mean Reversion
    model = arch_model(df['returns'], vol='Garch', p=1, q=1)
    results = model.fit(disp='off')
    
    # Forecast next day volatility (sigma)
    forecast = results.forecast(horizon=1)
    sigma = np.sqrt(forecast.variance.values[-1, :])[0] / 100 # Convert back from percentage
    
    current_price = price_history[-1]
    
    # 3. Define Range (2.0 Sigma - 95% Confidence Interval)
    lower_price = current_price * (1 - 2.0 * sigma)
    upper_price = current_price * (1 + 2.0 * sigma)
    
    # 4. Convert to Uniswap Ticks (Base 1.0001)
    # tick = log(price) / log(1.0001)
    tick_lower = int(np.log(lower_price) / np.log(1.0001))
    tick_upper = int(np.log(upper_price) / np.log(1.0001))
    
    # Align to spacing (e.g. 60 for fee tier 3000)
    spacing = 60
    tick_lower = (tick_lower // spacing) * spacing
    tick_upper = (tick_upper // spacing) * spacing

    return (tick_lower, tick_upper)
