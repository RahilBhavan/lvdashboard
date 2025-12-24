import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileCode, BrainCircuit, Activity, ArrowRightLeft, TestTube2, Server, ShieldAlert } from 'lucide-react';
import { Tab } from './types';
import Dashboard from './components/Dashboard';
import QuantEngine from './components/QuantEngine';
// import CodeViewer from './components/CodeViewer';
import ConnectButton from './components/ConnectButton';
import VerificationTesting from './components/VerificationTesting';
import AdminPanel from './components/AdminPanel';
import StrategyBuilder from './components/StrategyBuilder';
// import { CODE_FILES } from './constants'; // Commented out for production build

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [ethPrice, setEthPrice] = useState<number>(1842.20);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  // Simulate real-time price feed
  useEffect(() => {
    const fetchPrice = () => {
      // Placeholder API logic: Random walk simulation to mimic live market data
      setEthPrice(prev => {
        const volatility = 2.5; // Max swing per tick
        const change = (Math.random() - 0.5) * volatility;
        setPriceDirection(change >= 0 ? 'up' : 'down');
        return prev + change;
      });
    };

    const intervalId = setInterval(fetchPrice, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard />;
      case Tab.CONTRACTS:
        // Code viewer disabled for production build
        return (
          <div className="p-8 text-center text-slate-400">
            <FileCode size={48} className="mx-auto mb-4 opacity-50" />
            <p>Contract code viewer is disabled in production build.</p>
            <p className="text-sm mt-2">View contracts on GitHub or in local development.</p>
          </div>
        );
      case Tab.MODEL:
        return <QuantEngine />;
      case Tab.TESTS:
        return <VerificationTesting />;
      case Tab.INFRA:
        // Infrastructure code viewer disabled for production build
        return (
          <div className="p-8 text-center text-slate-400">
            <Server size={48} className="mx-auto mb-4 opacity-50" />
            <p>Infrastructure code viewer is disabled in production build.</p>
            <p className="text-sm mt-2">View infrastructure code on GitHub or in local development.</p>
          </div>
        );

      case Tab.ADMIN:
        return <AdminPanel />;
      case Tab.STRATEGY:
        return <StrategyBuilder />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-vector-500/30">
      {/* Sidebar / Navigation */}
      <div className="fixed top-0 left-0 h-full w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-10 h-10 bg-vector-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <ArrowRightLeft className="text-slate-950" size={24} />
          </div>
          <span className="ml-3 font-bold text-xl tracking-tight hidden lg:block text-white">
            Liquidity <span className="text-vector-400">Vector</span>
          </span>
        </div>

        <nav className="flex-1 py-8 flex flex-col gap-2 px-3">
          <NavButton
            active={activeTab === Tab.DASHBOARD}
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <NavButton
            active={activeTab === Tab.CONTRACTS}
            onClick={() => setActiveTab(Tab.CONTRACTS)}
            icon={<FileCode size={20} />}
            label="Smart Contracts"
          />
          <NavButton
            active={activeTab === Tab.MODEL}
            onClick={() => setActiveTab(Tab.MODEL)}
            icon={<BrainCircuit size={20} />}
            label="Quant Model"
          />
          <NavButton
            active={activeTab === Tab.STRATEGY}
            onClick={() => setActiveTab(Tab.STRATEGY)}
            icon={<BrainCircuit size={20} />}
            label="Strategy Builder"
          />
          <NavButton
            active={activeTab === Tab.TESTS}
            onClick={() => setActiveTab(Tab.TESTS)}
            icon={<TestTube2 size={20} />}
            label="Testing Suite"
          />
          <NavButton
            active={activeTab === Tab.INFRA}
            onClick={() => setActiveTab(Tab.INFRA)}
            icon={<Server size={20} />}
            label="Infrastructure"
          />
          <NavButton
            active={activeTab === Tab.ADMIN}
            onClick={() => setActiveTab(Tab.ADMIN)}
            icon={<ShieldAlert size={20} />}
            label="Admin Panel"
          />

        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-3 hidden lg:block">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-2">Network Status</div>
            <div className="flex items-center gap-2 text-sm text-vector-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vector-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-vector-500"></span>
              </span>
              Ethereum Mainnet
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pl-20 lg:pl-64 min-h-screen">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
          <h1 className="text-xl font-semibold text-white">
            {activeTab === Tab.DASHBOARD && 'Protocol Overview'}
            {activeTab === Tab.CONTRACTS && 'Contract Repository'}
            {activeTab === Tab.MODEL && 'Quantitative Engine'}
            {activeTab === Tab.STRATEGY && 'Strategy Builder'}
            {activeTab === Tab.TESTS && 'Verification & Testing'}
            {activeTab === Tab.INFRA && 'Automation Infrastructure'}
            {activeTab === Tab.ADMIN && 'Protocol Administration'}

          </h1>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700 text-sm text-slate-300 min-w-[180px] justify-between transition-colors duration-500">
              <Activity
                size={16}
                className={`transition-colors duration-300 ${priceDirection === 'up' ? 'text-green-400' :
                  priceDirection === 'down' ? 'text-red-400' : 'text-vector-400'
                  }`}
              />
              <span className="font-mono tabular-nums">
                ETH/USDC: ${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <ConnectButton />
          </div>
        </header>
        <div className="p-8 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active
      ? 'bg-vector-500/10 text-vector-400 border border-vector-500/20'
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
      }`}
  >
    <div className={`${active ? 'text-vector-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
      {icon}
    </div>
    <span className="font-medium hidden lg:block">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-vector-400 hidden lg:block box-shadow-[0_0_8px_#4ade80]" />}
  </button>
);

export default App;