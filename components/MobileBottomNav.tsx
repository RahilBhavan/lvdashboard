import React from 'react';
import { LayoutDashboard, BarChart3, Code2, Settings } from 'lucide-react';
import { Section, NavigationItem } from '../types';

/**
 * Mobile Bottom Navigation Component
 * Displays navigation tabs at the bottom of the screen on mobile devices
 */

interface MobileBottomNavProps {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
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
    },
    {
        id: Section.DEVELOPER,
        label: 'Developer',
        icon: Code2,
        description: 'Contracts and tests',
    },
    {
        id: Section.MANAGE,
        label: 'Manage',
        icon: Settings,
        description: 'Strategy and admin',
    },
];

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    activeSection,
    onSectionChange,
}) => {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 lg:hidden"
            role="navigation"
            aria-label="Mobile navigation"
        >
            <div className="grid grid-cols-4 h-16">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive
                                    ? 'text-vector-400 bg-vector-500/10'
                                    : 'text-slate-400 active:bg-slate-800'
                                }`}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            style={{ minHeight: '44px', minWidth: '44px' }} // Touch target size
                        >
                            <Icon size={20} className={isActive ? 'text-vector-400' : 'text-slate-500'} />
                            <span className={`text-xs font-medium ${isActive ? 'text-vector-400' : 'text-slate-400'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
