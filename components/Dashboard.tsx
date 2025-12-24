import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';
import RiskExplainer from './RiskExplainer';
import SimulationModal from './SimulationModal';
import DepositModal from './DepositModal';
import { ToastContainer, ToastMessage } from './Toast';
import { TrendingUp, ShieldCheck, Zap, Lock, Wallet } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import HodlChart from './HodlChart';
import StanceIndicator from './StanceIndicator';

const Dashboard: React.FC = () => {
    const { data: dashboardData, isLoading, refetch, userShareBalance, vaultAddress } = useDashboardData();
    const [, _setSimulationStep] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Toggle for Charts
    const [activeChart, setActiveChart] = useState<'GARCH' | 'HODL'>('GARCH');

    const { isConnected } = useAccount();
    const { connect } = useConnect();

    const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, title, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleSimulate = () => {
        setIsModalOpen(true);
    };

    const executeRebalance = () => {
        setIsModalOpen(false);
        _setSimulationStep(prev => prev + 1);
        refetch(); // Optimistic update
        addToast('success', 'Rebalance Executed', 'Strategy parameters updated successfully on-chain.');
    };

    if (isLoading || !dashboardData) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-vector-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 animate-pulse">Loading Protocol Data...</p>
                </div>
            </div>
        );
    }

    const { stats, metrics, chartData } = dashboardData;
    const currentPrice = chartData[chartData.length - 1].price;

    return (
        <div className="space-y-6">
            {/* Header / Wallet Connection */}
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-vector-500/10 rounded-lg">
                        <Wallet className="text-vector-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Your Position</h3>
                        <p className="text-sm text-slate-400">
                            {isConnected ? `${Number(userShareBalance).toFixed(4)} Shares` : 'Connect Wallet to view'}
                        </p>
                    </div>
                </div>
                <div>
                    {!isConnected ? (
                        <button
                            onClick={() => connect({ connector: injected() })}
                            className="px-6 py-2 bg-vector-500 hover:bg-vector-400 text-slate-900 font-bold rounded-lg transition-colors"
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsDepositOpen(true)}
                            className="px-6 py-2 bg-vector-500 hover:bg-vector-400 text-slate-900 font-bold rounded-lg transition-colors"
                        >
                            Deposit
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Value Locked"
                    value={`$${stats.tvl.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                    subValue={`+${stats.tvl.change24h.toFixed(1)}% (24h)`}
                    icon={<Lock className="text-vector-400" />}
                />
                <StatCard
                    label="Current APY"
                    value={`${stats.apy.value.toFixed(2)}%`}
                    subValue={stats.apy.label}
                    icon={<TrendingUp className="text-vector-400" />}
                />
                <StatCard
                    label="Health Factor"
                    value={`${stats.healthFactor.value}%`}
                    subValue={stats.healthFactor.status}
                    icon={<ShieldCheck className="text-vector-400" />}
                />
                <StatCard
                    label="Active Range"
                    value={`${stats.range.lower} - ${stats.range.upper}`}
                    subValue={`Ticks: ${stats.range.tickLower} - ${stats.range.tickUpper}`}
                    icon={<Zap className="text-vector-400" />}
                />
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveChart('GARCH')}
                                className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeChart === 'GARCH' ? 'text-white border-vector-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                            >
                                GARCH Volatility
                            </button>
                            <button
                                onClick={() => setActiveChart('HODL')}
                                className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeChart === 'HODL' ? 'text-white border-vector-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                            >
                                The HODL Line
                            </button>
                        </div>
                        <button
                            onClick={handleSimulate}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-vector-400 text-sm font-medium rounded-lg border border-slate-700 transition-all active:scale-95"
                        >
                            Simulate Rebalance
                        </button>
                    </div>

                    <div className="h-[400px] w-full">
                        {activeChart === 'GARCH' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="day" stroke="#475569" tickFormatter={(v) => `T+${v}`} />
                                    <YAxis domain={['auto', 'auto']} stroke="#475569" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#cbd5e1' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="upper"
                                        stroke="transparent"
                                        fill="#22c55e"
                                        fillOpacity={0.05}
                                        stackId="1"
                                    />
                                    <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fill="url(#colorBand)" />
                                    <Area type="monotone" dataKey="upper" stroke="#86efac" strokeDasharray="5 5" fill="transparent" />
                                    <Area type="monotone" dataKey="lower" stroke="#86efac" strokeDasharray="5 5" fill="transparent" />

                                    <ReferenceLine y={currentPrice} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Current', fill: '#ef4444', fontSize: 12 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <HodlChart />
                        )}
                    </div>
                </div>

                {/* Side Panel: Vector Info & Stance */}
                <div className="flex flex-col gap-6">
                    <StanceIndicator stance={dashboardData.stance.stance} score={dashboardData.stance.score} />

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">Vector Parameters</h3>

                        <div className="space-y-4">
                            <InfoRow label="Model Status" value="Online" valueColor="text-vector-400" />
                            <InfoRow label="Last Update" value={metrics.lastUpdate} />
                            <InfoRow label="Next Rebalance" value={metrics.nextRebalance} />
                            <div className="h-px bg-slate-800 my-2" />
                            <InfoRow label="Predicted Vol (σ)" value={`${metrics.volatility.toFixed(2)}%`} />
                            <InfoRow label="Skew" value={metrics.skew.toFixed(2)} />
                            <InfoRow label="Kurtosis" value={metrics.kurtosis.toFixed(2)} />
                        </div>

                        <div className="mt-auto p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Simulation Log</h4>
                            <div className="font-mono text-xs text-slate-500 space-y-1">
                                <p>{'>'} Fetching Uniswap pool data...</p>
                                <p>{'>'} Calculating Log Returns...</p>
                                <p>{'>'} Fitting GARCH(1,1)...</p>
                                <p className="text-vector-400">{`> Vector Generated: [${stats.range.tickLower}, ${stats.range.tickUpper}]`}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Engine Analysis */}
            <div className="col-span-1 lg:col-span-3">
                <RiskExplainer />
            </div>

            <SimulationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={executeRebalance}
            />

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                vaultAddress={vaultAddress as `0x${string}`}
            />

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div >
    );
};

const StatCard: React.FC<{ label: string; value: string; subValue: string; icon: React.ReactNode }> = ({ label, value, subValue, icon }) => (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-vector-500/30 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-slate-400 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
            </div>
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                {icon}
            </div>
        </div>
        <p className="text-sm text-vector-400">{subValue}</p>
    </div>
);

const InfoRow: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor = 'text-white' }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={`font-mono font-medium ${valueColor}`}>{value}</span>
    </div>
);

export default Dashboard;
