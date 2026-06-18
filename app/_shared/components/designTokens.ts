// ─── Shared design tokens ────────────────────────────────────────────────────
// One visual language across every render surface (flashcard, infographic, media,
// forms). Import these instead of re-typing radius / shadow / accent / spring so
// the whole agent UI reads as a single thread — not three different products.

import type { Transition } from 'framer-motion';

// The signature blue→emerald premium accent (top rail, underlines, CTA gradient).
export const ACCENT_RAIL = 'bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-400';
export const ACCENT_UNDERLINE = 'bg-gradient-to-r from-blue-500 to-emerald-400';

// Elevated card surface — radius + ring + shadow used by any card that owns its
// own box (infographic, media frame). Flashcards render chromeless on the glass.
export const SURFACE_RADIUS = 'rounded-[1.75rem]';
export const SURFACE_RING = 'ring-1 ring-black/[0.06]';
export const SURFACE_SHADOW = 'shadow-[0_18px_50px_-16px_rgba(15,23,42,0.30)]';
export const SURFACE = `${SURFACE_RADIUS} bg-white ${SURFACE_RING} ${SURFACE_SHADOW}`;

// One spring for every motion in the agent UI — entrances, slides, height morphs.
// Keeps the whole surface feeling like one cohesive material.
export const SPRING: Transition = { type: 'spring', stiffness: 300, damping: 32, mass: 0.7 };

// A softer spring for content reveals inside a card (staggered blocks).
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 200, damping: 24 };

// Gentle overshoot-and-settle (damping ratio ~0.72) for card slides — Apple-style.
// Tuning knob: drop damping for more overshoot, raise for less.
export const SPRING_SETTLE: Transition = { type: 'spring', stiffness: 260, damping: 22, mass: 0.9 };
