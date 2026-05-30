"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CTAButton } from "@/app/_shared/ui/CTAButton";
import { PageBackground } from "@/app/_shared/ui/PageBackground";

interface UserInfo {
    user_name: string;
    user_phone?: string;
    user_id: string;
}

export default function LandingPage() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login?logout=true");
    }

    useEffect(() => {
        console.log("Checking local storage for user_info...");
        const storedUser = localStorage.getItem("user_info");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("Found user in local storage:", parsedUser);
                setUserInfo(parsedUser);
            } catch (error) {
                console.error("Failed to parse user info from local storage:", error);
            }
        } else {
            console.log("No user info found in local storage.");
        }
    }, []);
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">

            {/* Background Texture/Gradient - Cool & Professional */}
            <PageBackground />

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
                        {/* Welcome to <br className="hidden sm:block" /> */}
                        Indus Net <span className="font-semibold text-blue-600">Technologies</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-xl text-lg font-light leading-relaxed text-slate-500 sm:text-xl"
                    >
                        AI solutions for the modern enterprise.
                    </motion.p>
                </div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-4"
                >
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">

                        {/* Primary: opens the immersive AI experience (/dynamic) */}
                        <CTAButton
                            href="/dynamic"
                            label="Talk to our website"
                            variant="primary"
                            icon={
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
                            }
                        />

                        {/* Secondary: opens the new Vani chat-window experience (/vani) */}
                        <CTAButton
                            href="/vani"
                            label="Try VANI Today"
                            variant="secondary"
                            icon={
                                <svg
                                    className="h-4 w-4 text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            }
                        />
                    </div>

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
                <div />
                <button
                    onClick={handleLogout}
                    className="text-slate-400 transition hover:text-slate-600"
                >
                    Sign out
                </button>
            </motion.footer>
        </div>
    );
}
