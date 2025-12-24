#!/usr/bin/env python3
"""
Signature-based proof generator for ZkVerifier
Generates ECDSA signatures for tick range predictions
"""
import os
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3

def generate_signature_proof(tick_lower: int, tick_upper: int, block_number: int, private_key: str) -> bytes:
    """
    Generate ECDSA signature for tick range prediction
    
    Args:
        tick_lower: Lower tick boundary
        tick_upper: Upper tick boundary  
        block_number: Current block number for freshness
        private_key: Keeper's private key (0x...)
        
    Returns:
        bytes: ECDSA signature that can be verified on-chain
    """
    # Create message hash matching contract logic
    # abi.encodePacked(tickLower, tickUpper, blockNumber)
    message_hash = Web3.solidity_keccak(
        ['int24', 'int24', 'uint256'],
        [tick_lower, tick_upper, block_number]
    )
    
    # Sign the message
    account = Account.from_key(private_key)
    message = encode_defunct(hexstr=message_hash.hex())
    signed_message = account.sign_message(message)
    
    return signed_message.signature

def main():
    """Test signature generation"""
    # Example usage
    private_key = os.getenv("KEEPER_PK", "0x" + "1" * 64)  # Dummy key for testing
    
    tick_lower = -1000
    tick_upper = 1000
    block_number = 12345
    
    signature = generate_signature_proof(tick_lower, tick_upper, block_number, private_key)
    
    print(f"Generated signature: 0x{signature.hex()}")
    print(f"Signature length: {len(signature)} bytes")
    
    # Verify signer
    account = Account.from_key(private_key)
    print(f"Signer address: {account.address}")

if __name__ == "__main__":
    main()
