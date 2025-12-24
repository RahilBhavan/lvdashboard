# AI Studio Prompt: Liquidity Vector Code Generation

**Instructions for the User:**
Copy the text below and paste it into Google AI Studio. This prompt is engineered to provide the AI with all the architectural context needed to generate the specific, high-quality code for the Liquidity Vector project.

---

**START OF PROMPT**

## Role & Objective
You are an expert DeFi Protocol Architect and Senior Quantitative Developer. Your task is to implement the MVP (Minimum Viable Product) for **Liquidity Vector**, a hybrid-compute DeFi primitive.

**Project Definition:**
Liquidity Vector is an ERC-4626 vault system that optimizes liquidity on Uniswap V3 using off-chain statistical models (GARCH Volatility & Mean Reversion).
*   **Hybrid Architecture:** Heavy math runs in Python (Off-chain), and the results ("Vectors") are executed on-chain via smart contracts.
*   **Core Goal:** Minimize Impermanent Loss and generate Alpha via "Delta Neutral" hedging.

## 1. Project Structure
You must strictly adhere to this directory layout:

```text
contracts/
  src/
    CoreVault.sol          (ERC-4626 Main Vault)
    interfaces/
      IStrategyAdapter.sol (Standard Interface)
    adapters/
      UniswapV3Adapter.sol (Interaction with NonfungiblePositionManager)
models/
  vamer_model.py           (Python GARCH Volatility Engine)
```

## 2. Implementation Tasks

### Task A: Smart Contract Layer (Solidity ^0.8.20)

**1. `src/interfaces/IStrategyAdapter.sol`**
Create an interface that enforces a standard way for the Vault to talk to external protocols.
*   Functions: `deploy(uint256 assets)`, `withdraw(uint256 shares)`, `harvest()`, `estimatedTotalAssets()`.

**2. `src/adapters/UniswapV3Adapter.sol`**
Implement the adapter for Uniswap V3.
*   **Dependencies:** Use OpenZeppelin's `IERC721Receiver` (for the NFT) and Uniswap V3 interfaces.
*   **Logic:**
    *   `deploy`: Swap assets to the correct ratio (if needed) and `mint` a new position using `NonfungiblePositionManager`.
    *   `withdraw`: Call `decreaseLiquidity` and `collect` fees.
    *   **Crucial:** It must accept a `bytes calldata data` packet containing the `tickLower` and `tickUpper` determined by the off-chain model.

**3. `src/CoreVault.sol`**
Implement the main Entry Point inheriting from OpenZeppelin `ERC4626`.
*   **State:** `address public activeAdapter`, `uint256 public totalIdle`.
*   **Rebalance Logic:** Create a function `rebalance(bytes calldata vectorData)`:
    *   Access Control: `onlyKeeper` or `onlyZkProver`.
    *   Flow: 1. Withdraw from Adapter. 2. Pass new `vectorData` to Adapter. 3. Redeploy.

### Task B: Quantitative Layer (Python)

**4. `models/vamer_model.py`**
Implement the "Volatility-Adjusted Mean Reversion" engine.
*   **Libraries:** `pandas`, `numpy`, `arch` (for GARCH).
*   **Function:** `predict_next_range(price_history: list) -> (int, int)`
*   **Logic:**
    1.  Calculate Log Returns from price history.
    2.  Fit a GARCH(1,1) model to forecast next-day volatility ($\sigma$).
    3.  Define Range: $Price_{current} \pm (2.0 \times \sigma)$.
    4.  Convert prices to Uniswap `int24` Ticks.

## 3. Coding Standards & Constraints
*   **Security:** Use `ReentrancyGuard` on the Vault. Use `SafeERC20` for all transfers.
*   **Style:** PascalCase for contracts, snake_case for Python.
*   **Documentation:** Add Natspec comments to all Solidity functions explaining the *param* and *return* values.
*   **Error Handling:** Use custom errors (e.g., `error SlippageExceeded()`) instead of strings.

**Output:**
Please generate the full code for these 4 files (`IStrategyAdapter.sol`, `UniswapV3Adapter.sol`, `CoreVault.sol`, `vamer_model.py`).

**END OF PROMPT**
