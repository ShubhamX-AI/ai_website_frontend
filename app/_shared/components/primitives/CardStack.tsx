'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface CardStackProps {
    /** One card per child. The last child is treated as the newest. */
    children: React.ReactNode[];
    /** Show the dot pager below the stack. */
    showDots?: boolean;
    /** Show clickable prev/next arrows (for mouse users). Defaults to true. */
    showArrows?: boolean;
    className?: string;
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 32, mass: 0.7 };

// How many cards peek behind the front one before the rest hide.
const VISIBLE_BEHIND = 2;

/**
 * CardStack — a 3D stacked deck of cards.
 *
 * The active card sits in front at full size; upcoming cards peek out from the
 * top-right corner behind it (each one nudged up + right, scaled down, faded),
 * giving a sense of depth. Already-viewed cards peel off to the left.
 *
 * Auto-advances ONE step when a new card arrives (so the newest card rises to the
 * front as the agent speaks) — but only while the user is already viewing the
 * latest card. Any manual nav (drag / arrows / dots) parks the deck where the user
 * left it. Used by the window-variant CardDisplay; SwipeDeck still drives the
 * StarterScreen strip.
 */
export const CardStack: React.FC<CardStackProps> = ({
    children,
    showDots = false,
    showArrows = true,
    className = '',
}) => {
    const slides = React.Children.toArray(children);
    const count = slides.length;

    const [index, setIndex] = useState(count - 1);
    const prevCount = useRef(count);

    // Advance to the newest card when one arrives — but only if the user was
    // already parked on the previous newest card (don't yank them mid-browse).
    useEffect(() => {
        if (count > prevCount.current) {
            setIndex((cur) => (cur >= prevCount.current - 1 ? count - 1 : cur));
        }
        prevCount.current = count;
        // Re-clamp if cards were removed.
        setIndex((cur) => Math.min(cur, count - 1));
    }, [count]);

    const goTo = (next: number) => setIndex(Math.max(0, Math.min(next, count - 1)));

    const onDragEnd = (_: unknown, info: PanInfo) => {
        const flick = Math.abs(info.velocity.x) > 400;
        const moved = Math.abs(info.offset.x) > 60;
        if ((flick || moved) && info.offset.x < 0) goTo(index + 1);
        else if ((flick || moved) && info.offset.x > 0) goTo(index - 1);
    };

    // A single card needs no stacking or controls.
    if (count <= 1) {
        return <div className={className}>{slides}</div>;
    }

    const atStart = index === 0;
    const atEnd = index === count - 1;

    return (
        <div className={`flex w-full flex-col items-center ${className}`}>
            <motion.div layout className="relative w-full">
                {slides.map((slide, i) => {
                    const depth = i - index; // 0 = front, >0 = upcoming (peek), <0 = viewed
                    const isFront = depth === 0;

                    // Upcoming cards peek up-and-right; viewed cards peel off left.
                    const target =
                        depth === 0
                            ? { x: 0, y: 0, scale: 1, opacity: 1 }
                            : depth > 0
                                ? {
                                    x: depth * 14,
                                    y: -depth * 12,
                                    scale: 1 - depth * 0.05,
                                    opacity: depth <= VISIBLE_BEHIND ? 1 - depth * 0.22 : 0,
                                }
                                : { x: -48, y: 14, scale: 0.94, opacity: 0 };

                    return (
                        <motion.div
                            key={i}
                            // Front card stays in flow so it drives the container height;
                            // the rest stack absolutely behind it.
                            className={isFront ? 'relative' : 'absolute inset-x-0 top-0'}
                            style={{ zIndex: 100 - Math.abs(depth) }}
                            animate={target}
                            transition={SPRING}
                            drag={isFront ? 'x' : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.18}
                            onDragEnd={isFront ? onDragEnd : undefined}
                        >
                            {slide}
                        </motion.div>
                    );
                })}

                {/* Prev / next — for mouse users; drag still works too */}
                {showArrows && (
                    <>
                        <button
                            onClick={() => goTo(index - 1)}
                            disabled={atStart}
                            aria-label="Previous"
                            className="absolute left-0 top-1/2 z-[200] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white disabled:pointer-events-none disabled:opacity-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => goTo(index + 1)}
                            disabled={atEnd}
                            aria-label="Next"
                            className="absolute right-0 top-1/2 z-[200] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white disabled:pointer-events-none disabled:opacity-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </motion.div>

            {showDots && (
                <div className="mt-4 flex items-center gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Go to card ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-blue-600' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
