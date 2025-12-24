# API Reference

This document provides a technical reference for the public-facing functions of the Liquidity Vector protocol.

## 🏦 CoreVault.sol

### View Functions

#### `totalAssets()`
*   **Returns:** `uint256`
*   **Description:** Returns the total value of all assets managed by the vault (idle + deployed - debt).

#### `getSharePrice()`
*   **Returns:** `uint256`
*   **Description:** The value of a single share in terms of the underlying asset (e.g., price of 1 `lvUSDC` in `USDC`).

#### `getCurrentVector()`
*   **Returns:** `(int24 tickLower, int24 tickUpper, uint256 hedgeRatio)`
*   **Description:** Returns the current operational parameters of the active strategy.

### State-Changing Functions

#### `deposit(uint256 assets, address receiver)`
*   **Params:** `assets` (Amount to deposit), `receiver` (Address to receive shares).
*   **Description:** Standard ERC-4626 deposit.

#### `withdraw(uint256 assets, address receiver, address owner)`
*   **Params:** `assets` (Amount of principal to withdraw), `receiver`, `owner`.
*   **Description:** Standard ERC-4626 withdrawal.

---

## 📊 Event Logs

### `RebalanceExecuted`
```solidity
event RebalanceExecuted(
    int24 indexed tickLower,
    int24 indexed tickUpper,
    uint256 hedgeRatio,
    uint256 timestamp
);
```
*   **Description:** Emitted every time the off-chain model triggers a change in liquidity range or delta bias.

### `EmergencyAction`
```solidity
event EmergencyAction(address indexed actor, string actionType);
```
*   **Description:** Emitted when the Pause Guardian or Emergency Unwind is triggered.

---

## 🤖 Off-Chain Model API (Quant Engine)

For those running their own local instances of the strategist:

### `GET /api/v1/forecast`
*   **Returns:**
    ```json
    {
      "volatility_forecast": 0.045,
      "recommended_range": [-200, 200],
      "trend_bias": "Neutral",
      "zk_proof_ready": true
    }
    ```
