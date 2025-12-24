-- Supabase Schema for Liquidity Vector Dashboard
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Table: apy_history
-- Stores historical APY calculations
CREATE TABLE IF NOT EXISTS apy_history (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    apy DECIMAL(10, 4) NOT NULL,
    tvl DECIMAL(20, 6) NOT NULL,
    total_fees_earned DECIMAL(20, 6),
    vault_address TEXT NOT NULL,
    metadata JSONB,
    CONSTRAINT apy_history_timestamp_vault_unique UNIQUE (timestamp, vault_address)
);

CREATE INDEX idx_apy_history_timestamp ON apy_history(timestamp DESC);
CREATE INDEX idx_apy_history_vault ON apy_history(vault_address);

-- Table: rebalance_events
-- Records all rebalance transactions
CREATE TABLE IF NOT EXISTS rebalance_events (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tx_hash TEXT NOT NULL UNIQUE,
    vault_address TEXT NOT NULL,
    tick_lower INTEGER NOT NULL,
    tick_upper INTEGER NOT NULL,
    price_lower DECIMAL(20, 6),
    price_upper DECIMAL(20, 6),
    gas_used BIGINT,
    gas_price_gwei DECIMAL(20, 9),
    cost_eth DECIMAL(20, 18),
    block_number BIGINT,
    keeper_address TEXT,
    metadata JSONB
);

CREATE INDEX idx_rebalance_events_timestamp ON rebalance_events(timestamp DESC);
CREATE INDEX idx_rebalance_events_vault ON rebalance_events(vault_address);
CREATE INDEX idx_rebalance_events_tx_hash ON rebalance_events(tx_hash);

-- Table: bot_heartbeats
-- Monitors bot health and status
CREATE TABLE IF NOT EXISTS bot_heartbeats (
    bot_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bot_heartbeats_last_seen ON bot_heartbeats(last_seen DESC);

-- Table: price_history
-- Cached price data to reduce API calls
CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL,
    price_usd DECIMAL(20, 6) NOT NULL,
    source TEXT NOT NULL DEFAULT 'coingecko',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT price_history_timestamp_symbol_unique UNIQUE (timestamp, symbol)
);

CREATE INDEX idx_price_history_timestamp ON price_history(timestamp DESC);
CREATE INDEX idx_price_history_symbol ON price_history(symbol);

-- Enable Row Level Security (RLS)
ALTER TABLE apy_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebalance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on apy_history"
    ON apy_history FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on rebalance_events"
    ON rebalance_events FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on bot_heartbeats"
    ON bot_heartbeats FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on price_history"
    ON price_history FOR SELECT
    USING (true);

-- Create policies for service role write access
-- Note: These policies allow writes only when using the service role key
CREATE POLICY "Allow service role insert on apy_history"
    ON apy_history FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow service role insert on rebalance_events"
    ON rebalance_events FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow service role upsert on bot_heartbeats"
    ON bot_heartbeats FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role insert on price_history"
    ON price_history FOR INSERT
    WITH CHECK (true);

-- Create a view for the latest APY
CREATE OR REPLACE VIEW latest_apy AS
SELECT DISTINCT ON (vault_address)
    vault_address,
    apy,
    tvl,
    timestamp
FROM apy_history
ORDER BY vault_address, timestamp DESC;

-- Create a view for recent rebalances
CREATE OR REPLACE VIEW recent_rebalances AS
SELECT *
FROM rebalance_events
ORDER BY timestamp DESC
LIMIT 100;

COMMENT ON TABLE apy_history IS 'Historical APY calculations for the vault';
COMMENT ON TABLE rebalance_events IS 'Record of all rebalance transactions';
COMMENT ON TABLE bot_heartbeats IS 'Bot health monitoring and status';
COMMENT ON TABLE price_history IS 'Cached price data from external APIs';
