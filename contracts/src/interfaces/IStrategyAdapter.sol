// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IStrategyAdapter
/// @notice Interface for interacting with external DeFi protocols (e.g., Uniswap V3)
interface IStrategyAdapter {
    /// @notice Deploys assets into the underlying protocol
    /// @param assets The amount of the underlying asset to deploy
    /// @param data Encoded configuration data (e.g., tick ranges)
    /// @return amountDeployed The actual amount of assets deployed
    function deploy(uint256 assets, bytes calldata data) external returns (uint256 amountDeployed);

    /// @notice Withdraws assets from the protocol
    /// @param shares The amount of vault shares/liquidity tokens to burn/withdraw
    /// @return amountWithdrawn The amount of underlying assets returned
    function withdraw(uint256 shares) external returns (uint256 amountWithdrawn);

    /// @notice Harvests yields (fees, rewards) without withdrawing principal
    /// @return harvested The amount of yield harvested
    function harvest() external returns (uint256 harvested);

    /// @notice Returns the total estimated value of assets held by the adapter
    /// @return totalAssets The total asset value in underlying tokens
    function estimatedTotalAssets() external view returns (uint256 totalAssets);
}
