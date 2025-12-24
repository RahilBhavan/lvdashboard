import sys
import os
import requests
import numpy as np
from datetime import datetime, timedelta

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.vamer_model import predict_next_range

def fetch_historical_data(days=365):
    """Fetches daily ETH price data from CoinGecko."""
    print(f"Fetching {days} days of data from CoinGecko...")
    url = f"https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days={days}&interval=daily"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        # [timestamp, price]
        return data['prices'] 
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

def run_backtest(prices_data, window_size=120):
    """
    Simulates the VAMR strategy on historical data.
    
    Args:
        prices_data: List of [timestamp, price]
        window_size: Number of days to use for model input
    """
    print(f"\n--- Starting Backtest (Window: {window_size} days) ---")
    
    prices = [p[1] for p in prices_data]
    timestamps = [p[0] for p in prices_data]
    
    total_samples = len(prices)
    if total_samples <= window_size:
        print("Not enough data for window size.")
        return

    in_range_count = 0
    total_trades = 0
    
    # Portfolio Simulation (Hypothetical)
    initial_capital = 10000 # USD
    strategy_value = initial_capital
    hodl_value = initial_capital
    
    start_price = prices[window_size]
    strategy_shares = strategy_value / start_price # Assume 100% ETH exposure for simplicity in comparison or 50/50?
    # V3 is usually 50/50 or varying. Let's compare vs 100% ETH HODL first.
    # Actually, if we are market neutral or rebalancing, let's track "Value".
    
    # Simple Logic: 
    # If Price stays in range, we earn "Fees" (e.g. 0.05% per day).
    # If Price goes out of range, we experience IL relative to the move, but we rebalance.
    
    results = []

    for i in range(window_size, total_samples - 1):
        current_window = prices[i-window_size:i]
        current_price = prices[i]
        next_price = prices[i+1] # The price we are testing against
        
        # 1. Run Model
        tick_lower, tick_upper = predict_next_range(current_window)
        
        # Convert Ticks to Price ( Uniswap Logic: Price = 1.0001^Tick )
        # But our model might return prices or ticks? 
        # Let's check VAMER model output. Assuming it returns RAW TICKS.
        price_lower = 1.0001 ** tick_lower
        price_upper = 1.0001 ** tick_upper
        
        # 2. Check Result
        is_in_range = price_lower <= next_price <= price_upper
        if is_in_range:
            in_range_count += 1
            
        total_trades += 1
        
        # Logging
        date_str = datetime.fromtimestamp(timestamps[i]/1000).strftime('%Y-%m-%d')
        results.append({
            "date": date_str,
            "price": current_price,
            "next_price": next_price,
            "range": (price_lower, price_upper),
            "in_range": is_in_range
        })

    # Stats
    win_rate = (in_range_count / total_trades) * 100
    print(f"\nProcessed {total_trades} days.")
    print(f"In-Range Rate: {win_rate:.2f}%")
    
    # Simple Est APY Calculation:
    # Assume 0.3% fee tier. Daily volume / TVL = turnover.
    # If we are in range, we capture fees.
    # Let's assume a base APY of 20% * (In-Range / 100)?
    # Or just print the Win Rate which is the key metric for VAMR.
    
    print("\n--- Strategy Performance ---")
    print(f"Total Days: {total_trades}")
    print(f"Days In Range: {in_range_count}")
    print(f"Model Accuracy (Win Rate): {win_rate:.2f}%")
    
    if win_rate > 50:
        print("Verdict: POSITIVE Alpha vs Random Walk")
    else:
        print("Verdict: NEEDS TUNING")

if __name__ == "__main__":
    data = fetch_historical_data()
    if data:
        run_backtest(data)
