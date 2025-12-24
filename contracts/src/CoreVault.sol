// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IStrategyAdapter.sol";

interface IZkVerifier {
    function verify(bytes calldata proof, int24 tickLower, int24 tickUpper) external returns (bool);
}

/// @title CoreVault
/// @notice Main entry point for Liquidity Vector ERC4626 Vault
contract CoreVault is ERC4626, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    
    address public activeAdapter;
    address public verifier; // ZkVerifier address
    uint256 public totalIdle;

    event Rebalanced(uint256 assetsRedeployed, int24 tickLower, int24 tickUpper);
    event AdapterUpdated(address newAdapter);
    event EmergencyUnwindExecuted(uint256 idleAssets);
    event Harvested(uint256 rewards);

    error Unauthorized();
    error AdapterFailed();
    error InvalidProof();

    constructor(
        IERC20 _asset, 
        string memory _name, 
        string memory _symbol,
        address _adapter,
        address _verifier
    ) ERC4626(_asset) ERC20(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        activeAdapter = _adapter;
        verifier = _verifier;
    }

    /// @notice Rebalances the vault liquidity based on off-chain vector data, validated by ZK proof
    /// @param zkProof The ZK-SNARK proof verifying the off-chain computation
    /// @param tickLower The new lower tick range
    /// @param tickUpper The new upper tick range
    function rebalance(bytes calldata zkProof, int24 tickLower, int24 tickUpper) external nonReentrant {
        // Access Control: Must be a Keeper AND provide a valid Proof
        // Alternatively, if the proof is valid, we could allow *anyone* (Permissionless), 
        // but for now we restrict to Keepers to prevent spam/griefing.
        if (!hasRole(KEEPER_ROLE, msg.sender)) revert Unauthorized();

        // 0. Verify Proof
        // Use high-level call for cleaner syntax and automatic decoding
        try IZkVerifier(verifier).verify(zkProof, tickLower, tickUpper) returns (bool valid) {
            if (!valid) revert InvalidProof();
        } catch {
            revert InvalidProof();
        }

        IStrategyAdapter adapter = IStrategyAdapter(activeAdapter);

        // 1. Withdraw everything from current position
        uint256 currentAssets = adapter.estimatedTotalAssets();
        if (currentAssets > 0) {
           adapter.withdraw(currentAssets); 
        }

        // 2. Harvest any pending yields
        adapter.harvest();

        // 3. Redeploy with new Vector Data
        uint256 assetsToDeploy = IERC20(asset()).balanceOf(address(this));
        if (assetsToDeploy > 0) {
            // Approve adapter to pull tokens
            IERC20(asset()).forceApprove(address(adapter), assetsToDeploy);
            
            // Adapter deploy expects encoded data. 
            // In a real generic adapter, this encoding might vary, but for UniV3 we know it needs ticks.
            bytes memory deployData = abi.encode(tickLower, tickUpper);
            
            uint256 deployed = adapter.deploy(assetsToDeploy, deployData);
            if (deployed == 0) revert AdapterFailed();
            
            emit Rebalanced(deployed, tickLower, tickUpper);
        }
    }

    /// @notice Emergency function to unwind all positions to Idle (USDC)
    function emergencyUnwind() external nonReentrant {
        // Allow Owner OR Guardian. For MVP, just Owner via Default Admin.
        // Spec says "Anyone if Oracle Deviates", but simplified to Admin for this step.
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert Unauthorized();

        IStrategyAdapter adapter = IStrategyAdapter(activeAdapter);
        uint256 currentAssets = adapter.estimatedTotalAssets();
        
        if (currentAssets > 0) {
            uint256 returned = adapter.withdraw(currentAssets);
            emit EmergencyUnwindExecuted(returned);
        }
    }

    /// @notice Manually triggers harvesting of rewards without rebalancing
    function harvest() external nonReentrant {
        // Permissionless (incentivized in future) or Keeper/Admin
        IStrategyAdapter adapter = IStrategyAdapter(activeAdapter);
        uint256 rewards = adapter.harvest();
        emit Harvested(rewards);
    }

    function setAdapter(address _newAdapter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        activeAdapter = _newAdapter;
        emit AdapterUpdated(_newAdapter);
    }
    
    function totalAssets() public view override returns (uint256) {
        return super.totalAssets() + IStrategyAdapter(activeAdapter).estimatedTotalAssets();
    }
}
