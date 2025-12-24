# Liquidity Vector Dashboard - Deployment Guide

## 🚀 Quick Start

This project uses **automatic deployment** via GitHub integration:
- **Frontend** → Vercel (auto-deploys from `main` branch)
- **Backend** → Railway (auto-deploys from `main` branch)

## 📋 Prerequisites

1. **GitHub Repository**: Code must be pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Railway Account**: Sign up at [railway.app](https://railway.app)
4. **Environment Variables**: Configured in both platforms

---

## 🎯 Deployment Steps

### 1. Initial Setup

#### A. Push to GitHub
```bash
cd /Users/rahilbhavan/liquidity-vector-dashboard
git add .
git commit -m "Optimize for deployment"
git push origin main
```

#### B. Connect to Vercel (Frontend)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `lv_dashboard` repository
4. Vercel will auto-detect Vite configuration
5. Configure environment variables (see below)
6. Click "Deploy"

**Environment Variables for Vercel:**
```
VITE_VAULT_ADDRESS=0xYOUR_VAULT_ADDRESS
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PROTOCOL_OWNER=0xYOUR_PROTOCOL_OWNER
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-id
```

#### C. Connect to Railway (Backend)

1. Go to [railway.app/new](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Select `lv_dashboard` repository
4. Railway will auto-detect Python configuration
5. Configure environment variables (see below)
6. Click "Deploy"

**Environment Variables for Railway:**
```
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
KEEPER_PK=0xYOUR_KEEPER_PRIVATE_KEY
VAULT_ADDRESS=0xYOUR_VAULT_ADDRESS
KEEPER_ADDRESS=0xYOUR_KEEPER_ADDRESS
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
MIN_PROFIT_THRESHOLD=0.02
CYCLE_TIME=3600
```

---

## 🔄 Automatic Deployment

Once connected, deployments happen automatically:

### Vercel (Frontend)
- **Trigger**: Push to `main` branch
- **Build Command**: `npm run build`
- **Output**: `dist/`
- **Deploy Time**: ~2 minutes
- **URL**: `https://your-project.vercel.app`

### Railway (Backend)
- **Trigger**: Push to `main` branch
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python scripts/keepers/bot.py`
- **Deploy Time**: ~3-5 minutes
- **Logs**: Available in Railway dashboard

---

## 🔍 Monitoring Deployments

### Vercel Dashboard
- View deployment status
- Check build logs
- Monitor performance metrics
- View preview deployments for PRs

### Railway Dashboard
- View bot logs in real-time
- Monitor resource usage
- Check restart history
- View environment variables

---

## 🐛 Troubleshooting

### Frontend Issues

**Build Fails:**
```bash
# Test locally first
npm run lint
npm run type-check
npm run build
```

**Environment Variables Missing:**
- Check Vercel dashboard → Settings → Environment Variables
- Ensure all `VITE_*` variables are set
- Redeploy after adding variables

**Blank Page:**
- Check browser console for errors
- Verify environment variables are set
- Check Vercel deployment logs

### Backend Issues

**Bot Not Starting:**
```bash
# Test locally first
python scripts/keepers/bot.py
```

**Connection Errors:**
- Verify `RPC_URL` is correct and accessible
- Check `KEEPER_PK` has funds for gas
- Ensure `VAULT_ADDRESS` is deployed

**Rebalances Not Executing:**
- Check Railway logs for errors
- Verify keeper has approval to call vault
- Check gas prices aren't too high
- Verify `MIN_PROFIT_THRESHOLD` is reasonable

---

## 📊 Verification Checklist

After deployment, verify:

### Frontend (Vercel)
- [ ] Site loads at Vercel URL
- [ ] Wallet connection works
- [ ] Charts display data
- [ ] Navigation works
- [ ] No console errors

### Backend (Railway)
- [ ] Bot starts successfully (check logs)
- [ ] Heartbeat updates in Supabase
- [ ] Market data fetches successfully
- [ ] No repeated errors in logs

### Integration
- [ ] Frontend displays data from Supabase
- [ ] APY history updates
- [ ] Rebalance events appear in dashboard
- [ ] Real-time data updates

---

## 🔒 Security Best Practices

1. **Never commit secrets**
   - `.env` files are gitignored
   - Use platform environment variables

2. **Separate wallets**
   - Use different wallet for keeper vs deployer
   - Fund keeper wallet with minimal ETH

3. **Monitor activity**
   - Set up alerts in Railway
   - Monitor Supabase for unusual activity
   - Check logs regularly

4. **Limit permissions**
   - Keeper should only have rebalance permission
   - Use read-only RPC endpoints where possible

---

## 🔄 Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Railway
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Redeploy"

Or via Git:
```bash
git revert HEAD
git push origin main
# Both platforms will auto-deploy the reverted code
```

---

## 📈 Scaling & Performance

### Vercel
- Automatic scaling (serverless)
- CDN caching enabled
- Optimized build output

### Railway
- Vertical scaling available
- Horizontal scaling for multiple bots
- Resource monitoring included

---

## 💰 Cost Estimates

### Vercel
- **Hobby**: Free for personal projects
- **Pro**: $20/month for production apps

### Railway
- **Free**: $5 credits/month (testing)
- **Hobby**: $5/month (recommended)
- **Pro**: $20/month (production)

### Total Monthly Cost
- **Development**: Free (Vercel Hobby + Railway Free)
- **Production**: ~$25-40/month

---

## 📞 Support Resources

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)

---

## 🎉 Success!

Your deployment is complete when:
- ✅ Vercel shows "Ready" status
- ✅ Railway shows "Active" status
- ✅ Frontend loads without errors
- ✅ Bot logs show successful cycles
- ✅ Supabase data is updating

**Next Steps:**
1. Share your Vercel URL with users
2. Monitor Railway logs for the first few cycles
3. Set up custom domain (optional)
4. Configure alerts and monitoring
