"use client";

/**
 * ChatWindowShell — the Vani widget UI (the whole /embed surface).
 *
 * Renders the launcher orb + the bottom-right popup card (header, connecting/error
 * states, and the mounted <AgentInterface variant="window">). Lives under /embed
 * because /embed is the single widget surface — /vani reaches it by iframing /embed
 * via public/widget.js, so this is the one chat-window UI everywhere.
 *
 * This component is PURELY PRESENTATIONAL — it owns no connection logic and no
 * effects. The parent (embed/page.tsx) owns the LiveKit lifecycle and the iframe
 * postMessage resizing, then hands this component the connection state + callbacks.
 *
 * Layout is driven by the explicit `isMobile` flag, NOT Tailwind's `sm:` breakpoint:
 * inside the narrow embed iframe `sm:` keys off the iframe width, not the host
 * viewport, so the parent (which knows the real form factor) tells us instead.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveKitRoom } from "@livekit/components-react";
import { AgentInterface } from "@/app/_shared/components/agent/AgentInterface";

// Stable references — LiveKitRoom re-runs its connect/publish effects when these prop
// identities change, so inline objects/handlers would reconnect the room on every
// re-render (e.g. an expand/shrink width toggle). Hoisting them keeps the room alive.
const AUDIO_CAPTURE = { echoCancellation: true, noiseSuppression: true, autoGainControl: true } as const;
const ROOM_STYLE = { height: "100%" } as const;
const logLkError = (err: Error) => console.error("LiveKit Room Error:", err);

interface ChatWindowShellProps {
    isOpen: boolean;
    onOpen: () => void;
    /** Collapse the window. Also passed to AgentInterface as onDisconnect. */
    onClose: () => void;

    // Connection state, rendered in the card body.
    token: string | null;
    error: Error | null;
    connect: () => void;
    livekitUrl: string;

    /** Host/viewport form factor: mobile → full-screen sheet, desktop → bottom-right card. */
    isMobile: boolean;

    /** Fires after the card's pop-out finishes (embed uses it to defer the iframe shrink). */
    onExitComplete?: () => void;
    /** Launcher offset, e.g. "bottom-8 right-8" (default) or "bottom-4 right-4". */
    launcherClassName?: string;

    /** A user-dragged free size is active → card fills the iframe (fluid). */
    freeSize?: boolean;
    /** Corner-drag begins (pointer held down on the handle). */
    onResizeStart?: () => void;
    /** Corner-drag move — new desired iframe box size in px (rAF-throttled). */
    onResize?: (width: number, height: number) => void;
    /** Corner-drag released. */
    onResizeEnd?: () => void;
}

