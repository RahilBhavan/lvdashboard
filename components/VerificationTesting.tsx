import React, { useState } from 'react';
import {
    CheckCircle2,
    AlertTriangle,
    ShieldCheck,
    Terminal,
    Activity,
    Cpu,
    FileCode,
    Check,
    Zap
} from 'lucide-react';

const VerificationTesting: React.FC = () => {
    const [activeInternalTab, setActiveInternalTab] = useState<'overview' | 'contracts' | 'model' | 'security'>('overview');

    // Mock Data
    const stats = {
        totalTests: 142,
        passingRate: 100,
        coverage: 94.5,
        criticalIssues: 0,
        lastRun: '2 mins ago'
    };

    const contractTests = [
        { name: 'CoreVault.t.sol', status: 'PASS', gas: '452,102', coverage: '98%' },
        { name: 'UniswapV3Adapter.t.sol', status: 'PASS', gas: '128,400', coverage: '92%' },
        { name: 'AaveV3Adapter.t.sol', status: 'PASS', gas: '156,780', coverage: '94%' },
        { name: 'RiskCheck.t.sol', status: 'PASS', gas: '85,200', coverage: '100%' },
        { name: 'AccessControl.t.sol', status: 'PASS', gas: '42,000', coverage: '100%' },
    ];

    const modelTests = [
        { name: 'test_vamer.py', status: 'PASS', duration: '0.42s', type: 'Unit' },
        { name: 'test_trend_follower.py', status: 'PASS', duration: '1.2s', type: 'Unit' },
        { name: 'test_integration.py', status: 'PASS', duration: '5.8s', type: 'Integration' },
        { name: 'backtest_historical.py', status: 'PASS', duration: '124s', type: 'Simulation' },
    ];

    const securityInvariants = [
        { name: 'Solvency Check', description: 'Assets >= Liabilities', status: 'Active' },
        { name: 'Reentrancy Guard', description: 'No reentrant calls', status: 'Active' },
        { name: 'Slippage Protection', description: 'Max slip 0.5%', status: 'Active' },
        { name: 'Owner Timelock', description: '24h delay on upgrades', status: 'Active' },
    ];

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Top Navigation for Internal Tabs */}
            <div className="flex items-center space-x-4 border-b border-slate-800 pb-2">
                {(['overview', 'contracts', 'model', 'security'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveInternalTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeInternalTab === tab
                            ? 'bg-vector-500/10 text-vector-400 border border-vector-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeInternalTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Tests"
                            value={stats.totalTests.toString()}
                            icon={<Terminal size={20} className="text-blue-400" />}
                            subtext="Across all suites"
                        />
                        <StatCard
                            title="Passing Rate"
                            value={`${stats.passingRate}%`}
                            icon={<CheckCircle2 size={20} className="text-green-400" />}
                            subtext="All systems operational"
                        />
                        <StatCard
                            title="Code Coverage"
                            value={`${stats.coverage}%`}
                            icon={<FileCode size={20} className="text-purple-400" />}
                            subtext="Lines covered"
                        />
                        <StatCard
                            title="Critical Issues"
                            value={stats.criticalIssues.toString()}
                            icon={<ShieldCheck size={20} className="text-vector-400" />}
                            subtext="Security scan clear"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Status View */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-vector-400" />
                                Live System Status
                            </h3>
                            <div className="space-y-4">
                                <StatusRow label="Smart Contract Suite" status="passing" detail="All 5 suites passed" />
                                <StatusRow label="Risk Engine Validation" status="passing" detail="Mean error < 0.1%" />
                                <StatusRow label="Keeper Bot Health" status="passing" detail="Last heartbeat: 10s ago" />
                                <StatusRow label="RPC Connectivity" status="passing" detail="Latency: 45ms" />
                            </div>
                        </div>

                        {/* Recent Activity / Log */}
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Terminal size={20} className="text-slate-400" />
                                Recent CI/CD Runs
                            </h3>
                            <div className="space-y-3">
                                <LogEntry time="2 mins ago" text="Deployed verification suite: v2.4.1" />
                                <LogEntry time="15 mins ago" text="Foundry test pass: CoreVault.t.sol" />
                                <LogEntry time="1 hour ago" text="Risk Model backtest complete (Sharpe: 2.1)" />
                                <LogEntry time="3 hours ago" text="Slither static analysis: No High Severity issues" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeInternalTab === 'contracts' && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-500">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileCode size={20} className="text-blue-400" />
                            Smart Contract Tests (Foundry)
                        </h3>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">forge test -vvv</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950/50 text-slate-200 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Test Suite</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Gas Usage (Avg)</th>
                                    <th className="px-6 py-4">Coverage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {contractTests.map((test, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-300">{test.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                <Check size={12} /> PASS
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono">{test.gas}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: test.coverage }}></div>
                                                </div>
                                                <span>{test.coverage}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeInternalTab === 'model' && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-500">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Cpu size={20} className="text-purple-400" />
                            Quantitative Model Valdiation (Pytest)
                        </h3>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">pytest tests/models/</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950/50 text-slate-200 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Test File</th>
                                    <th className="px-6 py-4">Review Status</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {modelTests.map((test, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-300">{test.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                <Check size={12} /> PASS
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${test.type === 'Simulation' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 'border-slate-700 bg-slate-800'
                                                }`}>
                                                {test.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-500">{test.duration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeInternalTab === 'security' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-vector-400" />
                            Formal Verification Properties
                        </h3>
                        <div className="space-y-4">
                            {securityInvariants.map((inv, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800">
                                    <div>
                                        <div className="font-medium text-slate-200">{inv.name}</div>
                                        <div className="text-xs text-slate-500">{inv.description}</div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-vector-500/10 text-vector-400 border border-vector-500/20">
                                        <Zap size={12} /> Verified
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">External Audits</h3>
                            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="text-sm font-bold text-yellow-500">Preliminary Status</h4>
                                        <p className="text-xs text-slate-400 mt-1">
                                            The protocol is currently in <strong className="text-slate-300">Alpha</strong>. No formal third-party audits have been completed yet.
                                            Internal reviews and automated static analysis (Slither, Aderyn) are active.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors">
                                View Audit Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value, icon, subtext }: { title: string, value: string, icon: React.ReactNode, subtext: string }) => (
    <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl flex flex-col justify-between h-[110px]">
        <div className="flex justify-between items-start">
            <span className="text-slate-400 text-sm font-medium">{title}</span>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">{icon}</div>
        </div>
        <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500">{subtext}</div>
        </div>
    </div>
);

const StatusRow = ({ label, status: _, detail }: { label: string, status: string, detail: string }) => (
    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <div className="text-right">
            <span className="block text-xs font-bold text-vector-400 uppercase tracking-wider">Operational</span>
            <span className="block text-[10px] text-slate-500">{detail}</span>
        </div>
    </div>
)

const LogEntry = ({ time, text }: { time: string, text: string }) => (
    <div className="flex items-start gap-3 text-sm">
        <span className="text-xs font-mono text-slate-500 whitespace-nowrap mt-0.5 w-20">{time}</span>
        <span className="text-slate-300">{text}</span>
    </div>
)

export default VerificationTesting;
