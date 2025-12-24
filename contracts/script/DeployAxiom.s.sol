// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CoreVault.sol";
import "../src/ZkVerifier.sol"; // Using existing ZkVerifier (ECDSA)
import "../src/adapters/UniswapV3Adapter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Note: For Axiom integration, would use ZkVerifierAxiom
// import "../src/ZkVerifierAxiom.sol";

/**
 * @title Deploy Script for Axiom V2 Integration
 * @notice Deploys CoreVault with Axiom-based ZkVerifier
 */
contract DeployAxiomScript is Script {
    function run() external {
        // Load environment variables
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        address keeper = vm.envAddress("KEEPER_ADDRESS");
        address asset = vm.envAddress("TOKEN0"); // USDC on Sepolia
        address positionManager = vm.envAddress("POSITION_MANAGER");
        
        // For demo: use mock Axiom address
        // In production: use real Axiom V2 Query address from docs
        address axiomV2Query = address(0xA1); // Mock address for testing
        
        console.log("Deploying with:");
        console.log("Deployer:", deployer);
        console.log("Keeper:", keeper);
        console.log("Asset:", asset);
        console.log("Axiom V2 Query (mock):", axiomV2Query);
        
        vm.startBroadcast(deployer);
        
        // 1. Deploy UniswapV3 Adapter
        UniswapV3Adapter adapter = new UniswapV3Adapter(
            positionManager,
            asset,
            vm.envAddress("TOKEN1"), // WETH
            3000 // 0.3% fee tier
        );
        console.log("UniswapV3Adapter Deployed at:", address(adapter));
        
        // 2. Deploy ZkVerifier (ECDSA-based for now)
        // For Axiom: ZkVerifierAxiom verifier = new ZkVerifierAxiom(axiomV2Query);
        ZkVerifier verifier = new ZkVerifier(keeper);
        console.log("ZkVerifier Deployed at:", address(verifier));
        console.log("Trusted Signer (Keeper):", keeper);
        
        // 3. Deploy CoreVault
        CoreVault vault = new CoreVault(
            IERC20(asset),
            "Liquidity Vector Vault (Axiom)",
            "vvUSDC-Axiom",
            address(adapter),
            address(verifier)
        );
        console.log("CoreVault Deployed at:", address(vault));
        
        // 4. Grant keeper role
        vault.grantRole(vault.KEEPER_ROLE(), keeper);
        console.log("Granted KEEPER_ROLE to:", keeper);
        
        vm.stopBroadcast();
        
        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Sepolia");
        console.log("Adapter:", address(adapter));
        console.log("Verifier:", address(verifier));
        console.log("Vault:", address(vault));
        console.log("Keeper:", keeper);
        console.log("\nNOTE: Using mock Axiom address for testing.");
        console.log("For production, update axiomV2Query to real address from Axiom docs.");
    }
}