export const ChatWindowShell: React.FC<ChatWindowShellProps> = ({
    isOpen,
    onOpen,
    onClose,
    token,
    error,
    connect,
    livekitUrl,
    isMobile,
    onExitComplete,
    launcherClassName = "bottom-8 right-8",
    freeSize = false,
    onResizeStart,
    onResize,
    onResizeEnd,
}) => {
    // Fluid only on desktop — mobile is always a full-screen sheet.
    const isFluid = freeSize && !isMobile;

    // ── Corner drag-resize ──────────────────────────────────────────────────
    // The whole gesture runs INSIDE the iframe with native pointer capture, so
    // press-hold-release works without a host overlay. Deltas use screenX/Y (not
    // clientX/Y) because the iframe's top-left origin shifts as it resizes — a
    // client-coord delta would feed back on itself. We post the new iframe box to
    // the loader (rAF-throttled), which just applies it.
    const dragRef = React.useRef<{ x: number; y: number; w: number; h: number } | null>(null);
    const rafRef = React.useRef<number>(0);

    const handleResizeDown = (e: React.PointerEvent) => {
        if (isMobile || !onResize) return;
        e.preventDefault();
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        dragRef.current = { x: e.screenX, y: e.screenY, w: window.innerWidth, h: window.innerHeight };
        onResizeStart?.();
    };

    const handleResizeMove = (e: React.PointerEvent) => {
        const start = dragRef.current;
        if (!start) return;
        const dx = e.screenX - start.x;
        const dy = e.screenY - start.y;
        // Anchored bottom-right: moving up-and-left (negative delta) grows the box.
        const w = start.w - dx;
        const h = start.h - dy;
        if (rafRef.current) return;
        rafRef.current = window.requestAnimationFrame(() => {
            rafRef.current = 0;
            onResize?.(w, h);
        });
    };

    const handleResizeUp = (e: React.PointerEvent) => {
        if (!dragRef.current) return;
        dragRef.current = null;
        if (rafRef.current) { window.cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
        try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch { /* already released */ }
        onResizeEnd?.();
    };
    return (
        <>
            {/* ── Launcher orb ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        key="launcher"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`group fixed z-50 flex items-center gap-3 ${launcherClassName}`}
                    >
                        {/* Greeting card — hidden, slides in on hover */}
                        <span className="pointer-events-none flex translate-x-3 items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-2.5 text-left opacity-0 shadow-[0_10px_30px_rgba(15,23,42,0.14)] ring-1 ring-black/5 backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                            {/* Sparkle badge */}
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-blue-600">
                                    <path d="M12 2.25c.3 0 .57.18.69.46l1.83 4.27 4.27 1.83a.75.75 0 0 1 0 1.38l-4.27 1.83-1.83 4.27a.75.75 0 0 1-1.38 0l-1.83-4.27-4.27-1.83a.75.75 0 0 1 0-1.38l4.27-1.83 1.83-4.27a.75.75 0 0 1 .69-.46Z" />
                                    <path d="M18.75 15a.6.6 0 0 1 .55.36l.78 1.81 1.81.78a.6.6 0 0 1 0 1.1l-1.81.78-.78 1.81a.6.6 0 0 1-1.1 0l-.78-1.81-1.81-.78a.6.6 0 0 1 0-1.1l1.81-.78.78-1.81a.6.6 0 0 1 .55-.36Z" />
                                </svg>
                            </span>
                            <span className="flex flex-col leading-tight">
                                <span className="text-[15px] font-bold text-slate-900">Hi, I&apos;m Vani</span>
                                <span className="text-xs font-medium text-blue-600">Your INT AI assistant</span>
                            </span>
                        </span>

                        {/* Orb — deep navy glass with a living iridescent core + white voice equalizer */}
                        <button
                            onClick={onOpen}
                            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_38%,#1e2a52_0%,#111c3d_55%,#070d22_100%)] shadow-[0_10px_34px_rgba(7,13,34,0.55)] ring-1 ring-white/15 transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_48px_rgba(7,13,34,0.65)] active:scale-95"
                            aria-label="Talk to Vani"
                        >
                            {/* Living iridescent core — moves + rotates inside the orb */}
                            <span className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-orb-swirl rounded-full bg-[conic-gradient(from_0deg,#60a5fa,#22d3ee,#818cf8,#c084fc,#f472b6,#60a5fa)] opacity-80 blur-[9px]" />
                            {/* Glossy top sheen */}
                            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-transparent" />

                            {/* Crisp white equalizer bars */}
                            <span className="relative flex h-7 items-center gap-[2.5px]">
                                {[0.4, 0.7, 1, 0.55, 0.9, 0.5, 0.75].map((h, i) => (
                                    <span
                                        key={i}
                                        className="w-[2.5px] animate-pulse rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.85)]"
                                        style={{
                                            height: `${h * 100}%`,
                                            animationDuration: `${0.85 + i * 0.1}s`,
                                            animationDelay: `${i * 0.07}s`,
                                        }}
                                    />
                                ))}
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Popup card ── */}
            <AnimatePresence onExitComplete={onExitComplete}>
                {isOpen && (
                    <motion.div
                        key="card"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        // mobile: solid full-screen sheet; desktop: frosted-glass card,
                        // bottom-right. Glass = translucent white so the host page tints
                        // through the (transparent) iframe.
                        className={isMobile
                            ? "fixed z-50 flex flex-col overflow-hidden inset-0 bg-gradient-to-b from-white via-sky-50 to-sky-100 shadow-2xl ring-1 ring-black/10"
                            : isFluid
                                // Fluid: fill the iframe (the host sized it to the dragged size).
                                // inset-6 mirrors the existing 24px bottom/right offset on all sides.
                                ? "fixed z-50 flex flex-col overflow-hidden inset-6 rounded-[28px] bg-gradient-to-b from-white/70 via-sky-50/65 to-sky-100/80 backdrop-blur-2xl ring-1 ring-white/60 shadow-[0_28px_80px_-12px_rgba(15,23,42,0.28)]"
                                : "fixed z-50 flex flex-col overflow-hidden bottom-6 right-6 h-[768px] w-[544px] max-h-[calc(100dvh-3rem)] rounded-[28px] bg-gradient-to-b from-white/70 via-sky-50/65 to-sky-100/80 backdrop-blur-2xl ring-1 ring-white/60 shadow-[0_28px_80px_-12px_rgba(15,23,42,0.28)]"
                        }
                    >
                        {/* Top-left resize handle — drag to freely size the window (desktop).
                            Only posts drag-start; the host loader owns the gesture from there. */}
                        {!isMobile && onResizeStart && (
                            <button
                                type="button"
                                onPointerDown={handleResizeDown}
                                onPointerMove={handleResizeMove}
                                onPointerUp={handleResizeUp}
                                onLostPointerCapture={handleResizeUp}
                                style={{ touchAction: "none" }}
                                aria-label="Resize window"
                                title="Drag to resize"
                                className="group/resize absolute left-0 top-0 z-40 flex h-8 w-8 cursor-nwse-resize items-start justify-start rounded-tl-[28px] p-2"
                            >
                                {/* Frosted backing — fades up on hover so the grip reads as grab-able. */}
                                <span className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-tl-[28px] rounded-br-xl bg-white/0 backdrop-blur-[2px] transition-colors group-hover/resize:bg-white/40" />
                                <svg viewBox="0 0 16 16" className="relative h-3.5 w-3.5 text-blue-600/55 transition-colors group-hover/resize:text-blue-600/90" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                                    <path d="M2 8L8 2M2 13L13 2" />
                                </svg>
                            </button>
                        )}

                        {/* Soft blue glow — the image's tint comes from a diffuse blue
                            wash pooling toward the lower half of the card. */}
                        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                            <div className="absolute -bottom-28 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(125,179,234,0.42)_0%,rgba(191,219,254,0)_70%)] blur-[70px]" />
                        </div>
                        {/* Header — floats over one continuous surface (no divider). A soft
                            top scrim keeps the controls legible as content slides under it. */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-sky-50/85 via-sky-50/40 to-transparent px-4 pb-6 pt-3">
                            <div className="pointer-events-auto flex items-center gap-2">
                                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]">
                                    V
                                    {/* online status dot */}
                                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                </span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-sm font-semibold text-zinc-900">Vani</span>
                                    <span className="text-[10px] font-medium tracking-wide text-zinc-400">
                                        Powered by <span className="font-semibold text-zinc-600">INT</span>
                                    </span>
                                </div>
                            </div>

                            <div className="pointer-events-auto flex items-center gap-1">
                                <button
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-blue-600/80 ring-1 ring-white/60 backdrop-blur transition-colors hover:bg-white/80 hover:text-blue-700"
                                    aria-label="Close chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body — one continuous surface; the floating header overlays its top. */}
                        <div className="relative flex-1 overflow-hidden">
                            {error ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                                    <p className="text-sm font-medium text-red-500">Connection failed</p>
                                    <p className="text-xs text-zinc-500">{error.message}</p>
                                    <button
                                        onClick={connect}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : !token ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                                    <div className="relative flex h-16 w-16 items-center justify-center">
                                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75" />
                                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                                            <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-500">Connecting to Vani…</p>
                                </div>
                            ) : (
                                <LiveKitRoom
                                    token={token}
                                    serverUrl={livekitUrl}
                                    connect={true}
                                    video={false}
                                    audio={AUDIO_CAPTURE}
                                    data-lk-theme="default"
                                    style={ROOM_STYLE}
                                    onDisconnected={onClose}
                                    onError={logLkError}
                                >
                                    <AgentInterface variant="window" onDisconnect={onClose} fluid={isFluid} />
                                </LiveKitRoom>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
