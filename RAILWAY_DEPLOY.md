# Liquidity Vector - Railway Backend Deployment Guide

## 🚂 Railway Setup for Keeper Bot & Backend

Railway will host your Python keeper bot that monitors the protocol and executes rebalances.

---

## 📋 What Railway Will Run

- **Keeper Bot** (`scripts/keepers/bot.py`) - Monitors market data, runs GARCH model, executes rebalances
- **Health Monitoring** - Automatic restarts on failure
- **Environment Variables** - Secure secrets management
- **Logs** - Real-time logging and monitoring

---

## 🚀 Deploy to Railway (2 Methods)

### Method 1: Railway Dashboard (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `liquidity-vector-dashboard`

3. **Configure Service**
   - Railway auto-detects Python
   - Set start command: `python scripts/keepers/bot.py`
   - Or use the `railway.json` config (already created)

4. **Add Environment Variables**
   ```
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   PRIVATE_KEY=0xYOUR_KEEPER_PRIVATE_KEY
   VAULT_ADDRESS=0xYOUR_DEPLOYED_VAULT_ADDRESS
   KEEPER_ADDRESS=0xYOUR_KEEPER_ADDRESS
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-service-role-key
   ```

5. **Deploy**
   - Click "Deploy"
   - Railway builds and starts your bot
   - Monitor logs in real-time

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to your project
railway link

# Add environment variables
railway variables set RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
railway variables set PRIVATE_KEY=0xYOUR_KEEPER_PRIVATE_KEY
railway variables set VAULT_ADDRESS=0xYOUR_VAULT_ADDRESS

# Deploy
railway up
```

---

## 📁 Files Created for Railway

### 1. `railway.json`
Railway configuration with:
- Build command: `pip install -r requirements.txt`
- Start command: `python scripts/keepers/bot.py`
- Restart policy: Auto-restart on failure (max 10 retries)

### 2. `requirements.txt`
Python dependencies for the keeper bot:
- web3 - Ethereum interaction
- pandas/numpy - Data processing
- arch - GARCH model
- supabase - Database
- python-dotenv - Environment variables

---

## 🔑 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RPC_URL` | Ethereum RPC endpoint | `https://eth-sepolia.g.alchemy.com/v2/...` |
| `PRIVATE_KEY` | Keeper bot wallet private key | `0x123...` |
| `VAULT_ADDRESS` | Deployed CoreVault address | `0xabc...` |
| `KEEPER_ADDRESS` | Keeper bot wallet address | `0x9425...` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Supabase service role key | `eyJ...` |

**Optional:**
- `MIN_PROFIT_THRESHOLD` - Minimum profit to trigger rebalance (default: 0.02 ETH)
- `CYCLE_TIME` - Seconds between checks (default: 3600)
- `COINGECKO_API_KEY` - For higher rate limits

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Railway (Backend)               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Keeper Bot (Python)              │ │
│  │  - Fetches market data            │ │
│  │  - Runs GARCH model               │ │
│  │  - Executes rebalances            │ │
│  │  - Writes to Supabase             │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Vercel (Frontend)               │
│  - Next.js Dashboard                    │
│  - Reads from Supabase                  │
│  - Displays real-time data              │
└─────────────────────────────────────────┘
```

---

## 📊 Monitoring & Logs

**View Logs:**
- Railway Dashboard → Your Project → Logs
- Or CLI: `railway logs`

**Health Checks:**
- Railway monitors your service
- Auto-restarts on crashes
- Email notifications on failures

**Metrics:**
- CPU usage
- Memory usage
- Network traffic
- Deployment history

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update keeper bot"
git push origin main
# Railway automatically rebuilds and redeploys
```

---

## 💰 Pricing

**Free Tier:**
- $5 free credits/month
- Perfect for testing
- Sleeps after 30 min inactivity

**Hobby Plan ($5/month):**
- No sleep
- 500 hours/month
- Recommended for production

**Pro Plan ($20/month):**
- Unlimited hours
- Priority support
- Team collaboration

---

## 🐛 Troubleshooting

**Bot not starting:**
- Check environment variables are set
- Verify `requirements.txt` has all dependencies
- Check Railway logs for errors

**Connection errors:**
- Verify RPC_URL is correct
- Check PRIVATE_KEY has funds for gas
- Ensure VAULT_ADDRESS is deployed

**Rebalances not executing:**
- Check MIN_PROFIT_THRESHOLD is reasonable
- Verify keeper has approval to call vault
- Check gas prices aren't too high

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use Railway secrets** - Don't hardcode keys
3. **Separate wallets** - Use different wallet for keeper vs deployer
4. **Monitor activity** - Set up alerts for unusual behavior
5. **Limit permissions** - Keeper should only have rebalance permission

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] Environment variables configured
- [ ] `requirements.txt` verified
- [ ] Keeper wallet funded with gas
- [ ] Vault deployed and address set
- [ ] Bot tested locally first
- [ ] Monitoring/alerts configured

---

**Your Railway URL:** `https://liquidity-vector-bot.up.railway.app`  
**Deployment time:** ~3-5 minutes  
**Auto-deploy:** On every git push  
**Logs:** Real-time in Railway dashboard
