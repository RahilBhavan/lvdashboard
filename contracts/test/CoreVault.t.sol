// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CoreVault.sol";
import "../src/adapters/UniswapV3Adapter.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 Token for Testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock", "MCK") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// Mock Uniswap NonfungiblePositionManager
contract MockPositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    function mint(MintParams calldata params) external payable returns (
        uint256 tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    ) {
        tokenId = 1; // Simplified Mock ID
        liquidity = 1000;
        amount0 = params.amount0Desired;
        amount1 = params.amount1Desired;
        
        // Simulate transfer from sender
        IERC20(params.token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(params.token1).transferFrom(msg.sender, address(this), amount1);
    }
    
    // Stub other functions needed for IERC721Receiver or liquidity management
    function decreaseLiquidity(address) external pure returns (uint256, uint256) { return (0,0); }
    function collect(address) external pure returns (uint256, uint256) { return (0,0); }
}

contract CoreVaultTest is Test {
    CoreVault vault;
    UniswapV3Adapter adapter;
    MockERC20 asset;
    MockERC20 token1;
    MockPositionManager posMgr;
    
    address user = address(0x1);
    address keeper = address(0x2);

    function setUp() public {
        asset = new MockERC20(); // token0
        token1 = new MockERC20(); // token1
        posMgr = new MockPositionManager();
        
        // Deploy Adapter
        adapter = new UniswapV3Adapter(
            address(posMgr),
            address(asset),
            address(token1),
            3000
        );

        // Deploy Vault
        vault = new CoreVault(
            IERC20(address(asset)),
            "Vector Vault",
            "vvUSDC",
            address(adapter)
        );
        
        // Grant Keeper Role
        vault.grantRole(vault.KEEPER_ROLE(), keeper);
        
        // Mint tokens to User
        asset.mint(user, 10000e18);
        vm.prank(user);
        asset.approve(address(vault), type(uint256).max);
    }

    /// @notice Verify deposits mint shares 1:1 initially
    function testDeposit() public {
        vm.startPrank(user);
        uint256 depositAmount = 100e18;
        uint256 shares = vault.deposit(depositAmount, user);
        
        assertEq(shares, depositAmount, "Shares should equal assets 1:1 initially");
        assertEq(vault.totalAssets(), depositAmount, "Total assets should match deposit");
        vm.stopPrank();
    }

    /// @notice Verify rebalance flow via Keeper
    function testRebalance() public {
        // 1. User deposits
        vm.prank(user);
        vault.deposit(1000e18, user);

        // 2. Prepare Vector Data (tickLower: -600, tickUpper: 600)
        bytes memory data = abi.encode(int24(-600), int24(600));

        // 3. Keeper calls rebalance
        vm.prank(keeper);
        vault.rebalance(data);
        
        // In a real env, check adapter events or state.
        // Here we ensure it didn't revert.
    }

    /// @notice Invariant: Total Assets should not decrease significantly after rebalance
    function testInvariantSolvency() public {
        vm.prank(user);
        vault.deposit(1000e18, user);
        
        uint256 assetsBefore = vault.totalAssets();
        
        bytes memory data = abi.encode(int24(-100), int24(100));
        vm.prank(keeper);
        vault.rebalance(data);
        
        uint256 assetsAfter = vault.totalAssets();
        
        assertGe(assetsAfter, assetsBefore, "Solvency violated: Assets decreased");
    }

    /// @notice Verify non-keeper cannot rebalance
    function testRebalanceAccessControl() public {
        bytes memory data = abi.encode(int24(-100), int24(100));
        
        vm.expectRevert(CoreVault.Unauthorized.selector);
        vm.prank(user); // Not a keeper
        vault.rebalance(data);
    }
}
