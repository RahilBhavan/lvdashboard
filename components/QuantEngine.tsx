import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BrainCircuit, Activity, TrendingUp, AlertTriangle, Terminal, Play, BarChart3, Clock } from 'lucide-react';

// Mock Data for Backtest
const generateBacktestData = () => {
    const data = [];
    let price = 1000;
    let strategy = 1000;

    for (let i = 0; i < 90; i++) {
        const volatility = (Math.random() - 0.5) * 50; // Daily volatility
        const drift = 0.5; // Upward drift

        price = price + volatility + drift;

        // Strategy performs better in crab/bear, slightly worse in strong bull
        let strategyChange = volatility * 0.8 + drift + (Math.abs(volatility) * 0.1);

        if (price < 800) strategyChange += 5; // Hedge kicks in

        strategy = strategy + strategyChange;

        data.push({
            day: i,
            price: price,
            strategy: strategy,
            drawdown: ((strategy - 1000) / 1000) * 100
        });
    }
    return data;
};

const QuantEngine: React.FC = () => {
    const [backtestData] = useState(generateBacktestData());
    const [isSimulating, setIsSimulating] = useState(false);

    const handleRunBacktest = () => {
        setIsSimulating(true);
        setTimeout(() => setIsSimulating(false), 2000);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Sharpe Ratio"
                    value="2.45"
                    subValue="Top 5% of Vaults"
                    trend="up"
                    icon={<Activity className="text-vector-400" />}
                />
                <MetricCard
                    label="Sortino Ratio"
                    value="3.12"
                    subValue="Excellent Downside Prot."
                    trend="up"
                    icon={<BarChart3 className="text-blue-400" />}
                />
                <MetricCard
                    label="Max Drawdown"
                    value="-4.2%"
                    subValue="vs ETH -18.5%"
                    trend="up"
                    icon={<AlertTriangle className="text-yellow-400" />}
                />
                <MetricCard
                    label="Alpha (vs ETH)"
                    value="+12.8%"
                    subValue="Annualized"
                    trend="up"
                    icon={<TrendingUp className="text-green-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Main Backtest Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <BrainCircuit className="text-vector-400" size={20} />
                                VAMER Backtest Performance
                            </h2>
                            <p className="text-sm text-slate-400">Strategy vs. ETH Buy & Hold (90 Days)</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition">1D</button>
                            <button className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition">1W</button>
                            <button className="px-3 py-1.5 text-xs font-medium bg-vector-500/20 text-vector-400 border border-vector-500/30 rounded transition">1M</button>
                            <button className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition">ALL</button>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={backtestData}>
                                <defs>
                                    <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="day" stroke="#475569" tickFormatter={(v) => `D${v}`} />
                                <YAxis stroke="#475569" domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#cbd5e1' }}
                                />
                                <Legend />
                                <Area type="monotone" name="Strategy ($)" dataKey="strategy" stroke="#22c55e" strokeWidth={2} fill="url(#colorStrategy)" />
                                <Area type="monotone" name="ETH Hold ($)" dataKey="price" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Live Feed & Control */}
                <div className="flex flex-col gap-6">
                    {/* Live Signal Terminal */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col h-[300px]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <Terminal size={16} /> Live Inference Log
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-green-500 font-mono">ONLINE</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2 custom-scrollbar">
                            <LogEntry time="14:02:11" type="INFO" msg="Fetching OHLCV data from sub-graph..." />
                            <LogEntry time="14:02:13" type="INFO" msg="GARCH(1,1) vol forecast: 2.84% (High)" />
                            <LogEntry time="14:02:13" type="WARN" msg="Vol spike detected. Wide range mode." />
                            <LogEntry time="14:02:14" type="SUCCESS" msg="Generated Vector: [-8800, 8420]" />
                            <LogEntry time="14:05:00" type="INFO" msg="Trend Model: Neutral (EMA Cross < 0)" />
                            <LogEntry time="14:05:01" type="INFO" msg="Hedge Ratio: 0.0 (Long Only)" />
                            <LogEntry time="14:10:22" type="INFO" msg="Monitoring mempool for arb opps..." />
                        </div>
                    </div>

                    {/* Simulation Control */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col justify-center items-center text-center">
                        <div className="mb-4 p-4 bg-vector-500/10 rounded-full">
                            <Play size={32} className="text-vector-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Run Simulation</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Test current parameters against historical data to verify robustness.
                        </p>
                        <button
                            onClick={handleRunBacktest}
                            disabled={isSimulating}
                            className="w-full py-3 bg-vector-600 hover:bg-vector-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSimulating ? (
                                <>
                                    <Clock className="animate-spin" size={18} /> Running...
                                </>
                            ) : (
                                "Start Backtest"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{ label: string; value: string; subValue: string; trend: 'up' | 'down'; icon: React.ReactNode }> = ({ label, value, subValue, trend, icon }) => (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-start mb-2">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</span>
            {icon}
        </div>
        <div className="flex items-end gap-2 mb-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className={`text-xs font-medium mb-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend === 'up' ? '▲' : '▼'}
            </span>
        </div>
        <span className="text-xs text-slate-500">{subValue}</span>
    </div>
);

const LogEntry: React.FC<{ time: string; type: 'INFO' | 'WARN' | 'SUCCESS'; msg: string }> = ({ time, type, msg }) => {
    const colors = {
        INFO: 'text-blue-400',
        WARN: 'text-yellow-400',
        SUCCESS: 'text-green-400'
    };

    return (
        <div className="flex gap-2">
            <span className="text-slate-600">[{time}]</span>
            <span className={`${colors[type]} font-bold`}>{type}</span>
            <span className="text-slate-300">{msg}</span>
        </div>
    );
};

export default QuantEngine;
