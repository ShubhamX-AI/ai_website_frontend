"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LandingPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">

            {/* Background Texture/Gradient - Cool & Professional */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.5)_0%,rgba(255,255,255,0)_70%)] blur-[100px]"></div>
                <div className="absolute bottom-0 right-0 h-[800px] w-[800px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(224,242,254,0.3)_0%,rgba(255,255,255,0)_70%)] blur-[80px]"></div>
            </div>

            <main className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-12 px-6 text-center">

                {/* Logo - Clean & Corporate */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-[0_4px_24px_-4px_rgba(37,99,235,0.08)] ring-1 ring-slate-900/[0.03]"
                >
                    <Image
                        src="/int-logo.svg"
                        alt="Indusnet Technologies Logo"
                        width={48}
                        height={48}
                        priority
                        className="h-auto w-full object-contain p-3 opacity-90"
                    />
                </motion.div>

                {/* Typography - Modern & Trustworthy */}
                <div className="flex flex-col items-center gap-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
                    >
                        Welcome to <br className="hidden sm:block" />
                        <span className="text-blue-600">Indus Net Technologies</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-xl text-lg font-light leading-relaxed text-slate-500 sm:text-xl"
                    >
                        Precision-engineered AI solutions for the modern enterprise.
                    </motion.p>
                </div>

                {/* CTA Button - Primary Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-4"
                >
                    <Link
                        href="/dynamic"
                        className="group relative inline-flex"
                    >
                        <div className="relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-blue-600 px-10 text-base font-medium text-white shadow-lg shadow-blue-600/20 transition-transform duration-300 active:scale-95 group-hover:bg-blue-700">

                            <span>Start Experience</span>

                            {/* Animated Arrow */}
                            <motion.svg
                                className="h-4 w-4 text-blue-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{ x: [0, 3, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatDelay: 1 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </motion.svg>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
                        </div>

                        {/* Subtle Button Shadow/Glow */}
                        <div className="absolute top-2 left-4 right-4 -z-10 h-full rounded-full bg-blue-600/30 blur-xl transition-opacity duration-500 group-hover:opacity-50"></div>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="mt-8 flex items-center justify-center gap-6"
                    >
                        <span className="h-px w-12 bg-slate-200"></span>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                            Secure Session
                        </p>
                        <span className="h-px w-12 bg-slate-200"></span>
                    </motion.div>
                </motion.div>

            </main>

            {/* Footer - Minimal */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute bottom-8 mx-auto flex w-full max-w-7xl justify-between px-8 text-xs font-medium text-slate-400"
            >
                <div>INDUSNET © 2026</div>
                <div className="hidden sm:block">AI RESEARCH DIVISION</div>
            </motion.footer>
        </div>
    );
}
