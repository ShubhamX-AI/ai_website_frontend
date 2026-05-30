/**
 * PageBackground — the soft radial-gradient backdrop shared by the landing
 * and Vani pages. One copy so the brand background can't drift between pages.
 */
export function PageBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
            <div className="absolute top-0 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.5)_0%,rgba(255,255,255,0)_70%)] blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 h-[800px] w-[800px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(224,242,254,0.3)_0%,rgba(255,255,255,0)_70%)] blur-[80px]"></div>
        </div>
    );
}
