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

// Card widths the loader sizes the iframe around (px). Must match the shell's
// w-[480px] / w-[860px] classes. Mobile ignores these and goes full-screen.
const WIDTH_DEFAULT = 480;
const WIDTH_EXPANDED = 860;

// Tell the host loader how big the iframe should be. Safe no-op when opened
// directly (not embedded) — the message just goes to our own window.
function postResize(mode: "collapsed" | "open", width?: number) {
    if (typeof window === "undefined") return;
    // "*" is intentional — the parent (host) origin is unknown for a cross-site
    // embed. Safe here: the message carries only layout state, no credentials.
    window.parent.postMessage({ type: "vani:resize", mode, width }, "*");
}

// Tell the host a corner-resize drag has begun. The host then owns the gesture
// (overlay + pointer capture) and resizes the iframe directly — see widget.js.
function postDragStart(pointerId: number, button: number) {
    if (typeof window === "undefined") return;
    window.parent.postMessage({ type: "vani:resize-drag-start", pointerId, button, edge: "corner" }, "*");
}

export default function EmbedPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    // Host form factor, told to us by the loader (public/widget.js) — the CSS `sm:`
    // breakpoint can't be trusted here, it keys off the iframe width. Default desktop;
    // corrected as soon as the host pings.
    const [isMobileHost, setIsMobileHost] = useState(false);
    // Host-persisted free (dragged) iframe size, if any. When set, the card goes
    // fluid (fills the iframe) and we skip the preset width post on open.
    const [hostFree, setHostFree] = useState<{ w: number; h: number } | null>(null);
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
            if (e.data?.type === "vani:host") {
                setIsMobileHost(!!e.data.isMobile);
                setHostFree(e.data.freeSize ?? null);
            }
        }
        window.addEventListener("message", onHostMessage);
        window.parent.postMessage({ type: "vani:ready" }, "*");
        return () => window.removeEventListener("message", onHostMessage);
    }, []);

    // Grow the iframe as soon as we open (so the card has room to pop into), and on
    // expand/shrink. Collapsing back is deferred to onExitComplete so the pop-out
    // animation isn't clipped by an early shrink.
    useEffect(() => {
        // With a saved free size the host already applies the box on open — posting a
        // preset width here would clear it (and flash 480px), so skip it.
        if (isOpen && !hostFree) postResize("open", isExpanded ? WIDTH_EXPANDED : WIDTH_DEFAULT);
    }, [isOpen, isExpanded, hostFree]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setIsExpanded(false);
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
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((v) => !v)}
            onExitComplete={() => postResize("collapsed")}
            freeSize={!!hostFree}
            onResizeStart={postDragStart}
            launcherClassName="bottom-4 right-4"
        />
    );
}
