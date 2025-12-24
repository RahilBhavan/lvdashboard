// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CoreVault.sol";
import "../src/ZkVerifier.sol"; // Using ECDSA verifier
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Axiom Integration Test
 * @notice Tests CoreVault with Axiom-based ZkVerifier
 * @dev Simulates Axiom callbacks for testing without live network
 */
contract AxiomIntegrationTest is Test {
    CoreVault vault;
    ZkVerifier verifier; // Using ECDSA verifier
    MockStrategyAdapter adapter;
    
    address USDC;
    address keeper;
    uint256 keeperPk = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address user = address(0x1);
    
    function setUp() public {
        // Fork Sepolia
        string memory rpc = vm.envString("RPC_URL");
        vm.createSelectFork(rpc);
        
        USDC = vm.envAddress("TOKEN0");
        keeper = vm.addr(keeperPk);
        
        // Deploy components (using ECDSA verifier)
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
    
    /// @notice Helper to generate ECDSA signature
    function generateSignature(int24 tickLower, int24 tickUpper) 
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
    
    /**
     * @notice Test full lifecycle (demonstrates architecture for Axiom integration)
     * @dev Uses ECDSA signatures but shows where Axiom proofs would be used
     */
    function testAxiomArchitectureDemo() public {
        // 1. DEPOSIT
        vm.startPrank(user);
        uint256 depositAmt = 1000 * 1e6;
        uint256 shares = vault.deposit(depositAmt, user);
        vm.stopPrank();
        
        assertEq(shares, depositAmt, "Initial shares should be 1:1");
        
        // 2. GENERATE PROOF
        // In Axiom: This would be ZK proof of Chainlink price
        // Current: ECDSA signature
        bytes memory proof = generateSignature(-1000, 1000);
        
        // 3. REBALANCE WITH PROOF
        vm.startPrank(keeper);
        vault.rebalance(proof, -1000, 1000);
        vm.stopPrank();
        
        assertEq(adapter.deployedAssets(), depositAmt, "Assets should be deployed");
        
        // 4. HARVEST
        vm.warp(block.timestamp + 1 days);
        vm.startPrank(keeper);
        vault.harvest();
        vm.stopPrank();
        
        // 5. EMERGENCY UNWIND
        vm.startPrank(address(this));
        vault.emergencyUnwind();
        vm.stopPrank();
        
        assertEq(adapter.deployedAssets(), 0, "Adapter should be empty");
        
        // 6. WITHDRAW
        vm.startPrank(user);
        uint256 userShares = vault.balanceOf(user);
        vault.redeem(userShares, user, user);
        vm.stopPrank();
        
        uint256 finalBalance = IERC20(USDC).balanceOf(user);
        assertGe(finalBalance, depositAmt, "User should get back deposit");
    }
    
    /**
     * @notice Test invalid proof rejection
     */
    function testInvalidProofReverts() public {
        bytes memory invalidProof = hex"";
        
        vm.startPrank(keeper);
        vm.expectRevert();
        vault.rebalance(invalidProof, -1000, 1000);
        vm.stopPrank();
    }
}

/// @notice Mock Strategy Adapter for testing
contract MockStrategyAdapter {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable asset;
    uint256 public deployedAssets;
    
    constructor(address _asset) {
        asset = IERC20(_asset);
    }
    
    function deploy(uint256 assets, bytes calldata) external returns (uint256) {
        asset.safeTransferFrom(msg.sender, address(this), assets);
        deployedAssets += assets;
        return assets;
    }
    
    function withdraw(uint256) external returns (uint256) {
        uint256 amount = deployedAssets;
        deployedAssets = 0;
        if (amount > 0) {
            asset.safeTransfer(msg.sender, amount);
        }
        return amount;
    }
    
    function harvest() external pure returns (uint256) {
        return 0;
    }
    
    function estimatedTotalAssets() external view returns (uint256) {
        return deployedAssets;
    }
}

// Import SafeERC20
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
