# Engineering Handbook & Best Practices

This document establishes the gold standard for engineering, operations, and security within the Liquidity Vector protocol. All contributors are expected to adhere strictly to these guidelines to ensure the safety of user funds and the reliability of the system.

---

## 1. General Best Practices

### 📏 Coding Standards
*   **Consistency:** We value consistency over personal preference. If the existing codebase uses a specific style, stick to it.
*   **Linters:**
    *   **Solidity:** `solhint` and `forge fmt`.
    *   **Python:** `flake8` and `black`.
*   **Naming Conventions:**
    *   **Contracts:** `PascalCase` (e.g., `CoreVault.sol`).
    *   **Functions:** `camelCase` (e.g., `calculateTotalAssets`).
    *   **Private Vars:** Prepend with underscore (e.g., `_internalBalance`).
    *   **Constants:** `SCREAMING_SNAKE_CASE` (e.g., `MAX_SLIPPAGE_BPS`).

### 🌿 Version Control (GitFlow)
*   **Branches:**
    *   `main`: Protected. Production code only. Deploys to Mainnet.
    *   `develop`: Integration branch. Deploys to Testnet (Sepolia/Arbitrum Goerli).
    *   `feature/xyz`: Short-lived feature branches.
    *   `fix/xyz`: Bug fixes.
*   **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add GARCH model`, `fix: overflow in swap`).

### 👁️ Code Reviews
*   **The "Two-Eye" Rule:** No code merges to `develop` without approval from at least one other senior engineer.
*   **Checklist:**
    *   Are invariants documented?
    *   Is there a test for every new path?
    *   Are gas costs acceptable?
    *   Are re-entrancy guards in place?

---

## 2. Coding Guidelines

### 💎 Solidity (Smart Contracts)
*   **Security First:**
    *   **Checks-Effects-Interactions:** Always update state *before* making external calls to prevent re-entrancy.
    *   **Pull over Push:** Never iterate through an array to send funds. Let users withdraw.
*   **Gas Optimization:**
    *   Use `unchecked { ... }` blocks where overflow is impossible.
    *   Prioritize `calldata` over `memory` for function arguments.
    *   Pack struct variables to fit into 256-bit slots.
*   **Error Handling:**
    *   Use custom `error CustomError()` instead of string `require` messages to save gas.

### 🐍 Python (Quant Engine)
*   **Type Safety:** All function signatures must be fully typed (e.g., `def calculate_vol(price: float) -> float:`).
*   **Vectorization:** Avoid `for` loops in math logic. Use `numpy` or `pandas` vector operations for performance.
*   **Floating Point:** Be aware of precision issues. When moving data to on-chain, convert to Integer format (1e18) explicitly.

---

## 3. Architecture

### 🏗 Design Principles
*   **Hybrid Compute:** Heavy math belongs Off-Chain (Python). Value transfer belongs On-Chain (Solidity).
*   **Modularity (SOLID):**
    *   **Single Responsibility:** The Vault holds funds. The Adapter talks to Uniswap. The Oracle fetches price. Do not mix them.
    *   **Open/Closed:** Contracts should be open for extension (adding new Adapters) but closed for modification (changing Core logic).
*   **Immutability:** Core logic should be immutable where possible. Use "Governance Parameters" for tunable values, not upgradeable proxies, unless absolutely necessary.

### 📊 Data Modeling
*   **On-Chain:** Minimal state. Store only what is needed to verify the current position and share price.
*   **Off-Chain:** Full historical state. The Python engine maintains a Postgres DB with full tick-level history for backtesting.

### 🔌 Integration Strategy
*   **Wrappers:** Never call external protocols (Uniswap/Aave) directly from the Core. Always wrap interactions in an `Adapter` to isolate risk and handle interface changes.

---

## 4. Risk Management

### 🛡 Threat Modeling
*   **Oracle Manipulation:** Assume every Oracle can be flash-crashed. Always check against a secondary source (e.g., TWAP vs. Spot).
*   **Flash Loans:** Assume an attacker has infinite capital within a single block.
*   **Model Drift:** The statistical model *will* degrade. We must have automated "Circuit Breakers" that pause trading if performance drops below a baseline.

### 🚨 Disaster Recovery
*   **The "Red Button":** A `pause()` function available to the Guardian Multisig that halts all deposits and swaps.
*   **Emergency Unwind:** A procedure to liquidate all positions into a stable asset (USDC) if the strategy fails catastrophically.

---

## 5. Deployment & Operations

### 🚀 CI/CD Pipeline
*   **Pre-Commit:** Linting and basic formatting.
*   **On Push:**
    *   Run `forge test` (Solidity).
    *   Run `pytest` (Python).
    *   Run Slither (Static Analysis).
*   **On Merge:** Auto-deploy to Testnet.

### ☁️ Infrastructure as Code (IaC)
*   **Docker:** All off-chain components (Keepers, Models) must be Dockerized for consistent deployment.
*   **Terraform:** Use Terraform to manage cloud resources (AWS/GCP) for the off-chain engine.

### 📡 Monitoring & Alerting
*   **On-Chain:** Use **Tenderly** or **OpenZeppelin Sentinel**.
    *   Alert on: Large withdrawals (>5% TVL), Ownership changes, Reverts.
*   **Off-Chain:** Use **Prometheus/Grafana**.
    *   Monitor: Keeper balance (ETH for gas), API latency, Model error rates.

### 🔙 Rollback Strategy
*   **Smart Contracts:** Cannot be rolled back.
    *   *Mitigation:* Extensive Testnet trials and staged "Guarded Launches" with capped TVL.
*   **Off-Chain Logic:** Can be rolled back via Docker tag reversion (`v1.2` -> `v1.1`) instantly if the new model misbehaves.
