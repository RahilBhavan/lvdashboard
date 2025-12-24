import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CORE_VAULT_ABI } from '../abis';
import { ShieldAlert, PauseCircle, PlayCircle, Save, Ban, CheckCircle, Zap, TrendingUp } from 'lucide-react';

const AdminPanel: React.FC = () => {
    const { address, isConnected } = useAccount();
    const [minProfit, setMinProfit] = useState('0.02');
    const [cycleTime, setCycleTime] = useState('3600');

    const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS as `0x${string}`;

    // Read Protocol Owner
    const { data: owner } = useReadContract({
        address: VAULT_ADDRESS,
        abi: CORE_VAULT_ABI,
        functionName: 'owner',
    });

    const isOwner = isConnected && address && owner && address.toLowerCase() === owner.toLowerCase();

    // Write Hooks
    const { writeContractAsync: pauseAsync } = useWriteContract();
    const { writeContractAsync: unpauseAsync } = useWriteContract();
    const { writeContractAsync: setParamsAsync } = useWriteContract();

    const handlePause = async () => {
        if (!confirm("Are you sure you want to PAUSE the protocol? Deposits and rebalances will be disabled.")) return;
        try {
            await pauseAsync({
                address: VAULT_ADDRESS,
                abi: CORE_VAULT_ABI,
                functionName: 'pause',
            });
            alert("Pause transaction submitted.");
        } catch (e) {
            console.error(e);
            alert("Transaction failed detected.");
        }
    };

    const handleUnpause = async () => {
        try {
            await unpauseAsync({
                address: VAULT_ADDRESS,
                abi: CORE_VAULT_ABI,
                functionName: 'unpause',
            });
            alert("Unpause transaction submitted.");
        } catch (e) {
            console.error(e);
            alert("Transaction failed.");
        }
    };

    const handleUpdateParams = async () => {
        try {
            await setParamsAsync({
                address: VAULT_ADDRESS,
                abi: CORE_VAULT_ABI,
                functionName: 'setParams',
                args: [BigInt(Number(minProfit) * 1e18), BigInt(cycleTime)],
            });
            alert("Parameters update submitted.");
        } catch (e) {
            console.error(e);
            alert("Transaction failed.");
        }
    };

    if (!isConnected) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <ShieldAlert size={48} className="mx-auto text-slate-500 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h2>
                    <p className="text-slate-400">Please connect your wallet to access admin controls.</p>
                </div>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center p-8 bg-red-950/20 border border-red-900/50 rounded-xl max-w-md">
                    <Ban size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-red-500 mb-2">Unauthorized Access</h2>
                    <p className="text-red-200/70">
                        Your wallet <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-xs">{address}</span> is not the protocol owner.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="text-vector-500" />
                        Admin Panel
                    </h1>
                    <p className="text-slate-400 mt-1">Manage critical protocol parameters and emergency controls.</p>
                </div>
                <div className="px-3 py-1 bg-vector-500/10 border border-vector-500/20 rounded-full flex items-center gap-2">
                    <CheckCircle size={14} className="text-vector-500" />
                    <span className="text-xs font-bold text-vector-400 uppercase tracking-wider">Owner Authenticated</span>
                </div>
            </div>

            {/* Emergency Controls */}
            <div className="bg-slate-900 border border-red-900/30 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <ShieldAlert className="text-red-500" size={20} />
                    Emergency Controls
                </h3>

                <div className="flex gap-4">
                    <button
                        onClick={handlePause}
                        className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 hover:border-red-500 text-red-500 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <PauseCircle /> PAUSE
                    </button>
                    <button
                        onClick={handleUnpause}
                        className="flex-1 py-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/50 hover:border-green-500 text-green-500 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <PlayCircle /> UNPAUSE
                    </button>
                    <button
                        onClick={() => writeContract({
                            address: VAULT_ADDRESS,
                            abi: CORE_VAULT_ABI,
                            functionName: 'emergencyUnwind',
                            args: []
                        })}
                        className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 hover:border-red-500 text-red-500 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <ShieldAlert size={18} />
                        UNWIND
                    </button>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                    * Pausing the protocol prevents all deposits, rebalances, and withdrawals. Use only in emergencies.
                </p>
            </div>

            {/* Yield Management Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-vector-400" size={20} />
                    Yield Management
                </h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => writeContract({
                            address: VAULT_ADDRESS,
                            abi: CORE_VAULT_ABI,
                            functionName: 'harvest',
                            args: []
                        })}
                        className="flex-1 py-4 bg-vector-500/10 hover:bg-vector-500/20 border border-vector-500/50 hover:border-vector-500 text-vector-400 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={18} />
                        Harvest & Compound Rewards
                    </button>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                    * Manually triggers the collection of trading fees and compounds them back into the active strategy.
                </p>
            </div>

            {/* Parameter Configuration */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Save className="text-vector-500" size={20} />
                    Protocol Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Min Profit Threshold (ETH)</label>
                        <input
                            type="number"
                            value={minProfit}
                            onChange={(e) => setMinProfit(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-vector-500 outline-none transition-colors"
                        />
                        <p className="mt-1 text-xs text-slate-500">Minimum expected profit required to trigger a rebalance.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Cycle Time (Seconds)</label>
                        <input
                            type="number"
                            value={cycleTime}
                            onChange={(e) => setCycleTime(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-vector-500 outline-none transition-colors"
                        />
                        <p className="mt-1 text-xs text-slate-500">Minimum delay between consecutive rebalances.</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleUpdateParams}
                        className="px-6 py-3 bg-vector-600 hover:bg-vector-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Save size={18} />
                        Update Parameters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
