import React from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useEnsName } from 'wagmi';
import { Wallet, LogOut } from 'lucide-react';

const ConnectButton: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: balanceData } = useBalance({
        address: address,
    });
    const { data: ensName } = useEnsName({ address });

    // Filter for injected connector (usually MetaMask/Browser Wallet)
    const connector = connectors[0];

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-medium text-white">
                        {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
                    </span>
                    {balanceData && (
                        <span className="text-xs text-vector-400 font-mono">
                            {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => disconnect()}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-700"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Disconnect</span>
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => connect({ connector })}
            className="flex items-center gap-2 bg-vector-600 hover:bg-vector-500 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-vector-900/20"
        >
            <Wallet size={18} />
            <span>Connect Wallet</span>
        </button>
    );
};

export default ConnectButton;
