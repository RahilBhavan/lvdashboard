// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IStrategyAdapter.sol";
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

    function deploy(uint256 assets, bytes calldata data) external override returns (uint256) {
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
                amount0Desired: assets / 2, // Simplified for single-sided example
                amount1Desired: assets / 2, // In prod, swap to ratio first
                amount0Min: 0, 
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });

        (uint256 _tokenId, , , ) = positionManager.mint(params);
        tokenId = _tokenId;
        
        // Refund dust
        // ... implementation omitted for brevity
        
        return assets;
    }

    function withdraw(uint256 shares) external override returns (uint256) {
        // burn liquidity logic
        // positionManager.decreaseLiquidity(...)
        // positionManager.collect(...)
        return 0; // placeholder
    }

    function harvest() external override returns (uint256) {
        // collect fees logic
        return 0; // placeholder
    }

    function estimatedTotalAssets() external view override returns (uint256) {
        // Query position manager for liquidity and calculate value
        return 0; // placeholder
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
