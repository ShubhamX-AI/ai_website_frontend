import { type Variants } from 'framer-motion';

// ─── Animation System ────────────────────────────────────────────────────────
// Purely frontend-controlled. Cards flow in sequentially with a staggered
// spring entrance. Each card uses the same smooth spring so the set feels
// like a single cohesive wave rather than independent elements.

export const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 24,
        scale: 0.97,
        filter: 'blur(6px)',
    },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 280,
            damping: 28,
            mass: 0.9,
            delay: index * 0.07, // stagger: each card follows the previous by 70ms
        },
    }),
    exit: {
        opacity: 0,
        y: -12,
        scale: 0.96,
        filter: 'blur(4px)',
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
    },
};
