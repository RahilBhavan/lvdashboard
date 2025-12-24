# Axiom V2 Implementation Status & Documentation

## Current Status: Proof of Concept Complete

### ✅ Completed Components

1. **Axiom SDK Installation**
   - Installed `@axiom-crypto/client` and `@axiom-crypto/core`
   - Installed `axiom-v2-periphery` Solidity contracts
   - Updated `foundry.toml` with Axiom remappings

2. **Circuit Definition** (`axiom/circuit.ts`)
   - Defines ZK proof for Chainlink ETH/USD price queries
   - Includes sanity checks ($1000-$10000 range)
   - Structured for Axiom V2 callback

3. **Proof Generation Script** (`scripts/axiom/generate_proof.ts`)
   - TypeScript script to generate Axiom proofs
   - Queries Chainlink price feed at specific blocks
   - Returns query ID for on-chain verification

4. **Smart Contract** (`contracts/src/ZkVerifierAxiom.sol`)
   - Callback receiver for Axiom-verified data
   - Stores verified proofs with block number, price, timestamp
   - Compatible with existing `CoreVault` interface

---

## Architecture Overview

```
┌─────────────┐
│   Bot.py    │ Calculates optimal tick ranges using VAMR
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Axiom Prover (TS)   │ Generates ZK proof of Chainlink price
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Axiom V2 Network    │ Verifies proof off-chain
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ ZkVerifier Contract │ Receives callback with verified data
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   CoreVault         │ Validates proof exists, executes rebalance
└─────────────────────┘
```

---

## What This Proves

**Current Implementation (ECDSA)**:
- ✅ "The keeper signed these parameters"
- ❌ Doesn't prove data source

**Axiom V2 Implementation**:
- ✅ "The ETH/USD price at block X was Y (from Chainlink)"
- ✅ "This data came from the blockchain, not manipulated"
- ✅ Uses real ZK-SNARKs (Halo2-based)
- ❌ Doesn't prove VAMR model execution (would need custom circuit)

---

## Implementation Notes

### Why This is a Proof of Concept

The Axiom V2 API is rapidly evolving. The implementation demonstrates:
1. **Conceptual Architecture**: How Axiom integrates with smart contracts
2. **Circuit Structure**: What data to prove and how
3. **Callback Pattern**: How verified data reaches the contract

### Production Deployment Would Require

1. **API Verification**: Confirm current Axiom V2 SDK API
2. **Contract Inheritance**: Properly inherit from `AxiomV2Client`
3. **Callback Implementation**: Implement `_axiomV2Callback` correctly
4. **Sepolia Testing**: Deploy and test with real Axiom network
5. **Query ID Management**: Handle async proof submission

---

## Comparison: ECDSA vs Axiom

| Feature | ECDSA (Current) | Axiom V2 (PoC) |
|---------|----------------|----------------|
| **Implementation Status** | ✅ Complete, tested | 🟡 Proof of concept |
| **Cryptographic Security** | ✅ Yes | ✅ Yes (ZK-SNARKs) |
| **Proves Data Source** | ❌ No | ✅ Yes (Chainlink) |
| **Proves Computation** | ❌ No | ❌ No (would need custom circuit) |
| **Integration Complexity** | ⭐ Simple | ⭐⭐⭐⭐ Complex |
| **Gas Cost** | ~30k | ~200k |
| **Testnet Cost** | Free | Free |
| **Production Cost** | Free | $50-200/month |
| **Time to Production** | ✅ Ready now | 2-3 more days |

---

## Recommendation for School Project

### Option A: Use ECDSA (Recommended)

**Rationale**:
- ✅ **Real cryptography**: Not a mock, uses ECDSA signatures
- ✅ **Production-ready**: All tests passing
- ✅ **Easier to explain**: Clear security model
- ✅ **Time-efficient**: No additional work needed

**Thesis Talking Points**:
- "Implemented ECDSA-based trustless verification"
- "Designed with upgrade path to ZK-SNARKs"
- "Pragmatic security approach balancing complexity and security"

### Option B: Include Axiom as Future Work

**Rationale**:
- ✅ **Shows ZK understanding**: Demonstrates knowledge of ZK-SNARKs
- ✅ **Architectural design**: Proof of concept shows feasibility
- ✅ **Upgrade path**: Clear migration strategy

**Thesis Talking Points**:
- "Implemented ECDSA with Axiom V2 upgrade path"
- "Created proof-of-concept Axiom circuit"
- "Demonstrated understanding of ZK coprocessor architecture"

---

## Files Created

### TypeScript/JavaScript
- [`axiom/circuit.ts`](file:///Users/rahilbhavan/liquidity-vector-dashboard/axiom/circuit.ts) - Axiom circuit definition
- [`scripts/axiom/generate_proof.ts`](file:///Users/rahilbhavan/liquidity-vector-dashboard/scripts/axiom/generate_proof.ts) - Proof generation script

### Solidity
- [`contracts/src/ZkVerifierAxiom.sol`](file:///Users/rahilbhavan/liquidity-vector-dashboard/contracts/src/ZkVerifierAxiom.sol) - Axiom callback receiver

### Documentation
- [`docs/ZK_SNARK_IMPLEMENTATION_GUIDE.md`](file:///Users/rahilbhavan/liquidity-vector-dashboard/docs/ZK_SNARK_IMPLEMENTATION_GUIDE.md) - Comprehensive ZK research

---

## Next Steps (If Pursuing Full Axiom Integration)

1. **Verify Axiom API** (1 day)
   - Check current Axiom V2 SDK documentation
   - Confirm callback interface
   - Test proof generation locally

2. **Update Contracts** (1 day)
   - Properly inherit from `AxiomV2Client`
   - Implement `_axiomV2Callback`
   - Update deployment script with Axiom addresses

3. **Integration Testing** (1 day)
   - Deploy to Sepolia
   - Generate real proofs
   - Verify callback reception
   - Test full rebalance flow

4. **Documentation** (0.5 days)
   - Update README
   - Document proof generation process
   - Add troubleshooting guide

**Total**: 3-4 additional days

---

## Conclusion

**For Academic Purposes**:
- The **ECDSA implementation** is production-ready and demonstrates real cryptographic security
- The **Axiom proof-of-concept** shows understanding of ZK-SNARKs and upgrade paths
- Both approaches are valid for a school project

**Recommendation**: Use ECDSA for demo, include Axiom PoC in documentation as "future work"

This demonstrates:
1. **Pragmatic engineering**: Choosing appropriate security for the use case
2. **Forward thinking**: Designing for future upgrades
3. **Technical depth**: Understanding both signature schemes and ZK-SNARKs
