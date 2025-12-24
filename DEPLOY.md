# Liquidity Vector - Complete Deployment Guide

## 🌐 Full Stack Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│              Vercel (Next.js/Vite)                   │
│  • Dashboard UI                                      │
│  • Wallet connection                                 │
│  • Real-time data display                            │
│  URL: liquidity-vector-dashboard.vercel.app          │
└──────────────────────────────────────────────────────┘
                         ↓ ↑
                    (Reads from)
                         ↓ ↑
┌──────────────────────────────────────────────────────┐
│                   DATABASE                           │
│              Supabase (PostgreSQL)                   │
│  • APY history                                       │
│  • Transaction logs                                  │
│  • Bot heartbeat                                     │
└──────────────────────────────────────────────────────┘
                         ↑ ↓
                    (Writes to)
                         ↑ ↓
┌──────────────────────────────────────────────────────┐
│                    BACKEND                           │
│              Railway (Python Bot)                    │
│  • Keeper bot (24/7)                                 │
│  • Market data fetching                              │
│  • GARCH model execution                             │
│  • On-chain rebalancing                              │
└──────────────────────────────────────────────────────┘
                         ↓
                    (Executes)
                         ↓
┌──────────────────────────────────────────────────────┐
│                  BLOCKCHAIN                          │
│              Ethereum (Sepolia/Mainnet)              │
│  • CoreVault smart contract                          │
│  • Uniswap V3 positions                              │
│  • Aave V3 lending                                   │
└──────────────────────────────────────────────────────┘
```

---

## 📋 Deployment Checklist

### 1. Frontend (Vercel)
- [ ] Push code to GitHub
- [ ] Create Vercel project
- [ ] Set environment variables
- [ ] Deploy frontend
- [ ] Test wallet connection
- [ ] Verify charts load

**Guide:** See [DEPLOY.md](./DEPLOY.md)

### 2. Backend (Railway)
- [ ] Create Railway account
- [ ] Link GitHub repo
- [ ] Set environment variables
- [ ] Deploy keeper bot
- [ ] Monitor logs
- [ ] Verify bot is running

**Guide:** See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

### 3. Database (Supabase)
- [ ] Create Supabase project
- [ ] Set up tables (apy_history, bot_heartbeat)
- [ ] Get API keys
- [ ] Configure RLS policies
- [ ] Test connections

### 4. Smart Contracts
- [ ] Deploy CoreVault
- [ ] Deploy adapters
- [ ] Set keeper address
- [ ] Fund keeper wallet
- [ ] Test rebalance function

---

## 🚀 Quick Deploy (All Services)

### Step 1: Deploy Frontend to Vercel
```bash
# Push to GitHub
git add .
git commit -m "Deploy to Vercel"
git push origin main

# Deploy
vercel --prod
```

### Step 2: Deploy Backend to Railway
```bash
# Install CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Step 3: Configure Environment Variables

**Vercel (Frontend):**
```bash
VITE_VAULT_ADDRESS=0xYOUR_VAULT
VITE_WALLETCONNECT_PROJECT_ID=your_id
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

**Railway (Backend):**
```bash
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/KEY
PRIVATE_KEY=0xKEEPER_PRIVATE_KEY
VAULT_ADDRESS=0xYOUR_VAULT
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_KEY=your_service_key
```

---

## 🔗 Service URLs

After deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `liquidity-vector-dashboard.vercel.app` | User dashboard |
| Backend | `liquidity-vector-bot.up.railway.app` | Keeper bot (no UI) |
| Database | `xyz.supabase.co` | Data storage |
| Blockchain | `etherscan.io/address/VAULT` | Smart contracts |

---

## 📊 Monitoring

**Frontend (Vercel):**
- Analytics: Vercel Dashboard
- Errors: Vercel Logs
- Performance: Lighthouse

**Backend (Railway):**
- Logs: Railway Dashboard
- Uptime: Railway Metrics
- Alerts: Railway Notifications

**Database (Supabase):**
- Queries: Supabase Dashboard
- Performance: Supabase Logs
- Storage: Supabase Metrics

---

## 💰 Cost Estimate

| Service | Free Tier | Paid Plan | Recommended |
|---------|-----------|-----------|-------------|
| Vercel | ✅ Unlimited | $20/mo Pro | Free tier OK |
| Railway | $5 credits/mo | $5/mo Hobby | Hobby ($5/mo) |
| Supabase | ✅ 500MB DB | $25/mo Pro | Free tier OK |
| **Total** | **~$0-5/mo** | **~$50/mo** | **~$5/mo** |

---

## 🐛 Troubleshooting

**Frontend not loading:**
- Check Vercel build logs
- Verify environment variables
- Test locally first: `npm run build && npm run preview`

**Backend not running:**
- Check Railway logs
- Verify Python dependencies
- Test locally: `python scripts/keepers/bot.py`

**Database connection failed:**
- Verify Supabase URL and keys
- Check RLS policies
- Test connection with Supabase client

**Rebalances not executing:**
- Check keeper wallet has gas
- Verify vault address is correct
- Check MIN_PROFIT_THRESHOLD

---

## 📞 Support

- **Vercel:** https://vercel.com/support
- **Railway:** https://discord.gg/railway
- **Supabase:** https://supabase.com/support

---

## ✅ Post-Deployment

After everything is deployed:

1. **Test End-to-End**
   - Connect wallet on frontend
   - Verify data loads from Supabase
   - Check bot logs on Railway
   - Monitor first rebalance

2. **Set Up Monitoring**
   - Enable Vercel analytics
   - Configure Railway alerts
   - Set up Supabase notifications

3. **Document URLs**
   - Save all deployment URLs
   - Share with team
   - Update README

4. **Security Audit**
   - Verify no secrets in code
   - Check environment variables
   - Review access permissions

---

**Deployment Complete! 🎉**

Your full-stack DeFi protocol is now live:
- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ Database on Supabase
- ✅ Contracts on Ethereum
