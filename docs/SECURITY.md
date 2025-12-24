# Security Policy

## 🛡 Security Commitment
Liquidity Vector is a financial protocol. We treat the security of user funds as our absolute highest priority. We employ a "Defense in Depth" strategy combining formal verification, professional audits, and real-time on-chain monitoring.


## 📩 Responsible Disclosure
If you discover a vulnerability, please do NOT open a public GitHub issue.
*   **Email:** security@liquidityvector.fi
*   **PGP Key:** [Link to PGP Key]
*   **Expectation:** We will acknowledge your report within 12 hours and provide a timeline for a fix.

---

## 🔍 Audits
All production code is audited by leading firms.
*   **Audit 1:** [Link to Report - Q1 2026] - Spearbit
*   **Audit 2:** [Link to Report - Q2 2026] - Sherlock

## 🚨 Emergency Procedures
The protocol utilizes a **Pause Guardian** multisig.
*   The Guardian can pause deposits and rebalances but **cannot** prevent withdrawals.
*   In the event of a detected exploit, the Guardian will trigger `emergencyUnwind()` to move all funds into USDC on Aave.
