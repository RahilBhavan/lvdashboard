import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const HodlChart: React.FC = () => {
    // Mock Data for "The HODL Line"
    // In production, this would come from an API comparing user's share value vs. initial ETH deposit value
    const data = [
        { day: 0, vault: 1000, eth: 1000 },
        { day: 1, vault: 1010, eth: 1005 },
        { day: 2, vault: 1025, eth: 1015 },
        { day: 3, vault: 1030, eth: 1010 },
        { day: 4, vault: 1045, eth: 1025 },
        { day: 5, vault: 1060, eth: 1040 },
        { day: 6, vault: 1080, eth: 1050 },
        { day: 7, vault: 1100, eth: 1060 },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[400px]">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white">The HODL Line</h2>
                <p className="text-sm text-slate-400">Vault Performance vs. Simply Holding ETH</p>
            </div>

            <ResponsiveContainer width="100%" height="300px">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorVault" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorEth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#475569" tickFormatter={(v) => `D${v}`} />
                    <YAxis stroke="#475569" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="vault"
                        name="Liquidity Vector Vault"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fill="url(#colorVault)"
                    />
                    <Area
                        type="monotone"
                        dataKey="eth"
                        name="ETH HODL"
                        stroke="#64748b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="url(#colorEth)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HodlChart;
