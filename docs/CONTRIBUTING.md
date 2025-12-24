# Contributing to Liquidity Vector

Thank you for your interest in contributing to the Liquidity Vector protocol! We are building the future of quant-driven DeFi, and we value your input.

## 🛠 Coding Standards

### Solidity
*   **Version:** `^0.8.20`
*   **Style:** Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/v0.8.20/style-guide.html).
*   **Tools:** Use `forge fmt` before submitting PRs.
*   **Naming:** Interfaces must start with `I` (e.g., `IVault.sol`).

### Python (Quant Engine)
*   **Version:** `3.10+`
*   **Style:** PEP 8.
*   **Type Hinting:** Required for all function signatures.
*   **Documentation:** Google-style docstrings.

---

## 🌿 Branching Strategy (GitFlow)
*   `main`: Production-ready code.
*   `develop`: The integration branch for features.
*   `feature/feature-name`: For new features.
*   `fix/bug-name`: For bug fixes.

### The PR Process
1.  Fork the repository and create your branch from `develop`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes (`forge test` and `pytest`).
4.  Update the documentation if necessary.
5.  Submit a Pull Request to the `develop` branch.

---

## 🧪 Testing Requirements
All PRs must maintain or improve the existing test coverage.
*   **Unit Tests:** Every new function requires a corresponding test case.
*   **Invariants:** Core financial logic (e.g., "Total Assets should never decrease on a swap") must have Forge invariant tests.
*   **Fuzzing:** Use Foundry's fuzzer for all math-heavy functions.

## 💬 Communication
Join our [Discord/Telegram] for architectural discussions. For technical bugs, please open a GitHub Issue.
