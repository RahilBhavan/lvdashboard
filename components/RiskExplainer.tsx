import React from 'react';
import { ShieldAlert, Code2, TrendingDown, ServerCrash, Users } from 'lucide-react';

interface RiskFactorProps {
    label: string;
    score: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const RiskFactor: React.FC<RiskFactorProps> = ({ label, score, description, icon, color }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-opacity-20 ${color.replace('text-', 'bg-')} ${color}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-slate-200">{label}</h4>
                <div className="text-xs font-mono text-vector-400">Score: {score}</div>
            </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
            {description}
        </p>
    </div>
);

const RiskExplainer: React.FC = () => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="text-vector-400" />
                    Risk Engine Analysis
                </h2>
                <p className="text-sm text-slate-400">
                    Proprietary 5-factor scoring model determining the V-Score safety rating.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <RiskFactor
                    label="Protocol Risk (PR)"
                    score="A+"
                    description="Evaluates protocol maturity, TVL stability, and governance decentralization."
                    icon={<Users size={18} />}
                    color="text-blue-400"
                />
                <RiskFactor
                    label="Smart Contract (SR)"
                    score="A"
                    description="Analysis of code complexity, audit coverage, and formal verification status."
                    icon={<Code2 size={18} />}
                    color="text-emerald-400"
                />
                <RiskFactor
                    label="Market Risk (MR)"
                    score="B+"
                    description="Assessment of asset volatility, liquidity depth, and slippage impact."
                    icon={<TrendingDown size={18} />}
                    color="text-amber-400"
                />
                <RiskFactor
                    label="Technical Risk (TR)"
                    score="A-"
                    description="Oracle reliance, dependency chains, and keeper infrastructure reliability."
                    icon={<ServerCrash size={18} />}
                    color="text-purple-400"
                />
                <RiskFactor
                    label="Counterparty (CR)"
                    score="A"
                    description="Exposure to external protocols (e.g. Uniswap, Aave) and bridge risks."
                    icon={<ShieldAlert size={18} />}
                    color="text-rose-400"
                />
            </div>

            <div className="mt-6 p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                    <span className="text-slate-400 text-sm">Aggregated V-Score</span>
                    <div className="text-2xl font-bold text-white">92.5/100</div>
                </div>
                <div className="h-2 flex-1 mx-6 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 w-[92.5%]" />
                </div>
                <span className="text-vector-400 font-bold bg-vector-500/10 px-3 py-1 rounded border border-vector-500/20">
                    EXCELLENT
                </span>
            </div>
        </div>
    );
};

export default RiskExplainer;
