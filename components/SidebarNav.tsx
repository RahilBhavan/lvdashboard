import React, { useState } from 'react';
import { LayoutDashboard, BarChart3, Code2, Settings, ChevronRight, X } from 'lucide-react';
import { Section, NavigationItem, SubNavigationItem } from '../types';

/**
 * Desktop/Tablet Sidebar Navigation Component
 * Responsive sidebar that collapses on tablet and is hidden on mobile
 */

interface SidebarNavProps {
    activeSection: Section;
    activeSubItem?: string;
    onSectionChange: (section: Section, subItem?: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const navigationItems: NavigationItem[] = [
    {
        id: Section.OVERVIEW,
        label: 'Overview',
        icon: LayoutDashboard,
        description: 'Portfolio and key metrics',
    },
    {
        id: Section.ANALYTICS,
        label: 'Analytics',
        icon: BarChart3,
        description: 'Charts and backtests',
        subItems: [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'quant-engine', label: 'Quant Model' },
            { id: 'backtests', label: 'Backtests' },
        ],
    },
    {
        id: Section.DEVELOPER,
        label: 'Developer',
        icon: Code2,
        description: 'Contracts and tests',
        subItems: [
            { id: 'contracts', label: 'Smart Contracts' },
            { id: 'tests', label: 'Testing Suite' },
            { id: 'infrastructure', label: 'Infrastructure' },
        ],
    },
    {
        id: Section.MANAGE,
        label: 'Manage',
        icon: Settings,
        description: 'Strategy and admin',
        subItems: [
            { id: 'strategy-builder', label: 'Strategy Builder' },
            { id: 'admin-panel', label: 'Admin Panel' },
        ],
    },
];

const SidebarNav: React.FC<SidebarNavProps> = ({
    activeSection,
    activeSubItem,
    onSectionChange,
    isCollapsed = false,
}) => {
    const [expandedSection, setExpandedSection] = useState<Section | null>(activeSection);

    const handleSectionClick = (section: Section) => {
        if (expandedSection === section) {
            setExpandedSection(null);
        } else {
            setExpandedSection(section);
            onSectionChange(section);
        }
    };

    const handleSubItemClick = (section: Section, subItemId: string) => {
        onSectionChange(section, subItemId);
    };

    return (
        <aside
            className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300 hidden lg:block ${isCollapsed ? 'w-20' : 'w-64'
                }`}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Logo/Header */}
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
                <div className="w-10 h-10 bg-vector-500 rounded-lg flex items-center justify-center shadow-glow">
                    <span className="text-slate-950 font-bold text-xl">LV</span>
                </div>
                {!isCollapsed && (
                    <span className="ml-3 font-bold text-xl tracking-tight text-white">
                        Liquidity <span className="text-vector-400">Vector</span>
                    </span>
                )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-8 px-3 overflow-y-auto">
                <div className="space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        const isExpanded = expandedSection === item.id;
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        return (
                            <div key={item.id}>
                                {/* Main Navigation Button */}
                                <button
                                    onClick={() => handleSectionClick(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-vector-500/10 text-vector-400 border border-vector-500/20'
                                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                                        }`}
                                    aria-expanded={hasSubItems ? isExpanded : undefined}
                                    aria-current={isActive ? 'page' : undefined}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon
                                        size={20}
                                        className={isActive ? 'text-vector-400' : 'text-slate-500 group-hover:text-slate-300'}
                                    />
                                    {!isCollapsed && (
                                        <>
                                            <span className="font-medium flex-1 text-left">{item.label}</span>
                                            {hasSubItems && (
                                                <ChevronRight
                                                    size={16}
                                                    className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                />
                                            )}
                                        </>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-vector-400 shadow-glow" />
                                    )}
                                </button>

                                {/* Sub-navigation Items */}
                                {!isCollapsed && hasSubItems && isExpanded && (
                                    <div className="ml-8 mt-2 space-y-1 animate-slide-in-top">
                                        {item.subItems!.map((subItem) => {
                                            const isSubActive = activeSubItem === subItem.id;
                                            return (
                                                <button
                                                    key={subItem.id}
                                                    onClick={() => handleSubItemClick(item.id, subItem.id)}
                                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${isSubActive
                                                            ? 'text-vector-400 bg-vector-500/5'
                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                                        }`}
                                                >
                                                    {subItem.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Network Status */}
            {!isCollapsed && (
                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 uppercase font-semibold mb-2">Network Status</div>
                        <div className="flex items-center gap-2 text-sm text-vector-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vector-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-vector-500" />
                            </span>
                            Ethereum Mainnet
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default SidebarNav;
