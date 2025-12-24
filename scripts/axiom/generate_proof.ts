#!/usr/bin/env ts-node
/**
 * Axiom Proof Generator for Liquidity Vector
 * 
 * Generates ZK-SNARK proofs that ETH/USD price data came from Chainlink oracle
 * 
 * Usage:
 *   npx ts-node scripts/axiom/generate_proof.ts <blockNumber>
 */

import { Axiom } from '@axiom-crypto/client';
import * as dotenv from 'dotenv';

dotenv.config();

const SEPOLIA_CHAIN_ID = 11155111;
const CHAINLINK_ETH_USD = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

async function generateAxiomProof(blockNumber: number): Promise<string> {
    console.log(`Generating Axiom proof for block ${blockNumber}...`);

    try {
        // Initialize Axiom client
        const axiom = new Axiom({
            providerUri: process.env.RPC_URL || '',
            chainId: SEPOLIA_CHAIN_ID,
            version: 'v2'
        });

        // Create query for Chainlink price at specific block
        const query = await axiom.query({
            sourceChainId: SEPOLIA_CHAIN_ID,
            dataQuery: {
                blockNumber: blockNumber,
                address: CHAINLINK_ETH_USD,
                slot: 3 // latestAnswer storage slot
            },
            computeQuery: {
                // Use our custom circuit
                circuit: '../axiom/circuit.ts',
                inputs: {
                    blockNumber: blockNumber
                }
            },
            callback: {
                target: process.env.VAULT_ADDRESS || '',
                extraData: '0x'
            }
        });

        // Generate proof
        console.log('Proving...');
        const proof = await query.prove();

        console.log('Proof generated successfully!');
        console.log('Query ID:', proof.queryId);
        console.log('Proof Hash:', proof.proofHash);

        // Return query ID (this is what gets passed to the contract)
        return proof.queryId;

    } catch (error) {
        console.error('Error generating proof:', error);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    const blockNumber = parseInt(process.argv[2] || '0');

    if (!blockNumber) {
        console.error('Usage: npx ts-node generate_proof.ts <blockNumber>');
        process.exit(1);
    }

    generateAxiomProof(blockNumber)
        .then(queryId => {
            console.log(JSON.stringify({ queryId }));
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

export { generateAxiomProof };
