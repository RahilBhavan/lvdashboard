import { DashboardData } from '../types';
import { generateChartData } from '../constants';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDashboardData = async (): Promise<DashboardData> => {
    // Simulate network latency
    await sleep(800);

    const chartData = generateChartData();
    const currentVol = chartData[chartData.length - 1].volatility;

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
        chartData
    };
};
