"use client";

/**
 * /embed — the Vani widget, rendered INSIDE the loader's iframe.
 *
 * This is the entire embeddable surface. It renders the shared <ChatWindowShell>
 * (launcher orb → bottom-right popup card), identical to /vani.
 *
 * Because it lives in a cross-origin iframe, it can't resize itself — it asks the
 * host loader (public/widget.js) to resize the iframe via postMessage:
 *     { type: 'vani:resize', mode: 'collapsed' | 'open', width }
 * The loader owns the iframe geometry; this page owns what's drawn inside it. The
 * loader also tells us the host form factor ({ type: 'vani:host', isMobile }), since
 * CSS `sm:` here keys off the narrow iframe, not the host viewport.
 *
 * LiveKit connects lazily on first open and disconnects on close, so an embedded
 * site pays nothing until the visitor actually opens Vani.
 */

import { useState, useEffect, useCallback } from "react";
import { useLiveKitConnection } from "@/app/_shared/hooks/useLiveKitConnection";
import { ChatWindowShell } from "./_components/ChatWindowShell";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

// Card width the loader sizes the iframe around (px). Must match the shell's
// w-[544px] class. Mobile ignores this and goes full-screen.
const WIDTH_DEFAULT = 544;

// Tell the host loader how big the iframe should be. Safe no-op when opened
// directly (not embedded) — the message just goes to our own window.
function postResize(mode: "collapsed" | "open", width?: number) {
    if (typeof window === "undefined") return;
    // "*" is intentional — the parent (host) origin is unknown for a cross-site
    // embed. Safe here: the message carries only layout state, no credentials.
    window.parent.postMessage({ type: "vani:resize", mode, width }, "*");
}

// Corner drag runs inside the iframe (ChatWindowShell); we just relay the new box
// size to the loader, which applies it. phase "move" = live resize, "end" = settle.
function postResizeFree(phase: "move" | "end", width?: number, height?: number) {
    if (typeof window === "undefined") return;
    window.parent.postMessage({ type: "vani:resize-free", phase, width, height }, "*");
}

export default function EmbedPage() {
    const [isOpen, setIsOpen] = useState(false);
    // Host form factor, told to us by the loader (public/widget.js) — the CSS `sm:`
    // breakpoint can't be trusted here, it keys off the iframe width. Default desktop;
    // corrected as soon as the host pings.
    const [isMobileHost, setIsMobileHost] = useState(false);
    // True once the user drags the corner → card goes fluid (fills the iframe).
    // Resets on close, so each open starts at the default preset (no persistence).
    const [freeSize, setFreeSize] = useState(false);
    const { token, error, connect, disconnect } = useLiveKitConnection();

    // Connect on open, disconnect on close — room lifecycle follows the card.
    useEffect(() => {
        if (isOpen) {
            connect();
            return () => disconnect();
        }
    }, [isOpen, connect, disconnect]);

    // Listen for the host's form-factor pings, and announce we're ready so the
    // loader sends the first one even if it mounted before us.
    useEffect(() => {
        function onHostMessage(e: MessageEvent) {
            if (e.data?.type === "vani:host") setIsMobileHost(!!e.data.isMobile);
        }
        window.addEventListener("message", onHostMessage);
        window.parent.postMessage({ type: "vani:ready" }, "*");
        return () => window.removeEventListener("message", onHostMessage);
    }, []);

    // Grow the iframe as soon as we open (so the card has room to pop into).
    // Collapsing back is deferred to onExitComplete so the pop-out animation
    // isn't clipped by an early shrink.
    useEffect(() => {
        if (isOpen) postResize("open", WIDTH_DEFAULT);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setFreeSize(false); // next open starts at the default preset
    }, []);

    return (
        <ChatWindowShell
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={handleClose}
            token={token}
            error={error}
            connect={connect}
            livekitUrl={LIVEKIT_URL}
            isMobile={isMobileHost}
            onExitComplete={() => postResize("collapsed")}
            freeSize={freeSize}
            onResizeStart={() => setFreeSize(true)}
            onResize={(w, h) => postResizeFree("move", w, h)}
            onResizeEnd={() => postResizeFree("end")}
            launcherClassName="bottom-4 right-4"
        />
    );
}
