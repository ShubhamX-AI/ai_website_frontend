'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { SPRING } from '../designTokens';

interface CardCarouselProps {
    /** One card per child. */
    children: React.ReactNode[];
    /** Show the dot pager below the carousel. */
    showDots?: boolean;
    /** Show clickable prev/next arrows (for mouse users). Defaults to true. */
    showArrows?: boolean;
    className?: string;
}

// How long the active card rests before the carousel auto-advances one step.
const AUTO_MS = 6000;

/**
 * CardCarousel — a single-card slide carousel.
 *
 * Exactly ONE card is visible at a time. Cards are absolutely stacked and slide
 * horizontally as a filmstrip (each at `(i - index)` full widths); off-screen
 * cards are clipped by overflow-hidden. The wrapper HEIGHT animates to the active
 * card's measured height (ResizeObserver) so the frame morphs to fit each card —
 * no dead space below short cards, and the side arrows (vertically centered) sit
 * on the real content instead of floating in an empty tall cell.
 *
 * On a slow timer it plays ONE forward pass then rests on the last card. The first
 * manual nav (drag / arrows / dots) cancels auto-advance for good — it never yanks
 * the user back to the end again.
 */
export const CardCarousel: React.FC<CardCarouselProps> = ({
    children,
    showDots = false,
    showArrows = true,
    className = '',
}) => {
    const slides = React.Children.toArray(children);
    const count = slides.length;

    const [index, setIndex] = useState(0);
    // Once the user navigates manually, auto-advance is cancelled for good — it must
    // never re-arm and drag them back to the last card.
    const userControlRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const stopAuto = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

    // Per-card measured heights → wrapper animates to the active card's height.
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [heights, setHeights] = useState<number[]>([]);

    const measure = useCallback(() => {
        setHeights((prev) => {
            const next = cardRefs.current.map((el, i) => el?.offsetHeight ?? prev[i] ?? 0);
            // Avoid a state churn loop when nothing changed.
            if (next.length === prev.length && next.every((h, i) => h === prev[i])) return prev;
            return next;
        });
    }, []);

    // Observe every card so height tracks streaming text, media load, font swaps,
    // and widget resize (container width changes → reflow → height changes).
    useEffect(() => {
        if (typeof ResizeObserver === 'undefined') { measure(); return; }
        const ro = new ResizeObserver(() => measure());
        cardRefs.current.forEach((el) => el && ro.observe(el));
        measure();
        return () => ro.disconnect();
    }, [measure, count]);

    const clamp = (n: number) => Math.max(0, Math.min(count - 1, n));

    // Slow auto-advance for ONE forward pass, then rest on the last card. Guarded by
    // userControlRef so it never re-arms after a manual nav. Depends on `count` only,
    // so a streaming deck extends the pass to newly arrived cards.
    useEffect(() => {
        if (count <= 1 || userControlRef.current) return;
        timerRef.current = setInterval(() => {
            setIndex((i) => {
                if (i >= count - 1) { stopAuto(); return i; }
                return i + 1;
            });
        }, AUTO_MS);
        return stopAuto;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    const goTo = (next: number) => {
        userControlRef.current = true; // user took over — kill auto-advance for good
        stopAuto();
        setIndex(clamp(next));
    };

    const onDragEnd = (_: unknown, info: PanInfo) => {
        const flick = Math.abs(info.velocity.x) > 400;
        const moved = Math.abs(info.offset.x) > 60;
        if ((flick || moved) && info.offset.x < 0) goTo(index + 1);
        else if ((flick || moved) && info.offset.x > 0) goTo(index - 1);
    };

    // A single card needs no sliding or controls.
    if (count <= 1) {
        return <div className={className}>{slides}</div>;
    }

    const activeHeight = heights[index] || undefined;

    return (
        <div className={`flex w-full flex-col items-center ${className}`}>
            {/* Filmstrip: cards absolutely stacked; wrapper height morphs to the
                active card so the frame fits the content (no dead space). */}
            <motion.div
                className="relative w-full overflow-hidden"
                animate={{ height: activeHeight }}
                transition={SPRING}
            >
                {slides.map((slide, i) => {
                    const isActive = i === index;
                    return (
                        <motion.div
                            key={i}
                            ref={(el) => { cardRefs.current[i] = el; }}
                            className={`absolute inset-x-0 top-0 w-full ${isActive ? '' : 'pointer-events-none'}`}
                            style={{ zIndex: isActive ? 10 : 0 }}
                            animate={{ x: `${(i - index) * 100}%`, opacity: isActive ? 1 : 0 }}
                            transition={SPRING}
                            drag={isActive ? 'x' : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.18}
                            onDragEnd={isActive ? onDragEnd : undefined}
                        >
                            {slide}
                        </motion.div>
                    );
                })}

                {/* Prev / next — vertically centered on the active card (the wrapper is
                    now sized to it). Hidden at the ends so nav reads as finite. */}
                {showArrows && (
                    <>
                        <button
                            onClick={() => goTo(index - 1)}
                            disabled={index === 0}
                            aria-label="Previous"
                            className="absolute left-2 top-1/2 z-[200] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => goTo(index + 1)}
                            disabled={index === count - 1}
                            aria-label="Next"
                            className="absolute right-2 top-1/2 z-[200] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-0"
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
