/**
 * Vani embed loader.
 *
 * Drop this on ANY website with one line:
 *   <script src="https://YOUR-VANI-HOST/widget.js" async></script>
 *
 * It injects a single <iframe> pointing at /embed and nothing else — no global
 * CSS, no extra DOM in your tree, no library. Everything Vani draws (launcher
 * orb + chat card) lives inside that cross-origin iframe, so it can never
 * collide with the host page's styles or scripts, and the host can never reach
 * into Vani. The iframe resizes itself by listening to postMessage from /embed:
 *     { type: 'vani:resize', mode: 'collapsed' | 'open', width }
 *
 * Two ways to use it:
 *   1. Plain <script> (external sites): the loader AUTO-MOUNTS on load. Optional
 *      attributes on the <script> tag:
 *        data-vani-src="https://other-host"   where /embed is served from
 *                                              (defaults to this script's origin)
 *   2. Manual (our own Next.js /vani page, a single-page app): add
 *      data-vani-manual="true" to skip auto-mount, then drive it yourself:
 *        var instance = window.VaniWidget.mount({ origin: location.origin });
 *        // ...later, on route change:
 *        instance.destroy();
 *      A SPA must do this — the iframe lives on document.body, outside the app's
 *      component tree, so it won't be removed by client-side navigation on its own.
 *
 * Mic access works because the iframe is granted `allow="microphone"`. The host
 * page must be served over HTTPS for the browser to honor it.
 */
