// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IStrategyAdapter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Minimal Aave V3 Interfaces
interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external;
    function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) external returns (uint256);
    function getUserAccountData(address user) external view returns (
        uint256 totalCollateralBase,
        uint256 totalDebtBase,
        uint256 availableBorrowsBase,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    );
}

/// @title AaveV3Adapter
/// @notice Adapter for Delta-Neutral Hedging on Aave V3
contract AaveV3Adapter is IStrategyAdapter {
    using SafeERC20 for IERC20;

    IPool public immutable pool;
    IERC20 public immutable assetToken; // e.g., USDC (Collateral)
    
    // State to track borrowed asset for repayment
    address public debtAsset; 
    
    error InvalidConfiguration();

    constructor(address _pool, address _assetToken) {
        pool = IPool(_pool);
        assetToken = IERC20(_assetToken);
    }

    /// @notice Deploys collateral and borrows volatile asset to hedge
    /// @param assets Amount of collateral (USDC)
    /// @param data Encoded (amountToBorrow, addressOfVolatileToken)
    function deploy(uint256 assets, bytes calldata data) external override returns (uint256) {
        (uint256 borrowAmount, address volatileToken) = abi.decode(data, (uint256, address));
        
        debtAsset = volatileToken;

        // 1. Supply Collateral (USDC)
        assetToken.forceApprove(address(pool), assets);
        pool.supply(address(assetToken), assets, address(this), 0);

        // 2. Borrow Volatile Asset (e.g., WETH)
        // Interest Rate Mode: 2 for Variable
        if (borrowAmount > 0) {
            pool.borrow(volatileToken, borrowAmount, 2, 0, address(this));
        }
        
        return assets;
    }

    /// @notice Unwinds the position: Repays debt and withdraws collateral
    function withdraw(uint256) external override returns (uint256) {
        // 1. Repay Debt
        uint256 debtBalance = IERC20(debtAsset).balanceOf(address(this));
        if (debtBalance > 0) {
            IERC20(debtAsset).forceApprove(address(pool), debtBalance);
            pool.repay(debtAsset, type(uint256).max, 2, address(this));
        }

        // 2. Withdraw Collateral (USDC)
        uint256 withdrawn = pool.withdraw(address(assetToken), type(uint256).max, address(this));
        
        return withdrawn;
    }

    function harvest() external override returns (uint256) {
        // Aave yields accrue automatically in aToken balance / debt growth
        return 0;
    }

    /// @notice Net Value = Collateral Value - Debt Value
    function estimatedTotalAssets() external view override returns (uint256) {
        (uint256 totalCollateralBase, uint256 totalDebtBase, , , , ) = pool.getUserAccountData(address(this));
        
        // MVP Simplification: Returns value in Aave Base Currency (USD 8 decimals)
        // In prod, normalize to assetToken decimals
        if (totalCollateralBase > totalDebtBase) {
            return totalCollateralBase - totalDebtBase; 
        }
        return 0;
    }
}
