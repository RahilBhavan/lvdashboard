# Real-World Data Integration Setup

This guide will help you connect your Liquidity Vector Dashboard to real-world data sources.

## Prerequisites

- A Supabase account (free tier works fine)
- Access to an Ethereum RPC endpoint (Alchemy, Infura, etc.)
- Deployed vault contract on Sepolia testnet

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details and wait for it to initialize

### 1.2 Run the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Open the file `supabase_schema.sql` from this repository
3. Copy and paste the entire contents into the SQL Editor
4. Click "Run" to create all tables and policies

### 1.3 Get Your API Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`, keep this secret!)

## Step 2: Configure Environment Variables

### 2.1 Update `.env` File

Open your `.env` file and add the Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Frontend Environment Variables
VITE_VAULT_ADDRESS=0xYourDeployedVaultAddress
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 2.2 Update Vault Address

Make sure `VAULT_ADDRESS` and `VITE_VAULT_ADDRESS` point to your deployed vault contract.

## Step 3: Install Python Dependencies

The bot needs the Supabase Python client:

```bash
pip install supabase
```

Or if using the requirements file:

```bash
pip install -r requirements.txt
```

## Step 4: Test the Integration

### 4.1 Test the Bot (Optional)

Run the bot once to verify it can connect to Supabase:

```bash
python scripts/keepers/bot.py
```

You should see:
- "Connected to Supabase for monitoring."
- "Fetching market data from CoinGecko..."
- "Price history cached in Supabase"

Check your Supabase dashboard → Table Editor → `price_history` to verify data was written.

### 4.2 Test the Frontend

Start the development server:

```bash
npm run dev
```

Open the dashboard in your browser. You should see:
- Real ETH prices in the charts
- Live TVL from the blockchain
- Historical data (once the bot has run a few times)

## Step 5: Verify Data Flow

### Check Supabase Tables

In your Supabase dashboard, verify these tables have data:

1. **price_history** - Should populate immediately when bot runs
2. **bot_heartbeats** - Updates every hour while bot is running
3. **apy_history** - Populates after each rebalance
4. **rebalance_events** - Populates when rebalances occur

### Monitor the Dashboard

The dashboard will now show:
- ✅ Real ETH prices from CoinGecko
- ✅ Live TVL from your vault contract
- ✅ Historical APY from Supabase
- ✅ Recent rebalance events
- ✅ Actual volatility calculations

## Troubleshooting

### "Supabase not configured" Warning

- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after changing `.env` files
- Vite only loads env vars that start with `VITE_`

### No Data in Charts

- Run the bot at least once to populate price history
- Check browser console for API errors
- Verify Supabase RLS policies allow public read access

### Bot Errors

- Ensure `SUPABASE_SERVICE_KEY` is set (not the anon key)
- Check that all tables were created successfully
- Verify RPC_URL is working and has credits

### CoinGecko Rate Limits

- Free tier: 10-50 calls/minute
- Bot fetches data once per hour by default
- Consider caching or using a Pro API key for production

## Optional: CoinGecko Pro

For higher rate limits and more reliable data:

1. Sign up at [https://www.coingecko.com/en/api](https://www.coingecko.com/en/api)
2. Get your API key
3. Add to `.env`:
   ```env
   COINGECKO_API_KEY=your-pro-api-key
   ```
4. Update `api/realDataClient.ts` to include the API key in requests

## Next Steps

- Set up the bot as a background service (systemd, PM2, etc.)
- Configure monitoring alerts for bot failures
- Implement additional metrics and analytics
- Add more data sources (The Graph, Chainlink, etc.)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check bot logs for connection issues
3. Verify all environment variables are set correctly
4. Ensure Supabase tables were created successfully
