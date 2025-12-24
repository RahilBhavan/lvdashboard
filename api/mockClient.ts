import { DashboardData, StanceData } from '../types';
import { generateChartData } from '../constants';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate EMA (Exponential Moving Average)
 */
const calculateEMA = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const emaArray: number[] = [];

    // Start with SMA for first value
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    emaArray.push(ema);

    // Calculate EMA for remaining values
    for (let i = period; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
        emaArray.push(ema);
    }

    return emaArray;
};

/**
 * Calculate stance based on trend analysis and volatility
 */
const calculateStance = (chartData: Array<{ day: number; price: number; upper: number; lower: number; volatility: number }>): StanceData => {
    // Extract price history
    const prices = chartData.map(d => d.price);

    if (prices.length < 25) {
        // Insufficient data, return neutral
        return {
            stance: 'NEUTRAL',
            score: 50,
            hedgeRatio: 0.5,
            trendStrength: 0
        };
    }

    // Calculate EMAs
    const ema12 = calculateEMA(prices, 12);
    const ema24 = calculateEMA(prices, 24);

    // Get latest values
    const lastEma12 = ema12[ema12.length - 1];
    const lastEma24 = ema24[ema24.length - 1];

    // Calculate trend strength (-1 to 1)
    const spread = (lastEma12 - lastEma24) / lastEma24;
    const trendStrength = Math.max(-1, Math.min(1, spread * 20)); // Normalize to [-1, 1]

    // Determine hedge ratio
    const hedgeRatio = lastEma12 < lastEma24 ? 1.0 : 0.0;

    // Get current volatility
    const currentVol = chartData[chartData.length - 1].volatility;

    // Calculate V-Score (0-100)
    let score = 50; // Base neutral score

    // Trend component: ±30 points
    score += trendStrength * 30;

    // Volatility component: ±20 points (higher vol = more extreme)
    const volImpact = (currentVol - 2) / 6; // Normalize around 2% baseline
    score += Math.abs(trendStrength) * volImpact * 20;

    // Clamp to [0, 100]
    score = Math.max(0, Math.min(100, score));

    // Determine stance
    let stance: 'BEARISH' | 'NEUTRAL' | 'BULLISH';
    if (score < 35) {
        stance = 'BEARISH';
    } else if (score > 65) {
        stance = 'BULLISH';
    } else {
        stance = 'NEUTRAL';
    }

    return {
        stance,
        score: Math.round(score),
        hedgeRatio,
        trendStrength: Number(trendStrength.toFixed(3))
    };
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
    // Simulate network latency
    await sleep(800);

    const chartData = generateChartData();
    const currentVol = chartData[chartData.length - 1].volatility;

    // Calculate stance dynamically
    const stance = calculateStance(chartData);

    // Random Walk for metrics
    const tvl = 4231890 + (Math.random() * 50000 - 25000);
    const apy = 18.42 + (Math.random() * 0.5 - 0.25);

    return {
        stats: {
            tvl: {
                value: tvl,
                change24h: 2.4 + (Math.random() * 0.5)
            },
            apy: {
                value: apy,
                label: 'Delta Neutral Strategy'
            },
            healthFactor: {
                value: 99.8,
                status: 'Within Range'
            },
            range: {
                lower: 1750,
                upper: 1920,
                tickLower: 204000,
                tickUpper: 208000
            }
        },
        metrics: {
            volatility: currentVol,
            skew: 0.12,
            kurtosis: 3.45,
            lastUpdate: 'Just now',
            nextRebalance: '~4 hrs'
        },
        chartData,
        stance
    };
};
