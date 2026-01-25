"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] text-zinc-900 selection:bg-blue-100 selection:text-blue-900">

            {/* Ultra-subtle Premium Gradient Background */}
            <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
                <div className="absolute -top-[20%] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 animate-pulse-slow rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.4)_0%,rgba(255,255,255,0)_70%)] blur-3xl opacity-60"></div>
                <div className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] animate-pulse-slow delay-1000 rounded-full bg-[radial-gradient(circle,rgba(224,231,255,0.3)_0%,rgba(255,255,255,0)_70%)] blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-10%] -left-[5%] h-[500px] w-[500px] animate-pulse-slow delay-2000 rounded-full bg-[radial-gradient(circle,rgba(238,242,255,0.4)_0%,rgba(255,255,255,0)_70%)] blur-3xl opacity-40"></div>
            </div>

            <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 text-center">

                {/* Logo - Minimal Setup */}
                <div
                    className={`flex flex-col items-center gap-6 transition-all duration-1000 ease-out ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
                        }`}
                >
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)] ring-1 ring-zinc-100/80 backdrop-blur-sm transition-transform hover:scale-105">
                        <Image
                            src="/int-logo.svg"
                            alt="Indusnet Technologies Logo"
                            width={64}
                            height={64}
                            priority
                            className="h-auto w-full object-contain p-2"
                        />
                    </div>
                </div>

                {/* Typography - Headline & Subhead */}
                <div className="space-y-6 px-4">
                    <h1
                        className={`max-w-4xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-6xl md:text-7xl lg:text-8xl lg:leading-[1.1] transition-all duration-1000 delay-100 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            }`}
                    >
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Indusnet Technologies
                        </span>
                    </h1>

                    <p
                        className={`mx-auto max-w-2xl text-base text-zinc-500 font-light leading-relaxed transition-all duration-1000 delay-200 ease-out sm:text-lg md:text-xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            }`}
                    >
                        Empowering enterprises with next-generation intelligent solutions.
                        Precision, elegance, and performance across every dimension.
                    </p>
                </div>

                {/* CTA Button - Premium & Modern */}
                <div
                    className={`pt-6 transition-all duration-1000 delay-300 ease-out sm:pt-10 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        }`}
                >
                    <Link
                        href="/dynamic"
                        className="group relative inline-flex items-center justify-center"
                    >
                        {/* Outer Glow Effect */}
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-md transition duration-1000 group-hover:opacity-40 group-hover:duration-200"></div>

                        {/* Main Button */}
                        <div className="relative flex h-14 items-center justify-center overflow-hidden rounded-xl bg-zinc-900 px-8 text-base font-semibold text-white transition-all duration-300 sm:px-12 sm:text-lg group-hover:bg-zinc-800 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                            <span className="relative z-10 flex items-center gap-3">
                                Start Experience
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 group-hover:translate-x-1 group-hover:bg-white/20">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </span>

                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                        </div>
                    </Link>
                    <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 sm:mt-8">
                        Secure AI Session • Next-Gen Interface
                    </p>
                </div>

            </main>

            {/* Footer - Minimal */}
            <footer
                className={`absolute bottom-6 w-full text-center transition-all duration-1000 delay-500 ease-out sm:bottom-10 ${mounted ? "opacity-100" : "opacity-0"
                    }`}
            >
                <div className="mx-auto flex max-w-xs flex-col items-center gap-2 px-4">
                    <div className="h-px w-8 bg-zinc-200"></div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400">
                        Premium AI Experience
                    </p>
                </div>
            </footer>
        </div>
    );
}
