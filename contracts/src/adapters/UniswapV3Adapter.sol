// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IStrategyAdapter.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

/// @title UniswapV3Adapter
/// @notice Adapter for managing liquidity on Uniswap V3
contract UniswapV3Adapter is IStrategyAdapter, IERC721Receiver {
    using SafeERC20 for IERC20;

    INonfungiblePositionManager public immutable positionManager;
    IERC20 public immutable token0;
    IERC20 public immutable token1;
    uint24 public immutable feeTier;
    
    uint256 public tokenId; // The active NFT position ID

    struct VectorData {
        int24 tickLower;
        int24 tickUpper;
    }

    error InvalidTicks();
    error SlippageExceeded();

    constructor(
        address _positionManager,
        address _token0,
        address _token1,
        uint24 _feeTier
    ) {
        positionManager = INonfungiblePositionManager(_positionManager);
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        feeTier = _feeTier;
    }

    uint256 public deployedAssets; // Track deploy amount for MVP

    function deploy(uint256 assets, bytes calldata data) external override returns (uint256) {
        // ... (existing logic) ...
        (int24 tickLower, int24 tickUpper) = abi.decode(data, (int24, int24));
        
        if (tickLower >= tickUpper) revert InvalidTicks();

        // Approve Position Manager
        token0.forceApprove(address(positionManager), assets);
        token1.forceApprove(address(positionManager), assets);

        INonfungiblePositionManager.MintParams memory params =
            INonfungiblePositionManager.MintParams({
                token0: address(token0),
                token1: address(token1),
                fee: feeTier,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: assets / 2, 
                amount1Desired: assets / 2,
                amount0Min: 0, 
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });

        (uint256 _tokenId, , , ) = positionManager.mint(params);
        tokenId = _tokenId;
        deployedAssets = assets;
        
        return assets;
    }

    function withdraw(uint256) external override returns (uint256) {
        if (tokenId == 0) return 0;

        // 1. Decrease Liquidity (Remove 100%)
        (,,,,,,, uint128 liquidity, , , ,) = positionManager.positions(tokenId);
        
        if (liquidity > 0) {
            INonfungiblePositionManager.DecreaseLiquidityParams memory params = 
                INonfungiblePositionManager.DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: liquidity,
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp
                });
            positionManager.decreaseLiquidity(params);
        }

        // 2. Collect All Tokens (Principal + Fees)
        INonfungiblePositionManager.CollectParams memory collectParams =
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });
            
        (uint256 amount0, uint256 amount1) = positionManager.collect(collectParams);
        
        // 3. Transfer to Vault (msg.sender)
        // Note: Ideally we swap to single asset, but for MVP we send what we have.
        // CoreVault expects 'asset' (token0 or token1) to increase.
        if (amount0 > 0) token0.safeTransfer(msg.sender, amount0);
        if (amount1 > 0) token1.safeTransfer(msg.sender, amount1);
        
        // Burn NFT (Optional, but good cleanup)
        // positionManager.burn(tokenId); 
        // tokenId = 0; 
        // Keeping tokenId for history or reuse in some strategies
        
        return 0; // Interface return (amount withdrawn) - simplified
    }

    function harvest() external override returns (uint256) {
        if (tokenId == 0) return 0;
        
        // Collect Fees only? 
        // UniV3 collect(max, max) collects everything available (fees + uncollected principal).
        // Since we didn't decrease liquidity, this is just fees.
        INonfungiblePositionManager.CollectParams memory params =
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });
            
        (uint256 amount0, uint256 amount1) = positionManager.collect(params);
        
        if (amount0 > 0) token0.safeTransfer(msg.sender, amount0);
        if (amount1 > 0) token1.safeTransfer(msg.sender, amount1);
        
        return amount0 + amount1; // Approximate value
    }

    function estimatedTotalAssets() external view override returns (uint256) {
        return deployedAssets;
    }
    
    function onERC721Received(
        address, 
        address, 
        uint256, 
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
