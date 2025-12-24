# Axiom V2 Sepolia Deployment Addresses

## Contract Addresses (Sepolia Testnet)

Based on Axiom V2 documentation and deployments:

```
AxiomV2Query: 0x... (To be obtained from Axiom docs or deployment)
AxiomV2Core: 0x... (To be obtained from Axiom docs or deployment)
```

## How to Find Current Addresses

1. **Official Axiom Docs**: https://docs.axiom.xyz/docs/developer-resources/contract-addresses
2. **Axiom Explorer**: https://explorer.axiom.xyz/
3. **GitHub Deployments**: Check axiom-v2-periphery releases

## For Development/Testing

Since we're creating a proof-of-concept, we can:

**Option A**: Use a mock Axiom address for local testing
```solidity
address constant MOCK_AXIOM_V2_QUERY = address(0xA1); // Mock for testing
```

**Option B**: Deploy our own simplified version
- Deploy `ZkVerifierAxiom` without Axiom dependency
- Manually call `axiomCallback()` in tests
- Demonstrates architecture without full Axiom integration

**Option C**: Wait for Axiom deployment
- Contact Axiom team for current Sepolia addresses
- Full integration with real ZK proofs

## Recommended Approach for School Project

Use **Option B** (Simplified Version):
1. Deploy `ZkVerifierAxiom` as standalone contract
2. In tests, manually call `axiomCallback()` to simulate Axiom
3. Demonstrates ZK architecture without requiring live Axiom network
4. Document as "Axiom-compatible architecture"

This shows understanding of ZK-SNARKs while maintaining project timeline.
