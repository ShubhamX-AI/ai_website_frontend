import { useEffect, useRef, useState, useCallback } from 'react';

/** Px of slack before we stop showing the hint — avoids flicker at the true bottom. */
const SLOP = 24;

/**
 * useScrollAffordance — tracks whether a scroll container has more content below
 * the fold. Returns a ref to attach to the scroller and a `canScrollDown` flag the
 * UI can use to reveal a scroll hint.
 *
 * Recomputes on scroll, on content resize, and on content swaps — the agent replaces
 * the visual board's contents (long→short), not just appends, so a plain scroll
 * listener would go stale.
 *
 * The ResizeObserver watches the *inner content*, not the scroll container: the
 * container is `absolute inset-0` (fixed size), so it never resizes when the visual
 * swaps — only the content height changes. Recompute is rAF-deferred so it reads
 * `scrollHeight` after layout/async media settle, not before.
 */
export function useScrollAffordance<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T | null>(null);
    const [canScrollDown, setCanScrollDown] = useState(false);
    const frame = useRef<number | null>(null);

    const recompute = useCallback(() => {
        if (frame.current != null) cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
            const el = ref.current;
            if (!el) return;
            setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - SLOP);
        });
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        recompute();

        // Track the current content node so the RO follows it across swaps.
        const ro = new ResizeObserver(recompute);
        let observed: Element | null = null;
        const observeContent = () => {
            const next = el.firstElementChild;
            if (next === observed) return;
            if (observed) ro.unobserve(observed);
            if (next) ro.observe(next);
            observed = next;
        };
        observeContent();

        const mo = new MutationObserver(() => {
            observeContent();
            recompute();
        });
        mo.observe(el, { childList: true });

        el.addEventListener('scroll', recompute, { passive: true });
        window.addEventListener('resize', recompute);

        return () => {
            if (frame.current != null) cancelAnimationFrame(frame.current);
            el.removeEventListener('scroll', recompute);
            window.removeEventListener('resize', recompute);
            ro.disconnect();
            mo.disconnect();
        };
    }, [recompute]);

    /** Smooth-scroll the container down by ~80% of its visible height. */
    const scrollDown = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        el.scrollBy({ top: el.clientHeight * 0.8, behavior: 'smooth' });
    }, []);

    return { ref, canScrollDown, scrollDown };
}
