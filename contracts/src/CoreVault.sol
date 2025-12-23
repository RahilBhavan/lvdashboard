// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IStrategyAdapter.sol";

/// @title CoreVault
/// @notice Main entry point for Liquidity Vector ERC4626 Vault
contract CoreVault is ERC4626, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    
    address public activeAdapter;
    uint256 public totalIdle;

    event Rebalanced(uint256 assetsRedeployed, bytes vectorData);
    event AdapterUpdated(address newAdapter);

    error Unauthorized();
    error AdapterFailed();

    constructor(
        IERC20 _asset, 
        string memory _name, 
        string memory _symbol,
        address _adapter
    ) ERC4626(_asset) ERC20(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        activeAdapter = _adapter;
    }

    /// @notice Rebalances the vault liquidity based on off-chain vector data
    /// @param vectorData Encoded tick ranges from the VAMER model
    function rebalance(bytes calldata vectorData) external nonReentrant {
        if (!hasRole(KEEPER_ROLE, msg.sender)) revert Unauthorized();

        IStrategyAdapter adapter = IStrategyAdapter(activeAdapter);

        // 1. Withdraw everything from current position
        uint256 currentAssets = adapter.estimatedTotalAssets();
        if (currentAssets > 0) {
           adapter.withdraw(currentAssets); // Simplify shares=assets 1:1 for MVP
        }

        // 2. Harvest any pending yields
        adapter.harvest();

        // 3. Redeploy with new Vector Data
        uint256 assetsToDeploy = IERC20(asset()).balanceOf(address(this));
        uint256 deployed = adapter.deploy(assetsToDeploy, vectorData);

        if (deployed == 0) revert AdapterFailed();
        
        emit Rebalanced(deployed, vectorData);
    }

    function setAdapter(address _newAdapter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        activeAdapter = _newAdapter;
        emit AdapterUpdated(_newAdapter);
    }
    
    function totalAssets() public view override returns (uint256) {
        return super.totalAssets() + IStrategyAdapter(activeAdapter).estimatedTotalAssets();
    }
}
