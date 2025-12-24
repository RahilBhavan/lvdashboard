# Success Metrics & KPIs: The "Vector" Scorecard

## 1. The North Star: Risk-Adjusted Return (Sharpe Ratio)
We do not just chase "High APY." A 50% APY is useless if you lost 60% of your principal.
*   **The Metric:** **Information Ratio (IR)** against ETH.
*   **The Formula:**
    $$ IR = \frac{R_p - R_b}{\sigma_{excess}} $$
    *   $R_p$: Return of the Liquidity Vector Vault.
    *   $R_b$: Return of the Benchmark (Holding 50% ETH / 50% USDC).
    *   $\sigma_{excess}$: Standard deviation of the difference (Tracking Error).
*   **Target:** **IR > 0.5**. This proves we are adding "Alpha" (Skill) rather than just adding "Beta" (Market Risk).

---

## 2. Core Performance Metrics (User Centric)

### A. Impermanent Loss Reduction Coefficient (ILRC)
Quantifies how much better the model is than a "dumb" Uniswap position.
*   **Formula:**
    $$ ILRC = 1 - \frac{|IL_{Vector}|}{|IL_{Passive}|} $$
*   **Benchmark:** A standard Uniswap V3 position with infinite range (Full Range).
*   **Goal:** **> 40%**.
    *   *Meaning:* We successfully avoided 40% of the losses a normal LP suffered during volatility.

### B. The "Vector Accuracy" Score
Did the market actually move in the direction we predicted?
*   **Logic:**
    *   If Model said **"Long"** (Delta > 0.3) -> Did Price rise over next 24h?
    *   If Model said **"Guard"** (Wide Range) -> Did Volatility (IV) increase?
*   **Target:** **> 60% Hit Rate**. (In trading, a 55% win rate is "World Class" if winners are larger than losers).

### C. Real Yield vs. Dilutive Yield
*   **Metric:** Percentage of APY derived from **Swap Fees** vs. **Reward Tokens**.
*   **Target:** **> 80% Real Yield**.
*   **Why:** Sustainable protocols run on revenue, not emissions. We track "Fee APY" separately from "Farming APY."

---

## 3. Operational & Health Metrics (Protocol Centric)

### A. Capital Efficiency Ratio (CER)
How hard is the money working?
*   **Formula:**
    $$ CER = \frac{\text{Daily Trading Volume Generated}}{\text{Total Value Locked (TVL)}} $$
*   **Target:** **> 0.5** (Uniswap V3 standard is ~0.2-0.3).
*   **Implication:** Our tight ranges ("Magnitude") should capture 2-3x more volume per dollar than a competitor.

### B. Gas-Adjusted Profitability
Is the rebalancing worth the cost?
*   **Formula:**
    $$ GAP = \frac{\text{Projected Fees from Rebalance} - \text{Gas Cost}}{\text{Gas Cost}} $$
*   **Threshold:** The Keepers will **NOT** execute a rebalance unless GAP > **1.5x**.
*   **Goal:** Ensure the protocol never burns equity just to look active.

### C. System Uptime (Z-Score)
*   **Metric:** Percentage of blocks where the On-Chain Price is within the Bollinger Bands of the Model.
*   **Target:** **95%**.
*   **Failure Mode:** If price spends >10% of time outside our range, the model is too slow or too tight.

---

## 4. Business Growth KPIs

### A. "Stickiness" (retention Rate)
*   **Metric:** Average duration of User Deposit (Days).
*   **Goal:** **> 90 Days**.
*   **Strategy:** Users who understand "Delta Neutrality" tend to stay for the long term, treating it as a savings account rather than a casino.

### B. DAO Treasury Share
*   **Metric:** % of TVL sourced from B2B partners (DAOs managing their own token liquidity).
*   **Goal:** **30% of Total TVL**.
*   **Why:** This capital is "Sticky" and usually typically pays higher management fees for the service.

---

## 5. Visualizing Success: The Analytics Dashboard

Users don't calculate formulas. We must show them clear charts.
1.  **"The HODL Line":** A chart showing "Vault Value" vs. "Value if you just held ETH." The green gap between them is our value prop.
2.  **"Fees Earned vs. Gas Paid":** Transparency on costs.
3.  **"Current Stance":** A speedometer showing the current Vector (e.g., "Bullish Bias" or "Neutral Hedge").
