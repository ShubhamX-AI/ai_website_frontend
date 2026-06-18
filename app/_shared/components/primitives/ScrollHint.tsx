'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ScrollHintProps {
    /** Reveal the hint — true when the scroll container has more content below. */
    show: boolean;
    /** Smooth-scroll the container down a page. */
    onClick: () => void;
    /** Extra positioning classes (variant-specific bottom offset). */
    className?: string;
}

/**
 * ScrollHint — a soft glass pill with a gently bouncing down-chevron, pinned to the
 * bottom-center of a scroll viewport. Tells the user "there's more below, scroll".
 * Fades/slides in only while `show` is true; clicking it pages the content down.
 *
 * Presentational only — owns no scroll state (see useScrollAffordance).
 */
export const ScrollHint: React.FC<ScrollHintProps> = ({ show, onClick, className = '' }) => {
    const reduce = useReducedMotion();

    return (
        <AnimatePresence>
            {show && (
                <motion.button
                    type="button"
                    onClick={onClick}
                    aria-label="Scroll for more"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className={[
                        'pointer-events-auto absolute left-1/2 z-20 -translate-x-1/2',
                        'flex h-9 w-9 items-center justify-center rounded-full',
                        'bg-blue-600 text-white shadow-xl shadow-blue-600/25',
                        'transition-colors hover:bg-blue-700',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
                        className,
                    ].join(' ')}
                >
                    <motion.svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        animate={reduce ? undefined : { y: [0, 3, 0] }}
                        transition={reduce ? undefined : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <path d="M6 9l6 6 6-6" />
                    </motion.svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
};
