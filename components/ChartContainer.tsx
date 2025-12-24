import React from 'react';

/**
 * Standardized Chart Container Component
 * Provides consistent wrapper for all charts with title, description, and actions
 */

export interface TimeRangeOption {
    label: string;
    value: string;
}

export interface ChartContainerProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    timeRanges?: TimeRangeOption[];
    selectedTimeRange?: string;
    onTimeRangeChange?: (value: string) => void;
    children: React.ReactNode;
    height?: string;
    className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
    title,
    description,
    actions,
    timeRanges,
    selectedTimeRange,
    onTimeRangeChange,
    children,
    height = '400px',
    className = '',
}) => {
    return (
        <div className={`card-elevated ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-slate-400 mt-1">{description}</p>
                    )}
                </div>

                {/* Actions and Time Range Selector */}
                <div className="flex items-center gap-3">
                    {timeRanges && timeRanges.length > 0 && (
                        <div className="flex gap-2" role="group" aria-label="Time range selector">
                            {timeRanges.map((range) => (
                                <button
                                    key={range.value}
                                    onClick={() => onTimeRangeChange?.(range.value)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${selectedTimeRange === range.value
                                            ? 'bg-vector-500/20 text-vector-400 border border-vector-500/30'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                    aria-pressed={selectedTimeRange === range.value}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    )}
                    {actions}
                </div>
            </div>

            {/* Chart Content */}
            <div style={{ height }} className="w-full">
                {children}
            </div>
        </div>
    );
};

export default ChartContainer;
