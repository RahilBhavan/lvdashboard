import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAccount } from 'wagmi';

// New Design System Components
import HeroSection from './HeroSection';
import StatCard from './StatCard';
import ChartContainer from './ChartContainer';
import { StatCardSkeleton, ChartSkeleton, Spinner } from './LoadingStates';

// Existing Components
import RiskExplainer from './RiskExplainer';
import SimulationModal from './SimulationModal';
import DepositModal from './DepositModal';
import { ToastContainer, ToastMessage } from './Toast';
import HodlChart from './HodlChart';
import StanceIndicator from './StanceIndicator';

// Icons
import { TrendingUp, ShieldCheck, Zap, Lock, Activity, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { data: dashboardData, isLoading, refetch, userShareBalance, vaultAddress } = useDashboardData();
    const [, _setSimulationStep] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [activeChart, setActiveChart] = useState<'GARCH' | 'HODL'>('GARCH');
    const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
    const [showRiskDetails, setShowRiskDetails] = useState(false);

    const { isConnected } = useAccount();

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
        refetch();
        addToast('success', 'Rebalance Executed', 'Strategy parameters updated successfully on-chain.');
    };

    // Loading State
    if (isLoading || !dashboardData) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="card-glass p-8 h-64">
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <Spinner size="lg" />
                            <p className="text-slate-400">Loading Protocol Data...</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
                <ChartSkeleton />
            </div>
        );
    }

    const { stats, metrics, chartData } = dashboardData;
    const currentPrice = chartData[chartData.length - 1].price;

    // Calculate portfolio value (mock calculation)
    const portfolioValue = isConnected ? Number(userShareBalance) * 1000 : 0;
    const change24h = stats.tvl.change24h;

    const timeRanges = [
        { label: '1D', value: '1D' },
        { label: '1W', value: '1W' },
        { label: '1M', value: '1M' },
        { label: 'ALL', value: 'ALL' },
    ];

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <HeroSection
                portfolioValue={portfolioValue}
                change24h={change24h}
                apy={stats.apy.value}
                healthFactor={stats.healthFactor.value}
                userShareBalance={userShareBalance}
                isConnected={isConnected}
                onDepositClick={() => setIsDepositOpen(true)}
            />

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-bottom">
                <StatCard
                    label="Total Value Locked"
                    value={`$${stats.tvl.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                    change={{ value: stats.tvl.change24h, period: '24h' }}
                    trend={stats.tvl.change24h >= 0 ? 'up' : 'down'}
                    icon={<Lock className="text-vector-400" size={20} />}
                    tooltip="Total value locked in the protocol"
                />
                <StatCard
                    label="Current APY"
                    value={`${stats.apy.value.toFixed(2)}%`}
                    icon={<TrendingUp className="text-vector-400" size={20} />}
                    tooltip="Annual Percentage Yield - Strict Net-Positive"
                />
                <StatCard
                    label="Health Factor"
                    value={`${stats.healthFactor.value}%`}
                    icon={<ShieldCheck className="text-vector-400" size={20} />}
                    tooltip="Protocol health and safety rating"
                />
                <StatCard
                    label="Active Range"
                    value={`${stats.range.lower} - ${stats.range.upper}`}
                    icon={<Zap className="text-vector-400" size={20} />}
                    tooltip={`Tick range: ${stats.range.tickLower} - ${stats.range.tickUpper}`}
                    variant="compact"
                />
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2">
                    <ChartContainer
                        title={activeChart === 'GARCH' ? 'GARCH Volatility Forecast' : 'The HODL Line'}
                        description={activeChart === 'GARCH' ? 'Predicted price bands based on GARCH(1,1) model' : 'Strategy performance vs. Buy & Hold'}
                        timeRanges={timeRanges}
                        selectedTimeRange={selectedTimeRange}
                        onTimeRangeChange={setSelectedTimeRange}
                        actions={
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveChart('GARCH')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${activeChart === 'GARCH'
                                        ? 'bg-vector-500/20 text-vector-400 border border-vector-500/30'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    GARCH
                                </button>
                                <button
                                    onClick={() => setActiveChart('HODL')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${activeChart === 'HODL'
                                        ? 'bg-vector-500/20 text-vector-400 border border-vector-500/30'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    HODL
                                </button>
                            </div>
                        }
                    >
                        {activeChart === 'GARCH' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        {/* 95% Confidence Band - Subtle Purple */}
                                        <linearGradient id="confidence95" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.12} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                                        </linearGradient>
                                        {/* 68% Confidence Band - Brighter Purple */}
                                        <linearGradient id="confidence68" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.18} />
                                            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.04} />
                                        </linearGradient>
                                        {/* Price Line Gradient - Vibrant Cyan */}
                                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
                                        </linearGradient>
                                        {/* Glow effect for price line */}
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />

                                    <XAxis
                                        dataKey="day"
                                        stroke="#64748b"
                                        tickFormatter={(v) => `T+${v}`}
                                        style={{ fontSize: '12px', fontWeight: 500 }}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        stroke="#64748b"
                                        tickFormatter={(v) => `$${v}`}
                                        style={{ fontSize: '12px', fontWeight: 500 }}
                                    />

                                    {/* Custom Rich Tooltip */}
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                const volatility = ((data.upper - data.lower) / data.price * 100).toFixed(2);
                                                const trend = data.price > (chartData[Math.max(0, data.day - 1)]?.price || data.price) ? '↑' : '↓';

                                                return (
                                                    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
                                                        <div className="text-xs font-semibold text-slate-400 mb-2">Day T+{data.day}</div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-xs text-slate-400">Price:</span>
                                                                <span className="text-sm font-bold text-cyan-400 flex items-center gap-1">
                                                                    ${data.price.toFixed(2)} <span className="text-xs">{trend}</span>
                                                                </span>
                                                            </div>
                                                            <div className="h-px bg-slate-800 my-1" />
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-xs text-slate-400">95% Range:</span>
                                                                <span className="text-xs font-mono text-purple-300">
                                                                    ${data.lower.toFixed(0)} - ${data.upper.toFixed(0)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-xs text-slate-400">Volatility:</span>
                                                                <span className="text-xs font-bold text-purple-400">{volatility}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />

                                    {/* 95% Confidence Band (Outer) */}
                                    <Area
                                        type="monotone"
                                        dataKey="upper"
                                        stroke="#8b5cf6"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        fill="url(#confidence95)"
                                        name="95% Upper"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="lower"
                                        stroke="#8b5cf6"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        fill="transparent"
                                        name="95% Lower"
                                    />

                                    {/* Main Price Forecast Line */}
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#06b6d4"
                                        strokeWidth={3}
                                        fill="url(#priceGradient)"
                                        name="Forecast"
                                        filter="url(#glow)"
                                        dot={{ fill: '#06b6d4', strokeWidth: 2, r: 0 }}
                                        activeDot={{ r: 6, fill: '#06b6d4', stroke: '#0e7490', strokeWidth: 2 }}
                                    />

                                    {/* Current Price Reference Line with Animation */}
                                    <ReferenceLine
                                        y={currentPrice}
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        strokeDasharray="5 3"
                                        label={{
                                            position: 'right',
                                            value: `Current: $${currentPrice.toFixed(0)}`,
                                            fill: '#ef4444',
                                            fontSize: 11,
                                            fontWeight: 600,
                                            offset: 10
                                        }}
                                    >
                                        <circle cx="0" cy="0" r="4" fill="#ef4444">
                                            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                                        </circle>
                                    </ReferenceLine>
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <HodlChart />
                        )}
                    </ChartContainer>
                </div>

                {/* Side Panel */}
                <div className="flex flex-col gap-6">
                    {/* Stance Indicator */}
                    <StanceIndicator stance="NEUTRAL" score={55} />

                    {/* Vector Parameters */}
                    <div className="card flex flex-col gap-4 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Vector Parameters</h3>
                            <div className="badge badge-success">
                                <Activity size={12} />
                                ONLINE
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Last Update</span>
                                <span className="font-mono font-medium text-white">{metrics.lastUpdate}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Next Rebalance</span>
                                <span className="font-mono font-medium text-white flex items-center gap-1">
                                    <Clock size={14} />
                                    {metrics.nextRebalance}
                                </span>
                            </div>
                            <div className="h-px bg-slate-800 my-2" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Predicted Vol (σ)</span>
                                <span className="font-mono font-medium text-white">{metrics.volatility.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Skew</span>
                                <span className="font-mono font-medium text-white">{metrics.skew.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Kurtosis</span>
                                <span className="font-mono font-medium text-white">{metrics.kurtosis.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSimulate}
                            className="btn btn-secondary w-full mt-auto"
                        >
                            Simulate Rebalance
                        </button>
                    </div>
                </div>
            </div>

            {/* Risk Analysis - Collapsible */}
            <div className="animate-slide-in-bottom">
                <button
                    onClick={() => setShowRiskDetails(!showRiskDetails)}
                    className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors mb-4"
                >
                    <span className="text-lg font-bold text-white">Risk Engine Analysis</span>
                    <span className={`text-slate-400 transition-transform ${showRiskDetails ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>
                {showRiskDetails && (
                    <div className="animate-scale-in">
                        <RiskExplainer />
                    </div>
                )}
            </div>

            {/* Modals */}
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
        </div>
    );
};

export default Dashboard;
