// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CoreVault.sol";
import "../src/ZkVerifier.sol";
import "../src/interfaces/IStrategyAdapter.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Simplified Mock Adapter for Integration Testing
contract MockStrategyAdapter is IStrategyAdapter {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable asset;
    uint256 public deployedAssets;
    
    constructor(address _asset) {
        asset = IERC20(_asset);
    }
    
    function deploy(uint256 assets, bytes calldata) external override returns (uint256) {
        // Receive tokens from vault
        asset.safeTransferFrom(msg.sender, address(this), assets);
        deployedAssets += assets;
        return assets;
    }
    
    function withdraw(uint256) external override returns (uint256) {
        uint256 amount = deployedAssets;
        deployedAssets = 0;
        
        // Return tokens to vault
        if (amount > 0) {
            asset.safeTransfer(msg.sender, amount);
        }
        return amount;
    }
    
    function harvest() external override returns (uint256) {
        // Mock: Just return 0 for now since we don't have real yield mechanism
        return 0;
    }
    
    function estimatedTotalAssets() external view override returns (uint256) {
        return deployedAssets;
    }
}

contract IntegrationForkTest is Test {
    CoreVault vault;
    ZkVerifier verifier;
    MockStrategyAdapter adapter;
    
    address USDC;
    uint256 keeperPk = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; // Standard test key
    address keeper;
    address user = address(0x1);

    function setUp() public {
        // Fork network
        string memory rpc = vm.envString("RPC_URL");
        vm.createSelectFork(rpc);
        
        USDC = vm.envAddress("TOKEN0");
        keeper = vm.addr(keeperPk); // Derive address from private key
        
        // Deploy components
        verifier = new ZkVerifier(keeper);
        adapter = new MockStrategyAdapter(USDC);
        
        vault = new CoreVault(
            IERC20(USDC),
            "Vector Vault",
            "vvUSDC",
            address(adapter),
            address(verifier)
        );
        
        vault.grantRole(vault.KEEPER_ROLE(), keeper);
        
        // Fund user
        deal(USDC, user, 10000 * 1e6);
        vm.prank(user);
        IERC20(USDC).approve(address(vault), type(uint256).max);
    }
    
    /// @notice Helper to generate valid ECDSA signature for rebalance
    function generateSignature(int24 tickLower, int24 tickUpper, uint256 keeperPk) 
        internal view returns (bytes memory) 
    {
        bytes32 messageHash = keccak256(
            abi.encodePacked(tickLower, tickUpper, block.number)
        );
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(keeperPk, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    function testFullLifecycle() public {
        // 1. DEPOSIT
        vm.startPrank(user);
        uint256 depositAmt = 1000 * 1e6;
        uint256 shares = vault.deposit(depositAmt, user);
        vm.stopPrank();
        
        assertEq(shares, depositAmt, "Initial shares should be 1:1");
        assertEq(vault.totalAssets(), depositAmt, "Total assets should match deposit");

        // 2. REBALANCE (Deploy to Strategy)
        bytes memory signature = generateSignature(-1000, 1000, keeperPk);
        
        vm.startPrank(keeper);
        vault.rebalance(signature, -1000, 1000);
        vm.stopPrank();
        
        assertEq(adapter.deployedAssets(), depositAmt, "Assets should be deployed");
        assertEq(vault.totalAssets(), depositAmt, "Total assets should remain same");

        // 3. HARVEST (Compound Rewards)
        vm.warp(block.timestamp + 1 days);
        
        vm.startPrank(keeper);
        vault.harvest();
        vm.stopPrank();
        
        // Mock adapter doesn't simulate yield, so assets stay same
        assertEq(adapter.deployedAssets(), depositAmt, "Assets should remain deployed");

        // 4. EMERGENCY UNWIND
        uint256 assetsBeforeUnwind = vault.totalAssets();
        
        vm.startPrank(address(this)); // Test contract is admin
        vault.emergencyUnwind();
        vm.stopPrank();
        
        assertEq(adapter.deployedAssets(), 0, "Adapter should be empty after unwind");
        assertGe(vault.totalAssets(), assetsBeforeUnwind, "Assets should be back in vault");

        // 5. WITHDRAW
        vm.startPrank(user);
        uint256 userShares = vault.balanceOf(user);
        vault.redeem(userShares, user, user);
        vm.stopPrank();
        
        uint256 finalBalance = IERC20(USDC).balanceOf(user);
        assertGe(finalBalance, depositAmt, "User should get back deposit amount");
    }
    
    function testInvalidProofReverts() public {
        vm.startPrank(keeper);
        vm.expectRevert(CoreVault.InvalidProof.selector);
        vault.rebalance(hex"", -1000, 1000);
        vm.stopPrank();
    }
}
