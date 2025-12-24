# AI Studio Prompt Collection: Phases 2-4

**Instructions:**
Use these prompts sequentially after you have generated the MVP code. Copy the text between the "START" and "END" markers for each phase and paste it into a fresh AI Studio context (or continue the existing chat).

---

## Phase 2: Building the Testing Suite

**Objective:** Create robust unit and integration tests to verify the safety of the Smart Contracts and the accuracy of the Python models.

**START OF PROMPT PHASE 2**
## Role
You are a Lead QA Engineer and Smart Contract Security Auditor. We have the MVP code for "Liquidity Vector" (CoreVault, UniswapV3Adapter, vamer_model.py). Now we need to test it.

## Task 1: Foundry Test Suite (Solidity)
Create a Foundry test file `test/CoreVault.t.sol`.
*   **Setup:**
    *   Use `deployCode` or Mocks to simulate a Uniswap V3 Pool and Position Manager.
    *   Deploy `CoreVault` and the `UniswapV3Adapter`.
    *   Deal some USDC/WETH to a test user.
*   **Test Cases:**
    1.  `testDeposit()`: Verify that depositing assets mints the correct amount of shares and updates `totalIdle`.
    2.  `testRebalance()`: Mock a call from a Keeper. Verify that the Vault calls the Adapter, and the Adapter interacts with the Uniswap Mock.
    3.  **Invariant Test:** `testInvariantSolvency()`: Verify that `totalAssets()` never decreases (excluding gas/fees) during a rebalance.
    4.  **Access Control:** Verify that `rebalance` reverts if called by a non-keeper.

## Task 2: Python Unit Tests (Pytest)
Create a Python test file `tests/models/test_vamer.py`.
*   **Mock Data:** Create a synthetic pandas DataFrame with 100 hours of OHLCV price data (sine wave + random noise).
*   **Test Cases:**
    1.  `test_garch_convergence()`: Ensure the GARCH model returns a non-negative volatility value.
    2.  `test_range_width()`: Verify that the output `tickUpper - tickLower` expands when input volatility increases.
    3.  `test_tick_validity()`: Ensure the returned ticks are valid Uniswap integers (multiples of tick spacing).

## Constraints
*   Use `forge-std` (Test, console, Vm).
*   Use `pytest` for Python.
*   Mock external calls extensively to avoid needing a Mainnet Fork for basic unit tests.

**Output:**
Generate the full code for `test/CoreVault.t.sol` and `tests/models/test_vamer.py`.
**END OF PROMPT PHASE 2**

---

## Phase 3: The Delta-Neutral Module (Hedging)

**Objective:** Implement the "Hedge Mode" that allows the protocol to borrow assets on Aave V3 to neutralize market risk.

**START OF PROMPT PHASE 3**
## Role
You are a DeFi Architect specializing in Lending Protocols. We are expanding "Liquidity Vector" to support Delta-Neutral strategies.

## Task 1: Aave Adapter
Create `contracts/src/adapters/AaveV3Adapter.sol`.
*   **Inheritance:** Inherit from `IStrategyAdapter`.
*   **Interfaces:** `IPool` (Aave V3), `IAToken`, `IVariableDebtToken`.
*   **Logic:**
    *   `deploy(uint256 assets, bytes data)`:
        1.  Parse `data` to get `borrowAmount` and `collateralAsset`.
        2.  Supply `assets` (e.g., USDC) to Aave Pool.
        3.  Call `borrow()` to get the volatile asset (e.g., WETH).
        4.  (Optional) Pair the borrowed WETH with remaining USDC and deposit into Uniswap (Conceptually).
    *   `withdraw()`:
        1.  Repay the Debt to Aave.
        2.  Withdraw the Collateral.
    *   `estimatedTotalAssets()`:
        *   Formula: `(Collateral Value - Debt Value)`. Use Aave's `getUserAccountData` or oracle prices.

## Task 2: Trend Model (Python)
Create `models/trend_model.py`.
*   **Logic:** Implement a "Trend Follower" to decide *when* to hedge.
*   **Function:** `get_hedge_ratio(price_history) -> float`
    *   Calculate EMA_12 and EMA_24 (Exponential Moving Averages).
    *   **Rule:**
        *   If `EMA_12 < EMA_24` (Downtrend): Return `1.0` (Fully Hedged).
        *   If `EMA_12 > EMA_24` (Uptrend): Return `0.0` (No Hedge, Long Only).

**Output:**
Generate `contracts/src/adapters/AaveV3Adapter.sol` and `models/trend_model.py`.
**END OF PROMPT PHASE 3**

---

## Phase 4: Automation & Infrastructure

**Objective:** Build the "glue" that connects the Python Brain to the Solidity Body (The Keeper Bot).

**START OF PROMPT PHASE 4**
## Role
You are a DevOps and Backend Engineer. We need to automate the "Liquidity Vector" protocol.

## Task 1: The Keeper Bot (Node.js or Python)
Create a script `scripts/keepers/bot.py` (or .js).
*   **Workflow:**
    1.  **Fetch Data:** Query The Graph or a CEX API for the last 7 days of ETH/USDC prices.
    2.  **Run Model:** Import `vamer_model` and `trend_model` and calculate the optimal Vector.
    3.  **Check Profitability:**
        *   Simulate the `rebalance()` call on-chain (using `eth_call`).
        *   Estimate Gas Cost.
        *   If `(EstimatedFees - GasCost) > Threshold`, proceed.
    4.  **Execute:** Send the transaction to the `CoreVault` contract.

## Task 2: Docker Infrastructure
Create a `Dockerfile` and `docker-compose.yml`.
*   **Service 1 (The Brain):** The Python container running the models and the Keeper script.
    *   Needs: `python:3.10`, `web3.py`, `pandas`, `arch`.
*   **Service 2 (The Data):** A lightweight Redis or Postgres instance to cache market data (optional but good practice).

**Output:**
Generate the code for `scripts/keepers/bot.py` and the `Dockerfile`.
**END OF PROMPT PHASE 4**
