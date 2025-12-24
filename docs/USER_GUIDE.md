# User Guide: Liquidity Vector

Welcome to Liquidity Vector! This guide will help you understand how to use the protocol to optimize your DeFi yields.

## 1. How to Deposit
1.  Connect your wallet to the [App Dashboard].
2.  Select a Vault (e.g., **USDC Delta-Neutral ETH**).
3.  Enter the amount you wish to deposit.
4.  Approve the USDC spending in your wallet.
5.  Click **Deposit**. You will receive **lvTokens** (e.g., `lvUSDC`) representing your share of the pool.

## 2. Understanding the "Vector"
On your dashboard, you will see a "Current Vector" indicator.
*   **Harvest Mode (Green Circle):** The market is calm. The vault is harvesting high fees with a very tight range.
*   **Guard Mode (Yellow Shield):** Volatility is high. The vault has widened the range to protect your principal.
*   **Hedge Mode (Blue Diamond):** The vault has borrowed assets to protect against a price drop.

## 3. How to Withdraw
1.  Go to the **Withdraw** tab.
2.  Enter the amount of `lvTokens` or the amount of underlying assets you want.
3.  Click **Withdraw**. Your funds + earned fees will be returned to your wallet.
*   *Note:* There is no lock-up period, but we recommend staying for at least 7 days to offset the gas costs of your deposit.

## 4. Risks to Keep in Mind
*   **Trading Loss:** While we aim to reduce Impermanent Loss, we cannot guarantee 0% loss during extreme black-swan events.
*   **Smart Contract Risk:** Despite audits, DeFi always carries risks. Only invest what you can afford to lose.
*   **Stablecoin Risk:** If the stablecoin in the vault (e.g., USDC) loses its peg, the vault's value will decline.

## 5. FAQ
**Q: Where does the yield come from?**
A: It comes from trading fees on Uniswap V3. We simply manage your position more efficiently than a human could.

**Q: Why is my APY changing?**
A: APY depends on trading volume in the market. More volume = more fees.

## 6. Advanced Features

### Admin Panel
*For Protocol Owners Only*
- **Access**: Click the "Shield" icon in the sidebar (only visible to owner wallet).
- **Controls**:
    - **Emergency Pause**: Halts all vault interactions.
    - **Params**: Adjust `Min Profit` (ETH) and `Cycle Time` (seconds) to tune bot aggression.

### Strategy Builder
*For Advanced Users & Strategists*
- **Purpose**: Design and execute manual liquidity vectors.
- **How to use**:
    1.  Go to **Strategy Builder** tab.
    2.  Select Asset Pair and Time Window.
    3.  Click **Run Simulation** to see VAMR model predictions.
    4.  If satisfied, click **Execute Vector** to submit the rebalance transaction on-chain.
