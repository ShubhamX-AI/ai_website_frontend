/**
 * Layout for the embeddable widget route.
 *
 * The widget renders inside a cross-origin iframe on a third-party site, so its
 * background must be transparent — when collapsed, only the launcher orb should
 * show, never a white box. This <style> overrides the root <body> background for
 * /embed only and prevents a white flash before the page's mount effect runs.
 */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <style>{`html, body { background: transparent !important; }`}</style>
            {children}
        </>
    );
}
