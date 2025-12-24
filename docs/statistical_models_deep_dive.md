# Statistical Model Specification: The Quant Engine

## 1. Overview
The Liquidity Vector protocol relies on two core predictive engines to determine the "Vector" (Magnitude and Direction) of liquidity. Unlike standard AMMs which assume price is a random walk, our models assume **Volatility Clustering** and **Mean Reversion**.

---

## 2. Model A: Volatility-Adjusted Mean Reversion (VAMR)
**Purpose:** To define the **Magnitude** (width) of the liquidity range `[tickLower, tickUpper]`.

### A. The Core Thesis
Volatility is not constant. It "clusters." Periods of high volatility are likely to be followed by high volatility, and calm periods by calm periods. We use **GARCH (Generalized Autoregressive Conditional Heteroskedasticity)** to predict future volatility based on past variance.

### B. The Mathematical Formula (GARCH 1,1)
Instead of a simple Standard Deviation (which lags), we forecast variance ($\\sigma^2_t$) for the next epoch:

$$
\\sigma^2_t = \\omega + \\alpha \\epsilon^2_{t-1} + \\beta \\sigma^2_{t-1}
$$

*   $\\omega$ (omega): Long-run average variance weight.
*   $\\alpha$ (alpha): Reaction to recent shocks (market news).
*   `beta` (beta): Persistence of volatility (how long the shock lasts).
*   `epsilon`^2_{t-1}: The squared residual (error) from the previous time step.

### C. Calculating the Range (The "Vector Width")
Once we have the predicted volatility ($\\sigma_{pred}$), we define the liquidity range boundaries. We assume log-normal price distribution.

1.  **Select Confidence Interval ($Z$):**
    *   *Harvest Mode:* $Z = 0.5$ (Aggressive, ~38% probability mass).
    *   *Normal Mode:* $Z = 2.0$ (Standard, ~95% probability mass).
    *   *Guard Mode:* $Z = 4.0$ (Defensive, >99% probability mass).

2.  **Calculate Boundaries:**
    $$ P_{upper} = P_{current} \\cdot e^{(Z \\cdot \\sigma_{pred} \\cdot \\sqrt{T})} $$
    $$ P_{lower} = P_{current} \\cdot e^{(-Z \\cdot \\sigma_{pred} \\cdot \\sqrt{T})} $$
    *   $T$: Duration of the next rebalance epoch (e.g., 1 day = 1/365).

### D. Python Implementation Logic
```python
from arch import arch_model

def predict_volatility(returns):
    # Fit a GARCH(1,1) model to the last 30 days of hourly returns
    am = arch_model(returns, vol='Garch', p=1, o=0, q=1, dist='Normal')
    res = am.fit(disp='off')
    
    # Forecast variance for the next 1-step (next hour/day)
    forecasts = res.forecast(horizon=1)
    next_vol = np.sqrt(forecasts.variance.iloc[-1, 0])
    
    return next_vol
```

---

## 3. Model B: The Trend Filter (Delta Bias)
**Purpose:** To define the **Direction** of the vector (Long, Short, or Neutral).

### A. The Logic
We use a **Trend Following** overlay to protect against "catching a falling knife." If a strong trend is detected, we skew the range or hedge.

### B. The Indicator: EMA Crossover + Momentum
We compare the Fast Exponential Moving Average (EMA_fast) vs. Slow EMA (EMA_slow).

$$ EMA_t = \\text{Price}_t \\cdot \\left( \\frac{2}{N+1} \\right) + EMA_{t-1} \\cdot \\left( 1 - \\frac{2}{N+1} \\right) $$

*   **Signal Generation:**
    *   **Bullish:** $EMA_{12h} > EMA_{24h}$ AND Momentum > 0.
    *   **Bearish:** $EMA_{12h} < EMA_{24h}$ AND Momentum < 0.

### C. Delta Adjustment Matrix
The model outputs a target **Hedge Ratio** ($h$):

| Market State | Signal Strength | Action | Target Delta ($\\Delta$) |
| :--- | :--- | :--- | :--- |
| **Uptrend** | Strong | Provide Single-Sided Liquidity (Bid support) | 1.0 (Long) |
| **Ranging** | Neutral | Standard 50/50 LP | ~0.5 (Neutral-ish) |
| **Downtrend** | Weak | Delta Neutral Hedge (Borrow Asset) | 0.0 (Fully Hedged) |
| **Crash** | Strong | Short Bias (Borrow Excess Asset) | -0.5 (Short) |

---

## 4. Model C: Correlation-Based Pair Selection (CBPS)
**Purpose:** For multi-asset vaults, selecting which pairs to LP to minimize Divergence Loss.

### A. Pearson Correlation Coefficient
We calculate the rolling 30-day correlation ($\\rho$) between Asset A and Asset B.

$$ \\rho_{A,B} = \\frac{\\text{Cov}(A,B)}{\\sigma_A \\sigma_B} $$

### B. Co-Integration Test (Augmented Dickey-Fuller)
Correlation is not enough (two assets can go up together but drift apart). We need **Co-integration**—meaning the *spread* between them is mean-reverting.

*   **Logic:**
    1.  Calculate Spread: $S_t = \\log(P_A) - \\gamma \\log(P_B)$
    2.  Run ADF Test on $S_t$.
    3.  **If p-value < 0.05:** The pair is mean-reverting. **SAFE to LP.**
    4.  **If p-value > 0.05:** The pair is drifting. **UNSAFE.**

---

## 5. Data Ingestion Pipeline
To feed these models, the off-chain worker aggregates:

1.  **Granularity:** 1-Hour Candles (OHLCV).
2.  **Source:** Aggregated feed from 3 CEXs (Binance, Coinbase, Kraken) via CCXT + On-chain Uniswap Oracle (Twap).
3.  **Sanity Check:** If CEX Price deviates > 2% from DEX Price, the model **halts** (assumes bridge hack or depeg).

```