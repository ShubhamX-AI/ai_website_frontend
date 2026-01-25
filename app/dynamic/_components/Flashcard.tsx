import React from 'react';

interface FlashcardProps {
    title: string;
    value: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({ title, value }) => {
    return (
        <div className="group relative w-full overflow-hidden rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-zinc-100 transition-all duration-300 sm:p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            {/* Glow effect */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-60" />

            <div className="relative z-10 flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                    {title}
                </span>
                <p className="text-lg font-medium leading-relaxed text-zinc-700">
                    {value}
                </p>
            </div>
        </div>
    );
};
