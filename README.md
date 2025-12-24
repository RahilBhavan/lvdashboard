# Liquidity Vector Dashboard

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Railway](https://img.shields.io/badge/Deploy-Railway-purple?logo=railway)](https://railway.app)
[![CI](https://github.com/RahilBhavan/lv_dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/RahilBhavan/lv_dashboard/actions/workflows/ci.yml)

A real-time dashboard for monitoring and managing the Liquidity Vector protocol - an automated liquidity management system for Uniswap V3 with ZK-verified rebalancing.

## 🚀 Quick Start

### Local Development

**Prerequisites:** Node.js 20+, Python 3.10+, Docker (optional)

1. **Clone and install:**
   ```bash
   git clone https://github.com/RahilBhavan/lv_dashboard.git
   cd lv_dashboard
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.development.example .env
   # Edit .env with your configuration
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Run keeper bot (optional):**
   ```bash
   pip install -r requirements.txt
   python scripts/keepers/bot.py
   ```

### Docker Deployment

```bash
docker-compose up --build
```

Frontend available at `http://localhost:3000`

## 📦 Deployment

This project is optimized for automatic deployment:

- **Frontend** → [Vercel](https://vercel.com) (auto-deploys from `main`)
- **Backend** → [Railway](https://railway.app) (auto-deploys from `main`)

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.**

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Smart Contracts**: Solidity + Foundry
- **Keeper Bot**: Python + Web3.py
- **Models**: GARCH volatility + Trend analysis
- **Database**: Supabase
- **Blockchain**: Ethereum (Sepolia testnet)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Setup Real Data](./SETUP_REAL_DATA.md) - Integrate live blockchain data
- [Vercel Deploy](./VERCEL_DEPLOY.md) - Frontend deployment details
- [Railway Deploy](./RAILWAY_DEPLOY.md) - Backend deployment details

## 🔧 Development

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build
npm run build

# Format code
npm run format

# Run tests
npm test                    # Frontend
python -m pytest           # Python
forge test                 # Solidity
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Live Dashboard](https://your-project.vercel.app)
- [Documentation](./docs)
- [GitHub Repository](https://github.com/RahilBhavan/lv_dashboard)

