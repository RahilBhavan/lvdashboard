# Liquidity Vector Dashboard - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Your repository pushed to GitHub

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your `liquidity-vector-dashboard` repo
   - Vercel will auto-detect Vite settings

3. **Configure Environment Variables**
   In the Vercel dashboard, add these environment variables:
   
   ```
   VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   VITE_VAULT_ADDRESS=0xYOUR_DEPLOYED_VAULT_ADDRESS
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   VITE_PROTOCOL_OWNER=0x0C5209956b03C240B0CFdc4Ea0D323a8B82d8cfd
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Get your live URL: `https://liquidity-vector-dashboard.vercel.app`

### Option 2: Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/rahilbhavan/liquidity-vector-dashboard
   vercel
   ```

4. **Follow Prompts**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **liquidity-vector-dashboard**
   - Directory? **./
   - Override settings? **No**

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_RPC_URL
   vercel env add VITE_VAULT_ADDRESS
   vercel env add VITE_WALLETCONNECT_PROJECT_ID
   vercel env add VITE_PROTOCOL_OWNER
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration Files

### vercel.json
Already created with:
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing (all routes → index.html)
- Asset caching (1 year for static assets)

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_RPC_URL` | Ethereum RPC endpoint | `https://eth-sepolia.g.alchemy.com/v2/...` |
| `VITE_VAULT_ADDRESS` | Deployed CoreVault address | `0x1234...` |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Get from cloud.walletconnect.com |
| `VITE_PROTOCOL_OWNER` | Admin panel owner address | `0x0C52...` |

## 📋 Pre-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Contract addresses updated for target network
- [ ] Build tested locally (`npm run build && npm run preview`)
- [ ] No console errors in production build
- [ ] Wallet connection tested on target network

## 🔄 Continuous Deployment

Once set up, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for PRs
- Run build checks before deploying
- Provide deployment URLs for each commit

## 🌐 Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. SSL certificate auto-provisioned

## 📊 Post-Deployment

After deployment, verify:
1. **Functionality**: Wallet connects, charts load, navigation works
2. **Performance**: Run Lighthouse audit (target >90)
3. **Mobile**: Test on actual mobile devices
4. **Networks**: Test on correct blockchain network

## 🐛 Troubleshooting

**Build fails:**
- Check environment variables are set
- Verify `npm run build` works locally
- Check Vercel build logs

**Wallet won't connect:**
- Verify `VITE_WALLETCONNECT_PROJECT_ID` is set
- Check network configuration
- Ensure RPC URL is correct

**Blank page:**
- Check browser console for errors
- Verify all environment variables are set
- Check Vercel function logs

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Project Issues: Create issue in your GitHub repo

---

**Your Vercel URL will be:**
`https://liquidity-vector-dashboard-[your-username].vercel.app`

**Deployment time:** ~2 minutes
**Auto-deploy:** On every git push
**Preview URLs:** On every PR
