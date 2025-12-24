# Governance Manual

## 1. Overview
Liquidity Vector is governed by the **Vector DAO**. Governance is responsible for parameter tuning, strategy upgrades, and treasury management.

## 2. The Decision Matrix

| Parameter | Managed By | Delay |
| :--- | :--- | :--- |
| **Model Coefficients** (GARCH weights) | DAO Vote | 48 Hours |
| **Management Fee** (up to 2%) | DAO Vote | 7 Days |
| **Adding New Assets** | DAO Vote | 3 Days |
| **Emergency Pause** | Guardian Multisig | Instant |

## 3. The Multi-Signature Wallets

### The Council (4-of-7 Multisig)
*   **Role:** Executes DAO-approved votes and manages the Treasury.
*   **Members:** Core Team (3), Strategic Partners (2), Community Reps (2).

### The Guardian (3-of-5 Multisig)
*   **Role:** Purely defensive. Can only pause the protocol.
*   **Members:** Security-focused engineers and white-hat collaborators.

## 4. Governance Process
1.  **RFC (Request for Comment):** Discussion on the Forum for at least 3 days.
2.  **Snapshot Vote:** Off-chain signaling vote.
3.  **On-Chain Execution:** If Snapshot passes, the Council executes the transaction via the **Timelock**.

## 5. Parameter Definitions
*   **`rebalanceThreshold`:** The minimum expected profit needed to trigger a rebalance.
*   **`maxLeverage`:** The maximum debt ratio allowed in Delta-Neutral mode (default 2x).
*   **`volaWindow`:** The historical window (in hours) used for GARCH calculations.
