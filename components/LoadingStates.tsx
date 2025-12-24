import React from 'react';

/**
 * Loading Skeleton Component
 * Used to show loading states while data is being fetched
 */

export interface SkeletonProps {
    variant?: 'text' | 'heading' | 'card' | 'metric';
    width?: string;
    height?: string;
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
}) => {
    const getVariantClass = () => {
        switch (variant) {
            case 'text':
                return 'skeleton-text';
            case 'heading':
                return 'skeleton-heading';
            case 'card':
                return 'skeleton-card';
            case 'metric':
                return 'h-24';
            default:
                return '';
        }
    };

    return (
        <div
            className={`skeleton ${getVariantClass()} ${className}`}
            style={{ width, height }}
            role="status"
            aria-label="Loading..."
        />
    );
};

/**
 * Spinner Component
 * Used for inline loading indicators
 */

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClass = size === 'lg' ? 'spinner-lg' : '';

    return (
        <div
            className={`spinner ${sizeClass} ${className}`}
            role="status"
            aria-label="Loading..."
        />
    );
};

/**
 * Dots Loader Component
 * Alternative loading indicator with animated dots
 */

export const DotsLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`dots-loader ${className}`} role="status" aria-label="Loading...">
            <span />
            <span />
            <span />
        </div>
    );
};

/**
 * Loading State for Dashboard Cards
 */

export const StatCardSkeleton: React.FC = () => {
    return (
        <div className="card-metric">
            <div className="card-metric-header">
                <div className="flex-1">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="heading" width="80%" />
                </div>
                <Skeleton width="40px" height="40px" />
            </div>
            <Skeleton variant="text" width="50%" />
        </div>
    );
};

/**
 * Loading State for Charts
 */

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = '400px' }) => {
    return (
        <div className="card-elevated">
            <div className="mb-6">
                <Skeleton variant="heading" width="40%" />
                <Skeleton variant="text" width="60%" />
            </div>
            <Skeleton height={height} />
        </div>
    );
};

export default Skeleton;
