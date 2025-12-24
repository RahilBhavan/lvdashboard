import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CORE_VAULT_ABI, ERC20_ABI } from '../abis';
import { Loader2, Coins } from 'lucide-react';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    vaultAddress: `0x${string}`;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, vaultAddress }) => {
    const { address } = useAccount();
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'input' | 'approving' | 'depositing' | 'success'>('input');

    // 1. Get Underlying Asset
    const { data: assetAddress } = useReadContract({
        address: vaultAddress,
        abi: CORE_VAULT_ABI,
        functionName: 'asset',
    });

    // 2. Get User Balance & Allowance
    const { data: userBalance } = useReadContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address!],
        query: { enabled: !!address && !!assetAddress }
    });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address!, vaultAddress],
        query: { enabled: !!address && !!assetAddress }
    });

    const { data: decimals } = useReadContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
        query: { enabled: !!assetAddress }
    });

    const assetDecimals = decimals || 6; // Default to 6 (USDC) if loading

    // Write Hooks
    const { writeContractAsync: approveAsync } = useWriteContract();
    const { writeContractAsync: depositAsync } = useWriteContract();

    if (!isOpen) return null;

    const handleAction = async () => {
        if (!assetAddress || !amount) return;

        try {
            const parsedAmount = parseUnits(amount, assetDecimals);

            // Step 1: Check Allowance
            if ((allowance || 0n) < parsedAmount) {
                setStep('approving');
                await approveAsync({
                    address: assetAddress,
                    abi: ERC20_ABI,
                    functionName: 'approve',
                    args: [vaultAddress, parsedAmount],
                });
                // In a real app we'd wait for receipt here too, but for speed logic:
                // Let's assume user confirms and we wait for next block or just refetch
                await refetchAllowance();
                // For better UX, we should really wait for the receipt. 
                // But simplifying for this MVP iteration.
            }

            // Step 2: Deposit
            setStep('depositing');
            await depositAsync({
                address: vaultAddress,
                abi: CORE_VAULT_ABI,
                functionName: 'deposit',
                args: [parsedAmount, address!],
            });

            setStep('success');
            setTimeout(() => {
                onClose();
                setStep('input');
                setAmount('');
            }, 2000);

        } catch (e) {
            console.error(e);
            setStep('input'); // Reset on error
            alert('Transaction Failed');
        }
    };

    const needsApproval = (allowance || 0n) < (amount ? parseUnits(amount, assetDecimals) : 0n);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Coins className="text-vector-400" />
                        Deposit Collateral
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Amount</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-vector-500 transition-colors font-mono"
                                placeholder="0.00"
                                disabled={step !== 'input'}
                            />
                            <div className="absolute right-3 top-3 text-slate-500 text-sm font-bold">
                                USDC
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-right">
                            Balance: {userBalance ? formatUnits(userBalance, assetDecimals) : '0.00'}
                        </p>
                    </div>

                    <button
                        onClick={handleAction}
                        disabled={!amount || step !== 'input'}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2
                            ${step === 'success' ? 'bg-green-500 text-white' : 'bg-vector-500 hover:bg-vector-400 text-slate-900'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {step === 'input' && (needsApproval ? 'Approve & Deposit' : 'Deposit')}
                        {step === 'approving' && <><Loader2 className="animate-spin" /> Approving...</>}
                        {step === 'depositing' && <><Loader2 className="animate-spin" /> Depositing...</>}
                        {step === 'success' && 'Success!'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;
