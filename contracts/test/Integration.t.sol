// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CoreVault.sol";
import "../src/ZkVerifier.sol";
import "../src/adapters/UniswapV3Adapter.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract IntegrationTest is Test {
    CoreVault vault;
    ZkVerifier verifier;
    UniswapV3Adapter adapter;
    
    // Addresses from Env
    address USDC;
    address WETH;
    address POSITION_MANAGER;
    
    address keeper = address(0x2);
    address user = address(0x1);

    function setUp() public {
        string memory rpc = vm.envString("RPC_URL");
        vm.createSelectFork(rpc);
        
        USDC = vm.envAddress("TOKEN0");
        WETH = vm.envAddress("TOKEN1");
        POSITION_MANAGER = vm.envAddress("POSITION_MANAGER");
        
        // 1. Deploy Components
        verifier = new ZkVerifier(keeper);
        
        adapter = new UniswapV3Adapter(
            POSITION_MANAGER,
            USDC,
            WETH,
            3000 // Fee Tier
        );
        
        vault = new CoreVault(
            IERC20(USDC),
            "Vector Vault",
            "vvUSDC",
            address(adapter),
            address(verifier)
        );
        
        // 2. Setup Roles
        vault.grantRole(vault.KEEPER_ROLE(), keeper);
        
        // 3. Fund User using 'deal' (Foundry cheatcode)
        deal(USDC, user, 5000 * 1e6); // Assuming 6 decimals for Token0
        
        vm.prank(user);
        IERC20(USDC).approve(address(vault), type(uint256).max);
    }

    function testFullLifecycle() public {
        // A. Deposit
        vm.startPrank(user);
        uint256 depositAmt = 1000 * 1e6;
        vault.deposit(depositAmt, user);
        vm.stopPrank();
        
        assertEq(vault.totalAssets(), depositAmt, "Assets should match deposit");

        // B. Rebalance (Deploy to Uniswap)
        // Current Tick of USDC/WETH ~200000? Need valid range.
        // Let's get current tick from Pool to be safe, or just use wide range.
        // USDC(6) / WETH(18). Price ~3000 USDC/ETH.
        // 1 ETH = 3000 USDC. 
        // Token0 = USDC, Token1 = WETH (Address comparison: USDC < WETH? 0xA0 < 0xC0. Yes.)
        // Price = token1/token0 = 1e12 / 3000? No.
        // Uniswap logic is tricky. Let's use wide mocks or just try standard ticks.
        // Tick ~ 200,000 for ETH/USDC 0.05%?
        // Actually, let's just pick valid ticks near current price if possible, or wide.
        
        int24 tickLower = 190000;
        int24 tickUpper = 210000;
        
        vm.startPrank(keeper);
        vault.rebalance(hex"1234", tickLower, tickUpper);
        vm.stopPrank();
        
        // Check Adapter Condition
        uint256 tokenId = adapter.tokenId();
        assertTrue(tokenId > 0, "NFT should be minted");
        assertApproxEqAbs(vault.totalAssets(), depositAmt, 1e6, "Assets should be conserved (minus loose change)");

        // C. Harvest
        vm.warp(block.timestamp + 10 days); // Simulate time
        
        // To get real fees, we need swaps in the pool. In a Fork, state is frozen unless we simulate swaps.
        // We probably won't get fees unless we interact with the pool.
        // But we can test the function call doesn't revert.
        vm.startPrank(keeper);
        vault.harvest();
        vm.stopPrank();

        // D. Emergency Unwind (or Rebalance Close)
        // Let's test Emergency Unwind by Admin
        // In this test, 'this' contract (IntegrationTest) is the deployer, thus Admin.
        vm.startPrank(address(this)); 
        // Note: 'vm.prank(address(this))' might be redundant if we just call it directly,
        // but explicit prank ensures msg.sender is set correctly even if called via internal logic.
        
        vault.emergencyUnwind();
        vm.stopPrank();
        
        // Check TokenId is likely not burned but liquidity removed (depends on implementation).
        // Our implementation keeps tokenId but removes liquidity.
        
        // E. Withdraw
        vm.startPrank(user);
        vault.redeem(vault.balanceOf(user), user, user);
        vm.stopPrank();
        
        // User should have approx original params
        uint256 finalBal = IERC20(USDC).balanceOf(user);
        assertGe(finalBal, 4900 * 1e6, "Should have withdrawn most funds");
    }
}
