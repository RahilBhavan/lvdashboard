/**
 * Axiom Circuit for Liquidity Vector
 * 
 * Proves: "The ETH/USD price at block X was Y (from Chainlink oracle)"
 * 
 * This circuit queries Chainlink's on-chain price feed and generates a ZK proof
 * that the price data is authentic and unmanipulated.
 */

import { addToCallback, CircuitValue, getStorage, constant, checkLessThan, checkGreaterThan } from "@axiom-crypto/client";

// Chainlink ETH/USD Price Feed on Sepolia
const CHAINLINK_ETH_USD_SEPOLIA = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const PRICE_STORAGE_SLOT = 3; // latestAnswer slot

interface CircuitInputs {
    blockNumber: CircuitValue;
}

/**
 * Main circuit function
 * Axiom will execute this and generate a ZK-SNARK proof
 */
export const liquidityVectorCircuit = async (inputs: CircuitInputs) => {
    // 1. Query Chainlink price at specific block
    const price = await getStorage({
        blockNumber: inputs.blockNumber,
        address: CHAINLINK_ETH_USD_SEPOLIA,
        slot: PRICE_STORAGE_SLOT
    });

    // 2. Sanity checks: Ensure price is reasonable
    // Chainlink prices are in 8 decimals, so $1000 = 1000 * 10^8
    const minPrice = constant(1000 * 1e8); // $1,000 USD
    const maxPrice = constant(10000 * 1e8); // $10,000 USD

    checkGreaterThan(price, minPrice);
    checkLessThan(price, maxPrice);

    // 3. Add proven data to callback
    // This data will be sent to ZkVerifier contract on-chain
    addToCallback({
        blockNumber: inputs.blockNumber,
        price: price
    });
};

export default liquidityVectorCircuit;
