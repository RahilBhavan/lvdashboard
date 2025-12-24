import React, { useState } from 'react';
import { Section } from './types';

// Navigation Components
import SidebarNav from './components/SidebarNav';
import MobileBottomNav from './components/MobileBottomNav';

// Page Components
import DashboardNew from './components/DashboardNew';
import QuantEngine from './components/QuantEngine';
import CodeViewer from './components/CodeViewer';
import ConnectButton from './components/ConnectButton';
import VerificationTesting from './components/VerificationTesting';
import AdminPanel from './components/AdminPanel';
import StrategyBuilder from './components/StrategyBuilder';

import { CODE_FILES } from './constants';

const AppNew: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>(Section.OVERVIEW);
    const [activeSubItem, setActiveSubItem] = useState<string | undefined>(undefined);

    const handleNavigationChange = (section: Section, subItem?: string) => {
        setActiveSection(section);
        setActiveSubItem(subItem);
    };

    const getPageTitle = () => {
        switch (activeSection) {
            case Section.OVERVIEW:
                return 'Protocol Overview';
            case Section.ANALYTICS:
                if (activeSubItem === 'quant-engine') return 'Quantitative Engine';
                if (activeSubItem === 'backtests') return 'Backtests';
                return 'Analytics Dashboard';
            case Section.DEVELOPER:
                if (activeSubItem === 'contracts') return 'Contract Repository';
                if (activeSubItem === 'tests') return 'Verification & Testing';
                if (activeSubItem === 'infrastructure') return 'Automation Infrastructure';
                return 'Developer Tools';
            case Section.MANAGE:
                if (activeSubItem === 'strategy-builder') return 'Strategy Builder';
                if (activeSubItem === 'admin-panel') return 'Protocol Administration';
                return 'Management';
            default:
                return 'Liquidity Vector';
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case Section.OVERVIEW:
                return <DashboardNew />;

            case Section.ANALYTICS:
                if (activeSubItem === 'quant-engine') {
                    return <QuantEngine />;
                }
                // Default to dashboard for analytics
                return <DashboardNew />;

            case Section.DEVELOPER:
                if (activeSubItem === 'contracts') {
                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                            <CodeViewer title="contracts/src/CoreVault.sol" code={CODE_FILES.CORE_VAULT} language="solidity" />
                            <CodeViewer title="contracts/src/adapters/UniswapV3Adapter.sol" code={CODE_FILES.UNISWAP_V3_ADAPTER} language="solidity" />
                            <CodeViewer title="contracts/src/adapters/AaveV3Adapter.sol" code={CODE_FILES.AAVE_V3_ADAPTER} language="solidity" />
                            <CodeViewer title="contracts/src/interfaces/IStrategyAdapter.sol" code={CODE_FILES.I_STRATEGY_ADAPTER} language="solidity" />
                        </div>
                    );
                }
                if (activeSubItem === 'tests') {
                    return <VerificationTesting />;
                }
                if (activeSubItem === 'infrastructure') {
                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                            <div className="lg:col-span-1">
                                <div className="mb-4 card p-6 h-[120px]">
                                    <h3 className="text-xl font-bold text-vector-300 mb-2 flex items-center gap-2">
                                        Automation
                                    </h3>
                                    <p className="text-slate-300 text-sm">
                                        The Keeper Bot fetches data, runs off-chain models, and executes on-chain rebalances.
                                    </p>
                                </div>
                                <CodeViewer title="scripts/keepers/bot.py" code={CODE_FILES.KEEPER_BOT} language="python" />
                            </div>
                            <div className="lg:col-span-1">
                                <div className="mb-4 card p-6 h-[120px]">
                                    <h3 className="text-xl font-bold text-vector-300 mb-2 flex items-center gap-2">
                                        Docker Container
                                    </h3>
                                    <p className="text-slate-300 text-sm">
                                        Standardized container environment for deployment on cloud services or decentralized compute.
                                    </p>
                                </div>
                                <CodeViewer title="Dockerfile" code={CODE_FILES.DOCKERFILE} language="dockerfile" />
                            </div>
                        </div>
                    );
                }
                return <CodeViewer title="contracts/src/CoreVault.sol" code={CODE_FILES.CORE_VAULT} language="solidity" />;

            case Section.MANAGE:
                if (activeSubItem === 'admin-panel') {
                    return <AdminPanel />;
                }
                if (activeSubItem === 'strategy-builder') {
                    return <StrategyBuilder />;
                }
                return <StrategyBuilder />;

            default:
                return <DashboardNew />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-vector-500/30">
            {/* Desktop/Tablet Sidebar */}
            <SidebarNav
                activeSection={activeSection}
                activeSubItem={activeSubItem}
                onSectionChange={handleNavigationChange}
            />

            {/* Main Content */}
            <main className="lg:pl-64 min-h-screen mobile-content-padding">
                {/* Header */}
                <header className="h-20 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
                    <h1 className="text-lg lg:text-xl font-semibold text-white">
                        {getPageTitle()}
                    </h1>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <ConnectButton />
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
                    {renderContent()}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                activeSection={activeSection}
                onSectionChange={(section) => handleNavigationChange(section)}
            />
        </div>
    );
};

export default AppNew;
