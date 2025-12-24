import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Historical data features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Type definitions for Supabase tables
export interface ApyHistory {
    id: number;
    timestamp: string;
    apy: number;
    tvl: number;
    total_fees_earned?: number;
    vault_address: string;
    metadata?: Record<string, unknown>;
}

export interface RebalanceEvent {
    id: number;
    timestamp: string;
    tx_hash: string;
    vault_address: string;
    tick_lower: number;
    tick_upper: number;
    price_lower?: number;
    price_upper?: number;
    gas_used?: number;
    gas_price_gwei?: number;
    cost_eth?: number;
    block_number?: number;
    keeper_address?: string;
    metadata?: Record<string, unknown>;
}

export interface BotHeartbeat {
    bot_id: string;
    status: string;
    last_seen: string;
    metadata?: Record<string, unknown>;
    updated_at: string;
}

export interface PriceHistory {
    id: number;
    timestamp: string;
    symbol: string;
    price_usd: number;
    source: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}
