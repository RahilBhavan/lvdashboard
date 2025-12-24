# Project Structure: Liquidity Vector

This document outlines the organization of the Liquidity Vector repository. The project uses a **Hybrid Architecture** combining Solidity smart contracts for on-chain execution and Python for off-chain quantitative modeling.

## 📂 Directory Layout

```text
.
├── contracts/              # Smart Contract Suite (Foundry)
│   ├── src/                # Core logic (Vaults, Adapters)
│   ├── lib/                # External dependencies (OpenZeppelin, etc.)
│   └── script/             # Deployment scripts (Solidity)
├── models/                 # Quantitative Engine (Python/Rust)
│   ├── vamer/              # Volatility-Adjusted Mean Reversion model
│   ├── trend/              # Trend Bias & Delta Neutral logic
│   └── prover/             # ZK-Coprocessor proving logic (Brevis/Axiom)
├── scripts/                # Operational Automation
│   ├── keepers/            # Gelato/Automation bot logic
│   └── maintenance/        # Treasury & Parameter update scripts
├── tests/                  # Unified Testing Suite
│   ├── contracts/          # Foundry Unit & Invariant tests
│   └── models/             # Pytest for statistical validation
├── docs/                   # Detailed Specification Docs (Markdown)
│   ├── architecture/       # System and Technical specs
│   ├── business/           # Viability and Success metrics
│   └── user/               # User guides and FAQ
├── foundry.toml            # Solidity compiler configuration
├── requirements.txt        # Python dependency list
├── README.md               # Central landing page
├── CONTRIBUTING.md         # Developer guidelines
└── SECURITY.md             # Security and Bug Bounty info
```

## 🏗 Key Components

### 1. `/contracts`
The source of truth for all user funds.
*   `CoreVault.sol`: The ERC-4626 entry point.
*   `StrategyAdapter.sol`: The protocol-specific logic (Uniswap, Aave).

### 2. `/models`
The "Brain" of the protocol.
*   Processes historical data indexed from the blockchain.
*   Generates the `VectorParams` (Range and Hedge).
*   Interfaces with ZK-proving services to ensure model integrity.

### 3. `/scripts`
The operational glue.
*   `resolver.js`: Logic for Gelato Keepers to check if a rebalance is profitable.
*   `emergency.js`: Fast-response scripts for circuit breakers.

### 4. `/docs`
The comprehensive documentation suite.
*   Organized by category (Technical, Business, User) to provide deep context for auditors and integrators.
