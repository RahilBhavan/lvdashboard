import pytest
import numpy as np
import pandas as pd
from models.vamer_model import predict_next_range

def generate_mock_price_data(n=200):
    """Generates synthetic OHLC-like close prices."""
    x = np.linspace(0, 10 * np.pi, n)
    # Sine wave + random noise to simulate volatility
    noise = np.random.normal(0, 50, n)
    trend = np.linspace(1000, 2000, n)
    prices = 1500 + 300 * np.sin(x) + noise + trend
    return prices.tolist()

def test_garch_convergence():
    """Ensure the GARCH model returns a non-negative volatility value."""
    prices = generate_mock_price_data(200)
    try:
        lower, upper = predict_next_range(prices)
        assert lower < upper, "Lower tick must be less than upper tick"
    except Exception as e:
        pytest.fail(f"Model failed to converge: {e}")

def test_range_width_sensitivity():
    """Verify that output range widens when input volatility increases."""
    # Low volatility input (linear growth)
    stable_prices = [1000 + i for i in range(200)]
    
    # High volatility input (random noise)
    volatile_prices = [1000 + np.random.normal(0, 100) for _ in range(200)]
    
    l1, u1 = predict_next_range(stable_prices)
    l2, u2 = predict_next_range(volatile_prices)
    
    width_stable = u1 - l1
    width_volatile = u2 - l2
    
    # Volatile market should result in wider tick range
    assert width_volatile > width_stable, "High vol should produce wider range"

def test_tick_validity():
    """Ensure returned ticks are valid Uniswap integers."""
    prices = generate_mock_price_data(150)
    lower, upper = predict_next_range(prices)
    
    # Uniswap V3 (fee 3000) uses tick spacing of 60
    assert lower % 60 == 0, "Lower tick must align with spacing 60"
    assert upper % 60 == 0, "Upper tick must align with spacing 60"
    
def test_insufficient_data():
    """Ensure error is raised for short history."""
    short_history = [1000, 1001, 1002]
    with pytest.raises(ValueError):
        predict_next_range(short_history)
