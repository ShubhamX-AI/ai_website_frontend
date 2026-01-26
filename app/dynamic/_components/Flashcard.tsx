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
    if (k.includes('location') || k.includes('address') || k.includes('place') || k.includes('city') || k.includes('map')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        );
    }
    if (k.includes('time') || k.includes('date') || k.includes('when') || k.includes('schedule') || k.includes('clock')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        );
    }
    if (k.includes('phone') || k.includes('contact') || k.includes('call') || k.includes('mobile')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        );
    }
    if (k.includes('email') || k.includes('mail') || k.includes('message') || k.includes('chat')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        );
    }
    if (k.includes('marketing') || k.includes('digital') || k.includes('service') || k.includes('offer')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        );
    }
    if (k.includes('analysis') || k.includes('chart') || k.includes('stat') || k.includes('reporting')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
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
    if (k.includes('price') || k.includes('cost') || k.includes('$') || k.includes('success') || k.includes('verified')) return 'emerald';
    if (k.includes('location') || k.includes('address') || k.includes('blue') || k.includes('sky')) return 'blue';
    if (k.includes('time') || k.includes('date') || k.includes('warning') || k.includes('alert')) return 'amber';
    if (k.includes('contact') || k.includes('phone') || k.includes('email') || k.includes('marketing')) return 'indigo';
    if (k.includes('error') || k.includes('urgent') || k.includes('danger')) return 'rose';
    if (k.includes('digital') || k.includes('service') || k.includes('premium') || k.includes('ai')) return 'violet';
    if (k.includes('new') || k.includes('hot') || k.includes('trending')) return 'orange';
    return 'zinc';
};

const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10', border: 'border-emerald-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', glow: 'bg-blue-500/10', border: 'border-blue-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', glow: 'bg-amber-500/10', border: 'border-amber-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', glow: 'bg-indigo-500/10', border: 'border-indigo-200' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', glow: 'bg-rose-500/10', border: 'border-rose-200' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100', glow: 'bg-violet-500/10', border: 'border-violet-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100', glow: 'bg-orange-500/10', border: 'border-orange-200' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-100', glow: 'bg-cyan-500/10', border: 'border-cyan-200' },
    fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', ring: 'ring-fuchsia-100', glow: 'bg-fuchsia-500/10', border: 'border-fuchsia-200' },
    zinc: { bg: 'bg-zinc-50', text: 'text-zinc-600', ring: 'ring-zinc-100', glow: 'bg-zinc-500/10', border: 'border-zinc-200' }
};

