# Smart Contract Technical Specification

## 1. CoreVault.sol (The "Bank")
**Standard:** ERC-4626 (Tokenized Vault)
**Role:** Holds user funds, issues shares (lpTokens), and manages high-level state.

### Core Storage
```solidity
struct StrategyState {
    uint256 totalIdle;       // Assets held in contract (not deployed)
    uint256 totalDeployed;   // Assets currently in Uniswap/Aave
    address activeAdapter;   // The current strategy implementation
    uint256 lastRebalance;   // Timestamp of last action
}
```

### Key Functions

#### `deposit(uint256 assets, address receiver)`
*   **Type:** `public` (ERC-4626 Standard)
*   **Logic:**
    1.  Transfer `assets` (e.g., USDC) from user to Vault.
    2.  Check `isDepositPaused` (Circuit Breaker).
    3.  Calculate shares: `(assets * totalSupply) / totalAssets()`.
    4.  Mint shares to `receiver`.
    5.  **Auto-Invest:** If `totalIdle` > `rebalanceThreshold`, trigger a "Lazy Rebalance" to deploy funds immediately.

#### `totalAssets()`
*   **Type:** `public view`
*   **Logic:** Returns the *Realized Value* of the vault.
    *   `idleBalance + adapter.getPositionValue() - pendingFees`.
    *   *Crucial:* This relies on the Adapter's ability to price the Uniswap NFT and Aave Debt accurately on-chain.

#### `rebalance(bytes calldata zkProof, Vector calldata newParams)`
*   **Type:** `external` (Restricted or Permissionless with Proof)
*   **Logic:** The heart of the protocol.
    1.  **Verify Proof:** Calls `ZkVerifier.verify(zkProof, newParams)`. Ensures parameters come from the valid off-chain model.
    2.  **Unwind Old Position:** Calls `adapter.exitPosition()`. Assets return to Vault.
    3.  **Swap:** Execute 1inch/CowSwap trade to match the new ratio required by `newParams`.
    4.  **Deploy New Position:** Calls `adapter.enterPosition(newParams)`.
    5.  **Emit Event:** `RebalanceExecuted(newParams.tickLower, newParams.tickUpper, newParams.hedgeRatio)`.

---

## 2. StrategyAdapter.sol (The "Executor")
**Role:** Abstract base class for interacting with external protocols. Specific implementations (e.g., `UniV3AaveAdapter`) inherit from this.

### Interface
```solidity
interface IStrategyAdapter {
    function enterPosition(Vector memory params) external returns (uint256 deployedAmount);
    function exitPosition() external returns (uint256 amountReturned);
    function harvest() external returns (uint256 rewards);
    function getPositionValue() external view returns (uint256);
}
```

### `UniV3AaveAdapter.sol` Implementation

#### `enterPosition(Vector memory params)`
*   **Logic:**
    1.  **Hedging Step (if params.hedgeRatio > 0):**
        *   Deposit USDC into Aave.
        *   Borrow ETH.
    2.  **Liquidity Step:**
        *   Mint `NonfungiblePosition` on Uniswap V3 using the `tickLower` and `tickUpper` from `params`.
    3.  **Safety Check:** Ensure the final position's delta matches the target within 1% tolerance.

#### `harvest()`
*   **Logic:**
    1.  **Claim Fees:** `NonfungiblePositionManager.collect()`.
    2.  **Compound:** Swap accrued fees (e.g., UNI, CRV) back into the principal asset (USDC).
    3.  **Repay Debt:** If in "Hedge Mode", use fees to pay down Aave interest to maintain health factor.

---

## 3. Security & Access Control

### Modifiers

#### `onlyKeeperOrProof(bytes memory proof)`
*   Allows execution if:
    *   Caller is a whitelisted `GelatoKeeper`.
    *   OR: Caller provides a valid ZK-Proof (allowing decentralized execution).

#### `checkSlippage(uint256 minOut)`
*   Protects rebalancing swaps. If the amount received from a swap is < `minOut`, the transaction reverts to prevent sandwich attacks.

### Emergency Functions

#### `emergencyUnwind()`
*   **Trigger:** Can be called by *anyone* if `ChainlinkPrice` deviates > 10% from `UniswapOraclePrice`.
*   **Action:** Immediately closes all positions (removes LP, repays debt) and sits in USDC.
*   **Why:** Protects against Oracle manipulation or Depegs.

#### `setGuardMode(bool active)`
*   **Role:** `GuardianMultisig` (4/7 signatures).
*   **Action:** Forces the vault into "Cash Only" mode during protocol-level threats.
