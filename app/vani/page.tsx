"use client";

/**
 * Vani — chat-window experience.
 *
 * Static INT Global hero (video background, navbar, client logo marquee) with a
 * floating voice-bot launcher. The launcher (<VaniChatWindow />) mounts the shared
 * agent engine + UI from @/app/_shared/components, sized to a panel.
 * /dynamic keeps the immersive full-window experience.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { VaniChatWindow } from "./_components/VaniChatWindow";

// Background video. Change YT_VIDEO_ID to swap the clip.
// NOTE: a YouTube embed always carries some player chrome; we hide it with
// controls=0, no keyboard/captions/annotations, a click-shield, and by scaling
// the iframe past the viewport so the title/control strips crop off-screen.
// For a 100% clean background, host an .mp4 and switch this to <video>.
const YT_VIDEO_ID = "iOvGVR7Lo_A";
const YT_SRC = `https://www.youtube-nocookie.com/embed/${YT_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_VIDEO_ID}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0`;

const NAV_LINKS = [
    { label: "Services", caret: true },
    { label: "Products", caret: true },
    { label: "Industries", caret: true },
    { label: "Company", caret: true },
    { label: "Investors", caret: true },
    { label: "Partners", caret: false },
    { label: "Resources", caret: true },
    { label: "Contact Us", caret: false },
];

const CLIENT_LOGOS = [
    "TESCO Bank",
    "Cipla",
    "IndusInd Bank",
    "Honeywell",
    "Lyca Mobile",
    "KONVERGENCE®",
    "CASHPOINT",
];

export default function VaniPage() {
    return (
        <div className="relative w-full overflow-x-hidden bg-[#0a0a0a]">

            {/* ───────────────────────── HERO ───────────────────────── */}
            <section className="relative flex h-screen min-h-[680px] w-full flex-col overflow-hidden">

                {/* Background video — scaled past viewport so YouTube chrome crops off-screen */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                    <iframe
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.35]"
                        src={YT_SRC}
                        title="INT Global"
                        allow="autoplay; encrypted-media"
                        style={{ border: 0 }}
                    />
                    {/* Click-shield: blocks all player interaction (pause/seek popups) */}
                    <div className="absolute inset-0" />
                </div>

                {/* Dark gradient overlay (left-heavy) + bottom fade */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/55 to-black/15" />
                <div className="absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-t from-black/55 to-transparent" />

                {/* ── Navbar ── */}
                <nav className="relative z-50 flex items-center justify-between gap-5 px-8 py-4">
                    <Link
                        href="/landing"
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition hover:scale-105"
                        aria-label="Back to home"
                    >
                        <span className="text-lg font-extrabold tracking-tight text-white">INT.</span>
                    </Link>

                    <div className="hidden flex-1 items-center gap-1 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-xl lg:flex">
                        {NAV_LINKS.map((item) => (
                            <a
                                key={item.label}
                                href="#"
                                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-medium text-white/90 transition hover:bg-white/15 hover:text-white"
                            >
                                {item.label}
                                {item.caret && <span className="text-[10px] opacity-70">▾</span>}
                            </a>
                        ))}
                    </div>

                    <a
                        href="#"
                        className="shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(37,99,235,0.45)] transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_8px_28px_rgba(37,99,235,0.55)]"
                    >
                        Book a Free Consultation
                    </a>
                </nav>

                {/* ── Hero content ── */}
                <div className="relative z-10 flex max-w-[860px] flex-1 flex-col justify-center px-8 pt-24 sm:px-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-8 flex w-fit items-center gap-3.5 rounded-lg border border-white/40 bg-white/5 px-5 py-2.5 backdrop-blur-md"
                    >
                        <span className="text-lg font-black tracking-tight text-white">
                            Deloitte<span className="text-green-400">.</span>
                        </span>
                        <span className="h-5 w-px bg-white/30" />
                        <span className="text-[15px] font-medium tracking-wide text-white/85">
                            Technology Fast50 <span className="mx-1 text-white/40">|</span> India
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-6 text-[clamp(42px,5.5vw,68px)] font-black leading-[1.12] tracking-[-1.5px] text-white"
                    >
                        Beyond Solutions, We Build<br />
                        Success – Partnering in Your<br />
                        Growth Journey
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10 max-w-[520px] text-[17.5px] leading-relaxed text-white/80"
                    >
                        We unite Technology, Data, Cloud, Security, CX &amp; Marketing to align
                        your offerings with customer needs
                    </motion.p>

                    <motion.a
                        href="#"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="group flex w-fit items-center gap-2.5 rounded-lg border-2 border-white/85 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:translate-x-1 hover:border-white hover:bg-white/15"
                    >
                        See Us in Action
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </motion.a>
                </div>
            </section>

            {/* ───────────────────── CLIENT LOGO BAR ───────────────────── */}
            <div className="group relative z-10 flex h-20 items-center overflow-hidden border-t border-slate-200 bg-white">
                <div className="flex animate-marquee items-center whitespace-nowrap group-hover:[animation-play-state:paused]">
                    {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((name, i) => (
                        <span
                            key={i}
                            className="flex h-20 shrink-0 items-center border-r border-slate-200 px-[52px] text-[17px] font-bold tracking-tight text-slate-900 opacity-55 transition hover:opacity-90"
                        >
                            {name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Floating voice-bot launcher — the Vani experience */}
            <VaniChatWindow />
        </div>
    );
}
