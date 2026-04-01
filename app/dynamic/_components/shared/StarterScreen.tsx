'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SmartIcon } from './SmartIcon';

interface StarterScreenProps {
    activeTrack?: any;
    userTrack?: any;
}

const questions = [
    {
        text: "Wanna know where our company is located?",
        icon: "map-pin",
        description: "Find our global offices and reach out to us in person.",
        color: "blue"
    },
    {
        text: "Wanna know about the opportunities in careers?",
        icon: "briefcase",
        description: "Explore exciting roles and join our team of innovators.",
        color: "violet"
    },
    {
        text: "Wanna know about our services?",
        icon: "layers",
        description: "Discover how we can help your business grow with our solutions.",
        color: "emerald"
    },
    {
        text: "Wanna know more about our company?",
        icon: "building-2",
        description: "Learn about our vision, mission, and the legacy we're building.",
        color: "amber"
    }
];

const colorMap: Record<string, any> = {
    blue: {
        text: "text-blue-600",
        glow: "bg-blue-500/10",
        dot: "bg-blue-500"
    },
    violet: {
        text: "text-violet-600",
        glow: "bg-violet-500/10",
        dot: "bg-violet-500"
    },
    emerald: {
        text: "text-emerald-600",
        glow: "bg-emerald-500/10",
        dot: "bg-emerald-500"
    },
    amber: {
        text: "text-amber-600",
        glow: "bg-amber-500/10",
        dot: "bg-amber-500"
    }
};

export const StarterScreen: React.FC<StarterScreenProps> = () => {
    return (
        <div className="flex w-full max-w-6xl flex-col items-center gap-10 pt-4 pb-12 md:gap-16 md:py-24">
            {/* Header section */}
            <div className="flex flex-col items-center text-center px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black tracking-tight text-zinc-800 md:text-6xl"
                >
                    How can I help you today?
                </motion.h1>
            </div>

            {/* Questions Grid */}
            <div className="grid w-full grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:gap-8 xl:px-0">
                {questions.map((q, idx) => (
                    <motion.button
                        key={idx}
                        layoutId={`flashcard-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                        className="group relative flex flex-col items-start gap-5 overflow-hidden rounded-[2.5rem] bg-white/70 p-8 text-left backdrop-blur-2xl ring-1 ring-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
                    >
                        {/* Ambient Glow Overlay (Matches Flashcard style) */}
                        <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full ${colorMap[q.color].glow} blur-[40px] opacity-40`} />

                        <div className="flex w-full items-start justify-between">
                            {/* Icon Wrapper */}
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 ${colorMap[q.color].text}`}>
                                <SmartIcon iconRef={q.icon} className="h-6 w-6" />
                            </div>

                            {/* Status indicator dot */}
                            <div className={`mt-2 h-1.5 w-1.5 rounded-full ${colorMap[q.color].dot} opacity-40`} />
                        </div>

                        <div className="relative z-10 flex-1">
                            <h3 className="text-xl font-bold tracking-tight text-zinc-900">
                                {q.text}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-500/90 font-medium">
                                {q.description}
                            </p>
                        </div>

                        {/* Interactive footer line */}
                        {/* <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-600 transition-colors">
                            Click to ask
                            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div> */}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
