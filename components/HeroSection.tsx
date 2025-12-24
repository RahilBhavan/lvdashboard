import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

/**
 * Hero Section Component
 * Displays portfolio overview and primary call-to-action
 */

export interface HeroSectionProps {
    portfolioValue: number;
    change24h: number;
    apy: number;
    healthFactor: number;
    userShareBalance: string;
    isConnected: boolean;
    onDepositClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    portfolioValue,
    change24h,
    apy,
    healthFactor,
    userShareBalance,
    isConnected,
    onDepositClick,
}) => {
    const { connect } = useConnect();
    const isPositiveChange = change24h >= 0;

    return (
        <div className="card-glass p-8 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side: Portfolio Value */}
                <div>
                    {isConnected ? (
                        <>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-vector-500/10 rounded-lg">
                                    <Wallet className="text-vector-400" size={24} />
                                </div>
                                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                    Your Portfolio
                                </span>
                            </div>

                            <div className="mb-4">
                                <h1 className="text-hero text-mono mb-2">
                                    ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h1>

                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center gap-2 ${isPositiveChange ? 'text-vector-400' : 'text-red-400'}`}>
                                        {isPositiveChange ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        <span className="text-xl font-bold">
                                            {isPositiveChange ? '+' : ''}{change24h.toFixed(2)}%
                                        </span>
                                        <span className="text-sm text-slate-400">(24h)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <span className="text-slate-400">Shares:</span>
                                    <span className="ml-2 font-mono font-semibold text-white">
                                        {Number(userShareBalance).toFixed(4)}
                                    </span>
                                </div>
                                <div className="h-4 w-px bg-slate-700" />
                                <div>
                                    <span className="text-slate-400">APY:</span>
                                    <span className="ml-2 font-semibold text-vector-400">
                                        {apy.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="h-4 w-px bg-slate-700" />
                                <div>
                                    <span className="text-slate-400">Health:</span>
                                    <span className="ml-2 font-semibold text-vector-400">
                                        {healthFactor}%
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <Wallet className="text-slate-500" size={24} />
                                </div>
                                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                    Connect Your Wallet
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold text-white mb-3">
                                Start Earning with Liquidity Vector
                            </h1>

                            <p className="text-lg text-slate-300 mb-6 max-w-xl">
                                Connect your wallet to deposit funds and start earning optimized yields through our quantitative volatility-based strategy.
                            </p>
                        </>
                    )}
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-col gap-4">
                    {isConnected ? (
                        <>
                            <button
                                onClick={onDepositClick}
                                className="btn btn-primary btn-lg w-full hover-lift"
                            >
                                <Wallet size={20} />
                                Deposit Funds
                            </button>

                            <button className="btn btn-secondary btn-lg w-full">
                                Withdraw
                            </button>

                            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-400">Protocol TVL</span>
                                    <span className="text-sm font-semibold text-white">$2.4M</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Your Share</span>
                                    <span className="text-sm font-semibold text-vector-400">
                                        {((portfolioValue / 2400000) * 100).toFixed(3)}%
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => connect({ connector: injected() })}
                                className="btn btn-primary btn-lg w-full hover-lift animate-glow-pulse"
                            >
                                <Wallet size={20} />
                                Connect Wallet
                            </button>

                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-center">
                                    <div className="text-2xl font-bold text-vector-400">2.45</div>
                                    <div className="text-xs text-slate-400 mt-1">Sharpe Ratio</div>
                                </div>
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-center">
                                    <div className="text-2xl font-bold text-vector-400">$2.4M</div>
                                    <div className="text-xs text-slate-400 mt-1">TVL</div>
                                </div>
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-center">
                                    <div className="text-2xl font-bold text-vector-400">92.5</div>
                                    <div className="text-xs text-slate-400 mt-1">V-Score</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
