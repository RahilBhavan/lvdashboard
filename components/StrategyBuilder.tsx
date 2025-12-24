import React, { useState, useMemo } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { CORE_VAULT_ABI } from '../abis';
import { BrainCircuit, Play, Zap, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartDataPoint } from '../types';

// Simple mock VAMR simulation logic
const simulateVAMR = (currentPrice: number, volatility: number) => {
    // VAMR logic: Band width ~ 2 * sigma
    const bandWidth = currentPrice * (volatility * 2);
    const upper = currentPrice + bandWidth;
    const lower = Math.max(0, currentPrice - bandWidth);

    // Convert to mock ticks (roughly)
    const tickLower = Math.floor(lower);
    const tickUpper = Math.floor(upper);

    return { lower, upper, tickLower, tickUpper };
};

const StrategyBuilder: React.FC = () => {
    const { isConnected } = useAccount();
    const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS as `0x${string}`;
    const { writeContractAsync: rebalanceAsync } = useWriteContract();

    // State for inputs
    const [selectedAsset, setSelectedAsset] = useState('ETH');
    const [timeWindow, setTimeWindow] = useState('7d');
    const [modelType, setModelType] = useState('VAMR');

    // Simulation State
    const [simulationResult, setSimulationResult] = useState<{
        lower: number;
        upper: number;
        tickLower: number;
        tickUpper: number;
        apy_est: number;
    } | null>(null);

    // Initial mock data generated lazily to avoid impure render or effect issues
    const [chartData] = useState<ChartDataPoint[]>(() => {
        const data = [];
        let price = 1800;
        for (let i = 0; i < 30; i++) {
            price = price * (1 + (Math.random() - 0.5) * 0.05);
            data.push({
                day: i,
                price,
                upper: price * 1.1,
                lower: price * 0.9,
                volatility: 0.05
            });
        }
        return data;
    });

    const currentPrice = useMemo(() => {
        return chartData.length > 0 ? chartData[chartData.length - 1].price : 1800;
    }, [chartData]);

    const handleSimulate = () => {
        // Mock simulation call
        const volatility = 0.05; // 5% mock IV
        const result = simulateVAMR(currentPrice, volatility);
        setSimulationResult({
            ...result,
            apy_est: 12.5 + (Math.random() * 5) // Mock APY betwen 12.5% and 17.5%
        });
    };

    const handleExecute = async () => {
        if (!simulationResult) return;
        try {
            // Mock ZK Proof (empty bytes or dummy data for now)
            const mockProof = "0x00";

            await rebalanceAsync({
                address: VAULT_ADDRESS,
                abi: CORE_VAULT_ABI,
                functionName: 'rebalance',
                // Matches new ABI: [zkProof, tickLower, tickUpper]
                args: [mockProof as `0x${string}`, Number(simulationResult.tickLower), Number(simulationResult.tickUpper)]
            });
            alert("Vector executed successfully!");
        } catch (e) {
            console.error(e);
            alert("Execution failed.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BrainCircuit className="text-vector-500" />
                    Strategy Builder
                </h1>
                <p className="text-slate-400 mt-1">
                    Design, simulate, and execute algorithmic liquidity strategies.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-vector-400" />
                            Parameters
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Asset Pair</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-vector-500 outline-none"
                                    value={selectedAsset}
                                    onChange={(e) => setSelectedAsset(e.target.value)}
                                >
                                    <option value="ETH">ETH / USDC</option>
                                    <option value="BTC">BTC / USDC</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Lookback Window</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['24h', '7d', '30d'].map(w => (
                                        <button
                                            key={w}
                                            onClick={() => setTimeWindow(w)}
                                            className={`py-2 rounded-lg text-sm font-medium transition-colors ${timeWindow === w
                                                    ? 'bg-vector-500/20 text-vector-400 border border-vector-500/50'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Model Type</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-vector-500 outline-none"
                                    value={modelType}
                                    onChange={(e) => setModelType(e.target.value)}
                                >
                                    <option value="VAMR">VAMR (Mean Reversion)</option>
                                    <option value="TREND">Trend Follower (Momentum)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSimulate}
                            className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-vector-500/50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group"
                        >
                            <Play size={18} className="text-vector-400" />
                            Run Simulation
                        </button>
                    </div>

                    {/* Simulation Output Card */}
                    {simulationResult && (
                        <div className="bg-slate-900 border border-vector-500/30 rounded-xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                            <div className="absolute top-0 right-0 p-20 bg-vector-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <h3 className="text-sm font-bold text-vector-400 uppercase tracking-wider mb-4">Vector Generated</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Tick Range</span>
                                    <span className="font-mono text-white font-bold">
                                        [{simulationResult.tickLower}, {simulationResult.tickUpper}]
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Est. APY</span>
                                    <span className="font-mono text-green-400 font-bold">
                                        {simulationResult.apy_est.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleExecute}
                                disabled={!isConnected}
                                className="w-full mt-6 py-3 bg-vector-600 hover:bg-vector-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Zap size={18} />
                                {isConnected ? 'Execute Vector' : 'Connect Wallet'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel: Visualization */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 h-[500px] flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-vector-400" />
                        Backtest / Projection
                    </h3>

                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="day" stroke="#475569" hide />
                                <YAxis domain={['auto', 'auto']} stroke="#475569" orientation="right" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPrice)" />

                                {simulationResult && (
                                    <>
                                        <ReferenceLine y={simulationResult.upper} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Upper', fill: '#22c55e', fontSize: 12 }} />
                                        <ReferenceLine y={simulationResult.lower} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Lower', fill: '#22c55e', fontSize: 12 }} />
                                    </>
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {!simulationResult && (
                        <div className="text-center text-slate-500 text-sm mt-4">
                            Run simulation to view projected bands.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StrategyBuilder;
