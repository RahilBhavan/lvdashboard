// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CoreVault.sol";
import "../src/ZkVerifier.sol";
import "../src/adapters/UniswapV3Adapter.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Configuration from Env
        address token0 = vm.envAddress("TOKEN0"); // e.g., USDC
        address token1 = vm.envAddress("TOKEN1"); // e.g., WETH
        address positionManager = vm.envAddress("POSITION_MANAGER"); // Uniswap NPM
        address keeper = vm.envAddress("KEEPER_ADDRESS"); // The bot's address

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Adapter
        UniswapV3Adapter adapter = new UniswapV3Adapter(
            positionManager,
            token0,
            token1,
            3000 // Fee Tier
        );
        console.log("UniswapV3Adapter Deployed at:", address(adapter));

        // 2. Deploy Verifier (with keeper as trusted signer)
        ZkVerifier verifier = new ZkVerifier(keeper);
        console.log("ZkVerifier Deployed at:", address(verifier));
        console.log("Trusted Signer:", keeper);

        // 3. Deploy Vault
        CoreVault vault = new CoreVault(
            IERC20(token0),
            "Vector Vault USDC",
            "vvUSDC",
            address(adapter),
            address(verifier)
        );
        console.log("CoreVault Deployed at:", address(vault));

        // 4. Setup Roles
        vault.grantRole(vault.KEEPER_ROLE(), keeper);
        console.log("Granted KEEPER_ROLE to:", keeper);

        vm.stopBroadcast();
    }
}
