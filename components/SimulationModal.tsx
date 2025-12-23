import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface SimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [step, setStep] = useState<'idle' | 'simulating' | 'ready'>('idle');

    useEffect(() => {
        if (isOpen) {
            // Delay state update to avoid synchronous render warning
            setTimeout(() => setStep('simulating'), 0);
            // Mock simulation delay
            const timer = setTimeout(() => {
                setStep('ready');
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setTimeout(() => setStep('idle'), 0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">Strategy Simulation</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {step === 'simulating' ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 text-vector-500 animate-spin mb-4" />
                            <p className="text-slate-300 font-medium">Running Pre-flight Checks...</p>
                            <span className="text-slate-500 text-sm">Validating gas, slippage, and solvency</span>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-slate-400">Projected APY</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 line-through">18.42%</span>
                                            <ArrowRight size={14} className="text-slate-600" />
                                            <span className="text-green-400 font-bold">21.05%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">Gas Estimate</span>
                                        <span className="text-slate-200">0.0045 ETH ($8.50)</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-300">Pre-flight Checks</h4>
                                    <CheckItem label="Solvency Check" status="pass" />
                                    <CheckItem label="Slippage Tolerance (0.5%)" status="pass" />
                                    <CheckItem label="Oracle Deviation" status="pass" />
                                </div>

                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 text-sm text-yellow-200">
                                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                    <p>
                                        This action will rebalance the Vault's liquidity. Users cannot withdraw during the
                                        rebalance (approx. 2 blocks).
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={step !== 'ready'}
                        onClick={onConfirm}
                        className="px-6 py-2 bg-vector-600 hover:bg-vector-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {step === 'ready' ? 'Execute Rebalance' : 'Analyzing...'}
                        {step === 'ready' && <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CheckItem: React.FC<{ label: string; status: 'pass' | 'fail' }> = ({ label, status }) => (
    <div className="flex items-center justify-between p-2 rounded hover:bg-slate-800/50 transition-colors">
        <span className="text-slate-400 text-sm">{label}</span>
        {status === 'pass' ? (
            <div className="flex items-center gap-1.5 text-green-400 text-xs font-mono bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                <CheckCircle2 size={12} /> PASS
            </div>
        ) : (
            <span className="text-red-400 text-xs font-bold">FAIL</span>
        )}
    </div>
);

export default SimulationModal;
