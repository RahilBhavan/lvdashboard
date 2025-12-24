import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

/**
 * Onboarding Tour Component
 * Guides first-time users through the key features of the application
 */

interface TourStep {
    id: string;
    title: string;
    description: string;
    targetSelector?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void;
}

interface OnboardingTourProps {
    steps: TourStep[];
    onComplete: () => void;
    onSkip: () => void;
}

const defaultSteps: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Liquidity Vector',
        description: 'Let\'s take a quick tour to help you get started with our quantitative volatility-based yield optimization protocol.',
    },
    {
        id: 'portfolio',
        title: 'Your Portfolio',
        description: 'View your total portfolio value, 24h change, and key metrics at a glance. Connect your wallet to see your position.',
        targetSelector: '.hero-section',
    },
    {
        id: 'metrics',
        title: 'Key Metrics',
        description: 'Monitor TVL, APY, Health Factor, and Active Range. These cards provide quick insights into protocol performance.',
        targetSelector: '.metrics-grid',
    },
    {
        id: 'charts',
        title: 'Volatility Forecasts',
        description: 'Our GARCH model predicts price volatility to optimize liquidity ranges. Toggle between GARCH and HODL comparison views.',
        targetSelector: '.chart-container',
    },
    {
        id: 'risk',
        title: 'Risk Analysis',
        description: 'Our proprietary 5-factor V-Score evaluates protocol safety across multiple dimensions. Click to expand for details.',
        targetSelector: '.risk-section',
    },
    {
        id: 'navigation',
        title: 'Navigation',
        description: 'Explore Analytics for backtests, Developer tools for contracts and tests, and Manage for strategy configuration.',
        targetSelector: 'nav',
    },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({
    steps = defaultSteps,
    onComplete,
    onSkip,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const step = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    useEffect(() => {
        if (step.targetSelector) {
            const target = document.querySelector(step.targetSelector);
            if (target) {
                const rect = target.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + window.scrollY + 16,
                    left: rect.left + window.scrollX,
                });

                // Scroll target into view
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Highlight target
                target.classList.add('tour-highlight');
                return () => target.classList.remove('tour-highlight');
            }
        }
    }, [currentStep, step.targetSelector]);

    const handleNext = () => {
        if (step.action) {
            step.action();
        }

        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        onSkip();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[90] animate-fade-in"
                onClick={handleSkip}
                aria-hidden="true"
            />

            {/* Tour Card */}
            <div
                className="fixed z-[100] w-full max-w-md animate-scale-in"
                style={
                    step.targetSelector
                        ? { top: `${position.top}px`, left: `${position.left}px` }
                        : {
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }
                }
                role="dialog"
                aria-labelledby="tour-title"
                aria-describedby="tour-description"
            >
                <div className="card-elevated p-6 m-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h2 id="tour-title" className="text-xl font-bold text-white mb-1">
                                {step.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span>Step {currentStep + 1} of {steps.length}</span>
                                <div className="flex gap-1">
                                    {steps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1 w-6 rounded-full transition-colors ${index === currentStep
                                                    ? 'bg-vector-400'
                                                    : index < currentStep
                                                        ? 'bg-vector-600'
                                                        : 'bg-slate-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            aria-label="Close tour"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Description */}
                    <p id="tour-description" className="text-slate-300 mb-6">
                        {step.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={handleSkip}
                            className="btn btn-ghost text-sm"
                        >
                            Skip Tour
                        </button>

                        <div className="flex gap-2">
                            {!isFirstStep && (
                                <button
                                    onClick={handlePrevious}
                                    className="btn btn-secondary btn-sm"
                                    aria-label="Previous step"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="btn btn-primary btn-sm"
                                aria-label={isLastStep ? 'Finish tour' : 'Next step'}
                            >
                                {isLastStep ? 'Finish' : 'Next'}
                                {!isLastStep && <ChevronRight size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for highlight effect */}
            <style>{`
        .tour-highlight {
          position: relative;
          z-index: 95;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.5);
          border-radius: 12px;
          transition: box-shadow 0.3s ease;
        }
      `}</style>
        </>
    );
};

export default OnboardingTour;
