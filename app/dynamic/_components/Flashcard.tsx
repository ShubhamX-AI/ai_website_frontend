import React from 'react';
import { FlashcardStyle } from '../_hooks/useAgentInteraction';

interface FlashcardProps {
    title: string;
    value: string;
}

type FullFlashcardProps = FlashcardProps & FlashcardStyle;

// Smart Icons based on keywords
const getIcon = (keyword: string) => {
    const k = keyword.toLowerCase();
    if (k.includes('price') || k.includes('cost') || k.includes('$') || k.includes('total')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        );
    }
    if (k.includes('location') || k.includes('address') || k.includes('place') || k.includes('city')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        );
    }
    if (k.includes('time') || k.includes('date') || k.includes('when') || k.includes('schedule')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        );
    }
    if (k.includes('phone') || k.includes('contact') || k.includes('call')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        );
    }
    if (k.includes('email') || k.includes('mail')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        );
    }
    // Default Info icon
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    );
};

// Smart Colors based on keywords
const getAccentColor = (keyword: string) => {
    const k = keyword.toLowerCase();
    if (k.includes('price') || k.includes('cost') || k.includes('$')) return 'emerald';
    if (k.includes('location') || k.includes('address')) return 'blue';
    if (k.includes('time') || k.includes('date')) return 'amber';
    if (k.includes('contact') || k.includes('phone') || k.includes('email')) return 'indigo';
    if (k.includes('error') || k.includes('warning') || k.includes('urgent')) return 'rose';
    return 'zinc';
};

const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', glow: 'bg-blue-500/10' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', glow: 'bg-amber-500/10' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', glow: 'bg-indigo-500/10' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', glow: 'bg-rose-500/10' },
    zinc: { bg: 'bg-zinc-50', text: 'text-zinc-600', ring: 'ring-zinc-100', glow: 'bg-zinc-500/10' }
};

export const Flashcard = React.memo<FullFlashcardProps>(({
    title,
    value,
    accentColor,
    theme = 'glass',
    size = 'medium',
    layout = 'default',
    image
}) => {
    const detectedColor = (accentColor as keyof typeof colorMap) || getAccentColor(title);
    const colors = colorMap[detectedColor as keyof typeof colorMap] || colorMap.zinc;
    const icon = getIcon(title);

    // Normalize size and theme for mapping
    const normalizedSize = (size === 'sm' ? 'small' : size === 'md' ? 'medium' : size === 'lg' ? 'large' : size) as 'small' | 'medium' | 'large';
    const normalizedTheme = (theme === 'highlight' || theme === 'info' || theme === 'light' ? 'glass' : theme) as 'glass' | 'solid' | 'gradient' | 'neon';

    const themeClasses: Record<'glass' | 'solid' | 'gradient' | 'neon', string> = {
        glass: 'bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-white/60',
        solid: 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100',
        gradient: `bg-gradient-to-br from-white to-${detectedColor}-50/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-zinc-100`,
        neon: `bg-zinc-900 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)] ring-1 ring-${detectedColor}-500/30`
    };

    const sizeClasses: Record<'small' | 'medium' | 'large', string> = {
        small: 'p-4 sm:p-5',
        medium: 'p-5 sm:p-6',
        large: 'p-6 sm:p-8'
    };

    // Simple Markdown-to-HTML helper (handles bolds and lists)
    const renderContent = (text: string) => {
        return text.split('\n').map((line, i) => {
            let content: React.ReactNode = line;

            // Handle lists
            if (line.trim().startsWith('- ')) {
                content = (
                    <li className="ml-4 list-disc pl-1">
                        {renderBold(line.trim().substring(2))}
                    </li>
                );
            } else {
                content = <p className="mb-1">{renderBold(line)}</p>;
            }

            return <React.Fragment key={i}>{content}</React.Fragment>;
        });
    };

    const renderBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-bold text-zinc-900 dark:text-inherit">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className={`group relative h-full w-full overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl ${themeClasses[normalizedTheme]} ${sizeClasses[normalizedSize]}`}>
            {/* Dynamic Glow effect */}
            <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full ${colors.glow} blur-3xl transition-opacity duration-700 group-hover:opacity-100`} />

            <div className={`relative z-10 flex h-full flex-col gap-4 ${layout === 'media-top' ? 'justify-start' : 'justify-between'}`}>
                {/* Header Section */}
                <div className={`flex items-center gap-3 ${layout === 'centered' ? 'flex-col items-center text-center' : ''}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${theme === 'neon' ? `bg-${detectedColor}-500/20 text-${detectedColor}-400` : `${colors.bg} ${colors.text}`} ring-1 ${colors.ring} transition-transform duration-500 group-hover:rotate-6`}>
                        {icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'neon' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {title}
                    </span>
                </div>

                {/* Media Section */}
                {image && (
                    <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
                        <img
                            src={image.url}
                            alt={image.alt}
                            className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            style={{ aspectRatio: image.aspectRatio?.replace(':', '/') || '16/9' }}
                        />
                    </div>
                )}

                {/* Value Section */}
                <div className={`flex flex-1 flex-col justify-center ${layout === 'centered' ? 'text-center' : ''}`}>
                    <div className={`text-base leading-relaxed tracking-tight sm:text-lg ${normalizedTheme === 'neon' ? 'text-zinc-100' : 'text-zinc-700'}`}>
                        {renderContent(value)}
                    </div>
                </div>

                {/* Footer Line */}
                <div className={`h-1 w-12 rounded-full ${normalizedTheme === 'neon' ? `bg-${detectedColor}-500/50` : colors.bg} transition-all duration-500 group-hover:w-full`} />
            </div>

            {/* Subtle reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
    );
});
