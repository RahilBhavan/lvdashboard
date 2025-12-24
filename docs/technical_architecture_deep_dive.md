# Technical Architecture Specification: Liquidity Vector

## 1. System Topology: The Hybrid Compute Model

The core architectural challenge of "Liquidity Vector" is that statistical modeling (calculating GARCH volatility, covariance matrices) is too computationally expensive for the Ethereum Virtual Machine (EVM).

Therefore, we use a **Hybrid Architecture**:
1.  **Off-Chain Intelligence:** Complex math runs on high-performance servers (generating ZK-proofs).
2.  **On-Chain Settlement:** Smart contracts verify proofs and execute atomic financial transactions.

```mermaid
graph TD
    User((User)) -->|Deposit USDC| Vault[Vault Contract (ERC-4626)]
    
    subgraph "Data Layer (The Sentinel)"
        CEX[Deribit API (IV Data)] -->|Signed Feed| OracleNode
        Chain[On-Chain Data] -->|Indexing| Subgraph[The Graph]
    end
    
    subgraph "Compute Layer (The Strategist)"
        Subgraph -->|Historical Data| PythonEngine[Quant Model (Python/Rust)]
        OracleNode -->|Real-time IV| PythonEngine
        PythonEngine -->|Generate Signal| ZKProver[ZK Coprocessor (Brevis/Axiom)]
    end
    
    subgraph "Execution Layer (The Executor)"
        ZKProver -->|Proof + Vector Params| Keeper[Gelato Bot]
        Keeper -->|call rebalance()| Vault
        Vault -->|Verify Proof| Verifier[On-Chain Verifier]
        Vault -->|Swap/Add Liq| Uniswap[Uniswap V3]
        Vault -->|Borrow/Hedge| Aave[Aave V3]
    end
```

## 2. Component Deep Dive

### Module A: The Sentinel (Data Ingestion)
**Purpose:** To build a pristine "state of the world" for the models to analyze.

*   **Market Data Subgraph:** Custom subgraph indexing Uniswap V3 `Swap` and `Mint` events. We need precise tick-level liquidity density to calculate slippage *before* we trade.
*   **Volatility Oracle:**
    *   *Problem:* IV (Implied Volatility) is not native to DeFi.
    *   *Solution:* A custom Chainlink Function or API3 Airnode that fetches the generic VIX index or specific ETH-Vol index from Deribit/Lyra.
    *   *Update Frequency:* 10 minutes or upon >5% deviation.

### Module B: The Strategist (Statistical Engine)
**Purpose:** The mathematical brain. It determines the "Vector."

*   **The Model Container:** A Dockerized Python application running `pandas`, `numpy`, and `scipy`.
    *   *Input:* Last 7 days of OHLCV data, Current IV, Gas Price.
    *   *Logic:* Calculates Bollinger Bands (2.0 SD) and RSI.
    *   *Output:* `VectorParams` struct.
*   **The Trust Mechanism (ZK-Coprocessor):**
    *   Instead of just signing the output with a private key (which requires trusting the admin), we use **Brevis** or **Axiom**.
    *   The coprocessor reads historical block headers to *prove* that the model inputs (e.g., "The price of ETH was X at block Y") are true.
    *   It generates a ZK-Proof attesting that the rebalance instruction is a valid result of the public algorithm.

### Module C: The Executor (Smart Contracts)
**Purpose:** Capital coordination and safety checks.

*   **`CoreVault.sol` (ERC-4626):**
    *   The single point of entry. Users deposit assets here.
    *   It holds the logic for "Share Value" calculation (Assets + Debt - Pending Fees).
*   **`StrategyAdapter.sol`:**
    *   Abstract base contract. Specific implementations (`UniswapV3Adapter`, `AaveAdapter`) inherit from this.
    *   Allows the protocol to swap out Uniswap for Balancer without migrating user funds.
*   **`TradeExecutor.sol`:**
    *   Interfaces with **1inch** or **CowSwap**.
    *   Before entering a new range, the Vault usually needs to swap assets (e.g., 50/50 split). This contract ensures that swap happens with <0.5% slippage or reverts the transaction.

### Module D: The Automation (Keepers)
**Purpose:** The heartbeat of the system.

*   **Gelato Network:**
    *   We do not rely on manual admin triggers.
    *   **Resolver Function:** A view function `checkRebalanceOpportunity()` returns `true` ONLY if:
        1.  The Model recommends a new range.
        2.  `ExpectedFeeRevenue > (GasCost * 1.5)`.
    *   This ensures the protocol never burns money on unprofitable rebalances.

## 3. Data Structures & Interfaces

The core data packet passed from Off-Chain to On-Chain is the `Vector`:

```solidity
struct Vector {
    // Magnitude: The Range
    int24 tickLower;
    int24 tickUpper;
    
    // Direction: The Hedge
    address hedgeAsset;       // e.g., USDC
    uint256 hedgeAmount;      // Amount to borrow on Aave
    
    // Safety
    uint256 minSlippage;      // Max allowed slippage for setup
    uint256 deadline;         // Signal expiry
}
```

## 4. Security Architecture

1.  **The "Sandwich" Defense:**
    *   Rebalancing transactions are prime targets for MEV bots (sandwich attacks).
    *   *Defense:* All swaps go through **Flashbots Protect** RPC or use **CowSwap** (Coincidence of Wants) off-chain batch auctions to prevent front-running.
2.  **Solvency Checks:**
    *   When using Leverage/Hedging (Mode C), the Vault must monitor its Health Factor on Aave.
    *   *Emergency:* If Health Factor < 1.1, a permissionless `emergencyUnwind()` function opens up, allowing *anyone* to close the position to save the vault from liquidation.
3.  **Circuit Breakers:**
    *   If the `Vector` suggests a price range that deviates >10% from the Chainlink Oracle Price, the contract *rejects* the rebalance (assuming model error or hack).
