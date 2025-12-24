import React, { useEffect } from 'react';

/**
 * Keyboard Navigation Hook
 * Provides keyboard shortcuts and navigation for the application
 */

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    action: () => void;
    description: string;
}

export const useKeyboardNavigation = (shortcuts: KeyboardShortcut[]) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const matchingShortcut = shortcuts.find(
                (shortcut) =>
                    shortcut.key.toLowerCase() === event.key.toLowerCase() &&
                    (shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey) &&
                    (shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey) &&
                    (shortcut.altKey === undefined || shortcut.altKey === event.altKey) &&
                    (shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey)
            );

            if (matchingShortcut) {
                event.preventDefault();
                matchingShortcut.action();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};

/**
 * Focus Trap Hook
 * Traps focus within a modal or dialog for accessibility
 */

export const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        // Focus first element when trap activates
        firstElement?.focus();

        container.addEventListener('keydown', handleTabKey as EventListener);
        return () => container.removeEventListener('keydown', handleTabKey as EventListener);
    }, [isActive, containerRef]);
};

/**
 * Escape Key Hook
 * Handles escape key press for closing modals/dialogs
 */

export const useEscapeKey = (callback: () => void, isActive: boolean = true) => {
    useEffect(() => {
        if (!isActive) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                callback();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [callback, isActive]);
};

/**
 * Arrow Key Navigation Hook
 * Enables arrow key navigation for lists and grids
 */

export const useArrowKeyNavigation = (
    containerRef: React.RefObject<HTMLElement>,
    options: {
        orientation?: 'horizontal' | 'vertical' | 'both';
        loop?: boolean;
    } = {}
) => {
    const { orientation = 'both', loop = true } = options;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleArrowKeys = (event: KeyboardEvent) => {
            const focusableElements = Array.from(
                container.querySelectorAll<HTMLElement>(
                    'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])'
                )
            );

            const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
            if (currentIndex === -1) return;

            let nextIndex = currentIndex;

            switch (event.key) {
                case 'ArrowRight':
                    if (orientation === 'horizontal' || orientation === 'both') {
                        event.preventDefault();
                        nextIndex = currentIndex + 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (orientation === 'horizontal' || orientation === 'both') {
                        event.preventDefault();
                        nextIndex = currentIndex - 1;
                    }
                    break;
                case 'ArrowDown':
                    if (orientation === 'vertical' || orientation === 'both') {
                        event.preventDefault();
                        nextIndex = currentIndex + 1;
                    }
                    break;
                case 'ArrowUp':
                    if (orientation === 'vertical' || orientation === 'both') {
                        event.preventDefault();
                        nextIndex = currentIndex - 1;
                    }
                    break;
                default:
                    return;
            }

            if (loop) {
                nextIndex = (nextIndex + focusableElements.length) % focusableElements.length;
            } else {
                nextIndex = Math.max(0, Math.min(nextIndex, focusableElements.length - 1));
            }

            focusableElements[nextIndex]?.focus();
        };

        container.addEventListener('keydown', handleArrowKeys as EventListener);
        return () => container.removeEventListener('keydown', handleArrowKeys as EventListener);
    }, [containerRef, orientation, loop]);
};

/**
 * Skip Link Component
 * Allows keyboard users to skip navigation and go directly to main content
 */

export const SkipLink: React.FC<{ targetId: string }> = ({ targetId }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <a
      href= {`#${targetId}`
}
onClick = { handleClick }
className = "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-vector-500 focus:text-slate-950 focus:rounded-lg focus:font-semibold"
style = {{
    position: 'absolute',
        left: '-9999px',
            width: '1px',
                height: '1px',
                    overflow: 'hidden',
      }}
    >
    Skip to main content
        </a>
  );
};

export default {
    useKeyboardNavigation,
    useFocusTrap,
    useEscapeKey,
    useArrowKeyNavigation,
    SkipLink,
};
