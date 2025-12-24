import React from 'react';

/**
 * Standardized Stat Card Component
 * Used for displaying key metrics across the dashboard
 */

export interface StatCardProps {
    label: string;
    value: string | number;
    change?: {
        value: number;
        period: string;
    };
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    variant?: 'default' | 'large' | 'compact';
    tooltip?: string;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    trend = 'neutral',
    icon,
    variant = 'default',
    tooltip,
    className = '',
}) => {
    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return 'text-vector-400';
            case 'down':
                return 'text-red-400';
            default:
                return 'text-slate-400';
        }
    };

    const getTrendIcon = () => {
        if (trend === 'up') return '▲';
        if (trend === 'down') return '▼';
        return '—';
    };

    const valueSize = variant === 'large' ? 'text-4xl' : variant === 'compact' ? 'text-xl' : 'text-2xl';

    return (
        <div
            className={`card-metric ${className}`}
            title={tooltip}
            role="article"
            aria-label={`${label}: ${value}`}
        >
            <div className="card-metric-header">
                <div className="flex-1">
                    <p className="card-metric-label">{label}</p>
                    <h3 className={`card-metric-value ${valueSize} font-bold text-white mt-1`}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                </div>
                {icon && (
                    <div className="card-metric-icon">
                        {icon}
                    </div>
                )}
            </div>

            {change && (
                <div className="card-metric-subvalue flex items-center gap-2">
                    <span className={`text-sm font-medium ${getTrendColor()}`}>
                        {getTrendIcon()} {change.value > 0 ? '+' : ''}{change.value.toFixed(2)}%
                    </span>
                    <span className="text-xs text-slate-500">({change.period})</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