(function () {
    "use strict";

    // Capture the loading <script> synchronously — document.currentScript is only
    // valid during script evaluation, so it's null inside any function called later
    // (e.g. a manual mount from a SPA). The auto-mount path passes this in.
    var bootScript = document.currentScript;

    var MOBILE_BREAKPOINT = 640; // keep in sync with /embed's `sm:` breakpoint

    // Geometry for the collapsed launcher — a small bottom-right box big enough
    // for the orb plus its hover label, leaving the rest of the page clickable.
    var COLLAPSED = {
        bottom: "0px",
        right: "0px",
        top: "auto",
        left: "auto",
        width: "300px",
        height: "150px",
    };

    // Card geometry (keep in sync with /embed): the card is h-[768px], offset
    // bottom-6/right-6 (24px). BUFFER covers that offset plus the drop shadow so
    // the iframe box never clips the card.
    var CARD_HEIGHT = 768;
    var CARD_BUFFER = 96;

    // Free drag-resize: minimum usable iframe box (header + dock + one card). Max is
    // the viewport. The whole drag gesture runs inside the iframe (/embed) with native
    // pointer capture; the loader just applies the posted sizes. Not persisted — each
    // open starts at the preset size.
    var MIN_W = 360;
    var MIN_H = 420;
    var IFRAME_TRANSITION = "width 180ms ease, height 180ms ease";

    /**
     * Resolve where /embed is served from. Priority:
     *   1. explicit opts.origin (our SPA passes location.origin)
     *   2. data-vani-src on the <script> tag
     *   3. the script's own origin (plain external <script>)
     *   4. the current page origin (final fallback)
     * Never returns "" — an empty origin makes the postMessage origin check below
     * reject every message from /embed.
     */
    function resolveOrigin(opts, script) {
        if (opts && opts.origin) return opts.origin;
        if (script && script.getAttribute("data-vani-src")) {
            return script.getAttribute("data-vani-src");
        }
        if (script && script.src) {
            try {
                return new URL(script.src).origin;
            } catch (e) {
                /* fall through */
            }
        }
        return window.location.origin;
    }

    /**
     * Mount one Vani widget. Returns a handle with destroy() that removes the
     * iframe and every listener it registered — safe to call on SPA teardown.
     */
    function mountWidget(opts, scriptEl) {
        var origin = resolveOrigin(opts, scriptEl);
        // `free` = the current drag-resized iframe-box size {w,h} for this open session,
        // or null (use presets). Reset to null on collapse so each open is the preset.
        var state = { mode: "collapsed", width: 544, free: null };

        var iframe = document.createElement("iframe");
        iframe.src = origin + "/embed";
        iframe.title = "Vani assistant";
        iframe.allow = "microphone; autoplay; clipboard-write";
        iframe.setAttribute("allowtransparency", "true");

        // Base styles. Reset everything the host site might have set on iframes, and
        // pin to the viewport with a high z-index. `color-scheme: normal` keeps the
        // transparent background transparent under the host's dark mode.
        var base = {
            position: "fixed",
            border: "0",
            margin: "0",
            padding: "0",
            background: "transparent",
            colorScheme: "normal",
            zIndex: "2147483647", // max — sit above any host overlay
            transition: IFRAME_TRANSITION, // smooth preset/resize; killed during drag
        };
        Object.keys(base).forEach(function (k) {
            iframe.style[k] = base[k];
        });

        function isMobile() {
            return window.innerWidth < MOBILE_BREAKPOINT;
        }

        function applyCollapsed() {
            Object.assign(iframe.style, COLLAPSED);
        }

        function applyOpen(width) {
            var s = iframe.style;
            if (isMobile()) {
                // Full-screen sheet on phones.
                s.top = "0px";
                s.left = "0px";
                s.bottom = "0px";
                s.right = "0px";
                s.width = "100%";
                s.height = "100%";
                return;
            }
            // Bottom-right popup card on tablet/desktop — only the corner is covered,
            // the rest of the host page stays clickable.
            var w = Math.min((width || 544) + CARD_BUFFER, window.innerWidth);
            var h = Math.min(CARD_HEIGHT + CARD_BUFFER, window.innerHeight);
            s.top = "auto";
            s.left = "auto";
            s.bottom = "0px";
            s.right = "0px";
            s.width = w + "px";
            s.height = h + "px";
        }

        // Free drag size — anchored bottom-right like applyOpen, but width AND height
        // are arbitrary (bypasses the CARD_HEIGHT clamp), bounded by [MIN, viewport].
        function applyFree(w, h) {
            var s = iframe.style;
            s.top = "auto";
            s.left = "auto";
            s.bottom = "0px";
            s.right = "0px";
            s.width = Math.min(Math.max(w, MIN_W), window.innerWidth) + "px";
            s.height = Math.min(Math.max(h, MIN_H), window.innerHeight) + "px";
        }

        function render() {
            if (state.mode !== "open") { applyCollapsed(); return; }
            // Mobile is always a full-screen sheet — ignore any dragged desktop size.
            if (isMobile()) { applyOpen(state.width); return; }
            if (state.free) { applyFree(state.free.w, state.free.h); return; }
            applyOpen(state.width);
        }

        // Tell /embed the host form factor. It can't trust its own CSS breakpoints
        // (those key off the narrow iframe, not the host viewport), so we're the
        // source of truth for mobile-vs-desktop layout inside the iframe.
        function notifyForm() {
            if (!iframe.contentWindow) return;
            iframe.contentWindow.postMessage(
                // freeSize lets /embed switch to the fluid card immediately on open, so
                // it never flashes the 544px preset before the host applies the saved box.
                { type: "vani:host", isMobile: isMobile(), freeSize: state.free || null },
                origin
            );
        }

        // ── Free drag-resize ──────────────────────────────────────────────────────
        // The whole gesture runs inside the iframe with native pointer capture
        // (ChatWindowShell). The iframe posts `vani:resize-free` messages with the
        // desired box; we just apply them here — no host overlay needed.

        // Resize / ready / free-drag requests from /embed. Named so destroy() can
        // remove it.
        function onMessage(event) {
            if (event.origin !== origin) return; // only trust our own embed
            var data = event.data;
            if (!data) return;
            // /embed (re)mounted — answer with the current form factor.
            if (data.type === "vani:ready") {
                notifyForm();
                return;
            }
            // The iframe drives the whole drag gesture; we just apply the posted box.
            if (data.type === "vani:resize-free") {
                if (data.phase === "move" && typeof data.width === "number" && typeof data.height === "number") {
                    iframe.style.transition = "none";
                    applyFree(data.width, data.height);
                }
                if (data.phase === "end") {
                    var r = iframe.getBoundingClientRect();
                    state.free = {
                        w: Math.min(Math.max(Math.round(r.width), MIN_W), window.innerWidth),
                        h: Math.min(Math.max(Math.round(r.height), MIN_H), window.innerHeight),
                    };
                    iframe.style.transition = IFRAME_TRANSITION;
                    notifyForm();
                }
                return;
            }
            if (data.type !== "vani:resize") return;
            state.mode = data.mode === "open" ? "open" : "collapsed";
            if (typeof data.width === "number") state.width = data.width;
            // The preset path wins over a custom drag; clear free so the preset takes effect.
            if (data.mode === "open") state.free = null;
            render();
        }

        // Re-apply geometry and re-tell /embed on viewport changes (rotation, resize).
        function onResize() {
            // Never let a saved size exceed the (possibly shrunk) viewport.
            if (state.free) {
                state.free.w = Math.min(state.free.w, window.innerWidth);
                state.free.h = Math.min(state.free.h, window.innerHeight);
            }
            render();
            notifyForm();
        }

        iframe.addEventListener("load", notifyForm);
        applyCollapsed();

        function attach() {
            document.body.appendChild(iframe);
        }
        if (document.body) attach();
        else document.addEventListener("DOMContentLoaded", attach);

        window.addEventListener("message", onMessage);
        window.addEventListener("resize", onResize);

        var destroyed = false;
        return {
            destroy: function () {
                if (destroyed) return;
                destroyed = true;
                window.removeEventListener("message", onMessage);
                window.removeEventListener("resize", onResize);
                iframe.removeEventListener("load", notifyForm);
                document.removeEventListener("DOMContentLoaded", attach);
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            },
        };
    }

    // Public API for manual (SPA) callers — they always pass opts.origin, so no
    // <script> element is needed (and currentScript would be null here anyway).
    window.VaniWidget = window.VaniWidget || {
        mount: function (opts) {
            return mountWidget(opts, null);
        },
    };

    // Auto-mount for plain external <script> usage. Skipped when the tag opts out
    // with data-vani-manual="true" (our /vani page drives mount/destroy itself).
    // The __vaniWidgetLoaded guard only dedupes an accidentally double-pasted
    // snippet — it lives here, NOT inside mountWidget, so manual mounts are free.
    var manual = bootScript && bootScript.getAttribute("data-vani-manual") === "true";
    if (!manual && !window.__vaniWidgetLoaded) {
        window.__vaniWidgetLoaded = true;
        mountWidget(undefined, bootScript);
    }
})();