export const Flashcard = React.memo<FullFlashcardProps>(({
    title = "Information",
    value = "",
    accentColor,
    icon,
    theme,
    size,
    layout = 'default',
    image
}) => {
    // Intelligence: Fallback to dynamic values if backend sends undefined
    const detectedColor = (accentColor as keyof typeof colorMap) || getAccentColor(title || value);
    const colors = colorMap[detectedColor as keyof typeof colorMap] || colorMap.zinc;
    const finalIcon = icon ? getIcon(icon) : getIcon(title || value);

    // Normalize size and theme for mapping with smarter fallbacks
    const normalizedSize = (size === 'sm' ? 'small' : size === 'md' ? 'medium' : size === 'lg' ? 'large' : (size || 'medium')) as 'small' | 'medium' | 'large';
    const normalizedTheme = (theme === 'highlight' || theme === 'info' || theme === 'light' || !theme ? 'glass' : theme) as 'glass' | 'solid' | 'gradient' | 'neon';

    const themeClasses: Record<'glass' | 'solid' | 'gradient' | 'neon', string> = {
        glass: 'bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60',
        solid: 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-zinc-100/80',
        gradient: `bg-gradient-to-br from-white via-white to-${detectedColor}-50/40 shadow-[0_15px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100`,
        neon: `bg-zinc-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.3)] ring-1 ring-${detectedColor}-500/30`
    };

    const sizeClasses: Record<'small' | 'medium' | 'large', string> = {
        small: 'p-4 sm:p-5',
        medium: 'p-6 sm:p-8',
        large: 'p-8 sm:p-10'
    };

    const renderContent = (text: string) => {
        if (!text) return null;

        // Split by lines and filter
        const lines = text.split('\n').filter(l => l.trim());

        return lines.map((line, i) => {
            // Check for "**Label:** Value" pattern
            const kvMatch = line.match(/^\*\*(.*?):\*\*\s*(.*)$/);
            if (kvMatch) {
                const [, label, val] = kvMatch;
                return (
                    <div key={i} className="group/kv flex flex-col gap-1 mb-4 last:mb-0 transition-all duration-300">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${normalizedTheme === 'neon' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {label}
                        </span>
                        <span className={`text-base font-medium tracking-tight ${normalizedTheme === 'neon' ? 'text-white' : 'text-zinc-900'}`}>
                            {val}
                        </span>
                    </div>
                );
            }

            let content: React.ReactNode = line;
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                content = (
                    <li className="ml-4 list-disc pl-1 mb-2">
                        {renderBold(line.trim().substring(2))}
                    </li>
                );
            } else {
                content = <p className="mb-3 last:mb-0 leading-relaxed">{renderBold(line)}</p>;
            }
            return <React.Fragment key={i}>{content}</React.Fragment>;
        });
    };

    const renderBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className={`font-bold ${normalizedTheme === 'neon' ? 'text-white' : 'text-zinc-900'}`}>
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className={`group relative h-full w-full overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] hover:translate-y-[-4px] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] ${themeClasses[normalizedTheme]} ${sizeClasses[normalizedSize]}`}>
            {/* Dynamic Ambient Background Glow */}
            <div className={`absolute -right-32 -top-32 h-96 w-96 rounded-full ${colors.glow} blur-[100px] transition-all duration-1000 group-hover:scale-150 group-hover:opacity-100 opacity-40`} />
            <div className={`absolute -left-32 -bottom-32 h-64 w-64 rounded-full ${colors.glow} blur-[80px] transition-all duration-1000 group-hover:scale-150 group-hover:opacity-60 opacity-20`} />

            <div className={`relative z-10 flex h-full flex-col gap-6 ${layout === 'media-top' ? 'justify-start' : 'justify-between'}`}>
                {/* Header Section */}
                <div className={`flex items-start justify-between ${layout === 'centered' ? 'flex-col items-center text-center' : ''}`}>
                    <div className="flex flex-col gap-3">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] ${normalizedTheme === 'neon' ? `bg-gradient-to-br from-${detectedColor}-500 to-${detectedColor}-600 text-white` : `bg-gradient-to-br from-${detectedColor}-50 to-${detectedColor}-100/50 ${colors.text}`} ring-1 ${colors.ring.replace('100', '200')} shadow-xl shadow-${detectedColor}-500/10 transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-110`}>
                            {finalIcon}
                        </div>
                        <div className="space-y-1">
                            {/* <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${normalizedTheme === 'neon' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                Data Insight
                            </span> */}
                            <h3 className={`text-xl font-bold tracking-tight leading-tight ${normalizedTheme === 'neon' ? 'text-white' : 'text-zinc-900'}`}>
                                {title}
                            </h3>
                        </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>

                {/* Media Section */}
                {image && (
                    <div className="group/image relative overflow-hidden rounded-3xl ring-1 ring-black/5 shadow-2xl">
                        <img
                            src={image.url}
                            alt={image.alt || title}
                            className="h-auto w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            style={{ aspectRatio: image.aspectRatio?.replace(':', '/') || '16/9' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
                    </div>
                )}

                {/* Value Section */}
                <div className={`flex flex-1 flex-col justify-center ${layout === 'centered' ? 'text-center' : ''}`}>
                    <div className={`text-[15px] leading-relaxed tracking-tight sm:text-[17px] ${normalizedTheme === 'neon' ? 'text-zinc-300' : 'text-zinc-600/90'}`}>
                        {renderContent(value)}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between border-t border-zinc-100/10 pt-4">
                    <div className="flex gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${colors.bg} ${colors.text.replace('text', 'bg')}`} />
                        <div className={`h-1.5 w-6 rounded-full bg-zinc-100 transition-all duration-500 group-hover:w-12 group-hover:${colors.bg}`} />
                    </div>
                    <button className={`text-[10px] flex items-center gap-1.5 font-bold ${colors.text} uppercase tracking-[0.15em] opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0`}>
                        Action Needed
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>

            {/* Premium Textures & Overlays */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
    );
});

