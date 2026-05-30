/**
 * Vani embed loader.
 *
 * Drop this on ANY website with one line:
 *   <script src="https://YOUR-VANI-HOST/widget.js" async></script>
 *
 * It injects a single <iframe> pointing at /embed and nothing else — no global
 * CSS, no extra DOM in your tree, no library. Everything Vani draws (launcher
 * orb + chat drawer) lives inside that cross-origin iframe, so it can never
 * collide with the host page's styles or scripts, and the host can never reach
 * into Vani. The iframe resizes itself by listening to postMessage from /embed:
 *     { type: 'vani:resize', mode: 'collapsed' | 'open', width }
 *
 * Optional config via attributes on the <script> tag:
 *   data-vani-src="https://other-host"   override where /embed is served from
 *                                         (defaults to this script's own origin)
 *
 * Mic access works because the iframe is granted `allow="microphone"`. The host
 * page must be served over HTTPS for the browser to honor it.
 */
(function () {
    "use strict";

    // Run once, even if the snippet is pasted twice.
    if (window.__vaniWidgetLoaded) return;
    window.__vaniWidgetLoaded = true;

    var script = document.currentScript;

    // Where /embed lives. Defaults to the origin this script was served from.
    var origin = (script && script.getAttribute("data-vani-src")) || "";
    if (!origin && script && script.src) {
        try {
            origin = new URL(script.src).origin;
        } catch {
            origin = "";
        }
    }

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
        // Right-docked drawer on tablet/desktop — host stays clickable to its left.
        var w = Math.min(width || 420, window.innerWidth);
        s.top = "0px";
        s.left = "auto";
        s.bottom = "auto";
        s.right = "0px";
        s.width = w + "px";
        s.height = "100%";
    }

    var state = { mode: "collapsed", width: 420 };

    function render() {
        if (state.mode === "open") applyOpen(state.width);
        else applyCollapsed();
    }

    applyCollapsed();

    function mount() {
        document.body.appendChild(iframe);
    }
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);

    // Resize requests from /embed.
    window.addEventListener("message", function (event) {
        if (event.origin !== origin) return; // only trust our own embed
        var data = event.data;
        if (!data || data.type !== "vani:resize") return;
        state.mode = data.mode === "open" ? "open" : "collapsed";
        if (typeof data.width === "number") state.width = data.width;
        render();
    });

    // Re-apply geometry on viewport changes (mobile<->desktop, rotation).
    window.addEventListener("resize", render);
})();
