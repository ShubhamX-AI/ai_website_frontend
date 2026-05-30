"use client";

/**
 * /embed — the Vani widget, rendered INSIDE the loader's iframe.
 *
 * This is the entire embeddable surface. It renders one of two things:
 *   - collapsed → a floating launcher orb (bottom-right)
 *   - open      → a right-docked slide drawer mounting the shared <AgentInterface>
 *
 * Because it lives in a cross-origin iframe, it can't resize itself — it asks the
 * host loader (public/widget.js) to resize the iframe via postMessage:
 *     { type: 'vani:resize', mode: 'collapsed' | 'open', width }
 * The loader owns the iframe geometry; this page owns what's drawn inside it.
 *
 * LiveKit connects lazily on first open and disconnects on close, so an embedded
 * site pays nothing until the visitor actually opens Vani.
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveKitRoom } from "@livekit/components-react";
import { useLiveKitConnection } from "@/app/_shared/hooks/useLiveKitConnection";
import { AgentInterface } from "@/app/_shared/components/agent/AgentInterface";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

// Drawer widths the loader animates the iframe to (px). Mobile ignores these
// and goes full-screen — see widget.js.
const WIDTH_DEFAULT = 420;
const WIDTH_EXPANDED = 720;

// Tell the host loader how big the iframe should be. Safe no-op when opened
// directly (not embedded) — the message just goes to our own window.
function postResize(mode: "collapsed" | "open", width?: number) {
    if (typeof window === "undefined") return;
    // "*" is intentional — the parent (host) origin is unknown for a cross-site
    // embed. Safe here: the message carries only layout state, no credentials.
    window.parent.postMessage({ type: "vani:resize", mode, width }, "*");
}

export default function EmbedPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { token, error, connect, disconnect } = useLiveKitConnection();

    // Connect on open, disconnect on close — room lifecycle follows the drawer.
    useEffect(() => {
        if (isOpen) {
            connect();
            return () => disconnect();
        }
    }, [isOpen, connect, disconnect]);

    // Grow the iframe as soon as we open (so the drawer has room to slide into),
    // and on expand/shrink. Collapsing back is deferred to onExitComplete below
    // so the slide-out animation isn't clipped by an early shrink.
    useEffect(() => {
        if (isOpen) postResize("open", isExpanded ? WIDTH_EXPANDED : WIDTH_DEFAULT);
    }, [isOpen, isExpanded]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setIsExpanded(false);
    }, []);

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
                        className="group fixed bottom-4 right-4 z-50 flex items-center gap-3"
                    >
                        <span className="pointer-events-none translate-x-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                            Talk to Vani
                        </span>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.45)] ring-1 ring-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_14px_44px_rgba(37,99,235,0.6)] active:scale-95"
                            aria-label="Talk to Vani"
                        >
                            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-blue-500/30 [animation-duration:3s]" />
                            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/15" />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative h-7 w-7 drop-shadow-sm">
                                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Slide drawer ── */}
            <AnimatePresence onExitComplete={() => postResize("collapsed")}>
                {isOpen && (
                    <motion.div
                        key="drawer"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/10 sm:left-auto sm:right-0 sm:top-0 sm:h-full"
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">V</span>
                                <span className="text-sm font-semibold text-zinc-900">Vani</span>
                            </div>

                            <div className="flex items-center gap-1">
                                {/* Expand / shrink — wider drawer for rich visuals (desktop only) */}
                                <button
                                    onClick={() => setIsExpanded((v) => !v)}
                                    className="hidden h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:flex"
                                    aria-label={isExpanded ? "Shrink panel" : "Expand panel"}
                                    title={isExpanded ? "Shrink" : "Expand"}
                                >
                                    {isExpanded ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9 4.5 4.5M9 9V5.25M9 9H5.25m9.75 0 4.5-4.5M15 9V5.25M15 9h3.75M9 15l-4.5 4.5M9 15v3.75M9 15H5.25m9.75 0 4.5 4.5M15 15v3.75m0-3.75h3.75" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                    aria-label="Close chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body — mirrors the connection states */}
                        <div className="relative flex-1 overflow-hidden bg-[#FAFAFA]">
                            {error ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                                    <p className="text-sm font-medium text-red-500">Connection failed</p>
                                    <p className="text-xs text-zinc-500">{error.message}</p>
                                    <button
                                        onClick={() => connect()}
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
                                    serverUrl={LIVEKIT_URL}
                                    connect={true}
                                    video={false}
                                    audio={{
                                        echoCancellation: true,
                                        noiseSuppression: true,
                                        autoGainControl: true,
                                    }}
                                    data-lk-theme="default"
                                    style={{ height: "100%" }}
                                    onDisconnected={handleClose}
                                    onError={(err) => console.error("LiveKit Room Error:", err)}
                                >
                                    <AgentInterface variant="window" onDisconnect={handleClose} />
                                </LiveKitRoom>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
