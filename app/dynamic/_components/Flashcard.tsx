import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashcardStyle } from '../_hooks/useAgentInteraction';
import { SmartIcon } from './SmartIcon';
import { RichMedia } from './RichMedia';

interface FlashcardProps {
    title: string;
    value: string;
    media?: any; // Add support for the media property from your data
}

type FullFlashcardProps = FlashcardProps & FlashcardStyle;

// Map visual intent to color schemes
const getIntentColors = (intent: string = 'neutral', fallbackColor: string) => {
    const map: Record<string, string> = {
        urgent: 'rose',
        warning: 'amber',
        success: 'emerald',
        processing: 'blue',
        cyberpunk: 'violet',
        neutral: 'zinc'
    };
    // If intent is valid, use it. Else fallback to the guessed 'accentColor' or 'zinc'
    const colorKey = map[intent] ? map[intent] : (fallbackColor || 'zinc');
    return colorKey;
};

// Expanded Color Map
const colorMap: Record<string, any> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', glow: 'bg-blue-500/10', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', glow: 'bg-amber-500/10', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', glow: 'bg-indigo-500/10', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', glow: 'bg-rose-500/10', border: 'border-rose-200', gradient: 'from-rose-500 to-rose-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100', glow: 'bg-violet-500/10', border: 'border-violet-200', gradient: 'from-violet-500 to-violet-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100', glow: 'bg-orange-500/10', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-100', glow: 'bg-cyan-500/10', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' },
    fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', ring: 'ring-fuchsia-100', glow: 'bg-fuchsia-500/10', border: 'border-fuchsia-200', gradient: 'from-fuchsia-500 to-fuchsia-600' },
    zinc: { bg: 'bg-zinc-50', text: 'text-zinc-600', ring: 'ring-zinc-100', glow: 'bg-zinc-500/10', border: 'border-zinc-200', gradient: 'from-zinc-500 to-zinc-600' }
};

// Fallback logic for when backend sends nothing
const guessColor = (keyword: string) => {
    const k = keyword.toLowerCase();
    if (k.includes('price') || k.includes('cost') || k.includes('money') || k.includes('success')) return 'emerald';
    if (k.includes('location') || k.includes('map') || k.includes('blue')) return 'blue';
    if (k.includes('alert') || k.includes('warn') || k.includes('time')) return 'amber';
    if (k.includes('error') || k.includes('critical')) return 'rose';
    if (k.includes('ai') || k.includes('smart')) return 'violet';
    return 'zinc';
};

export const Flashcard = React.memo<FullFlashcardProps>(({
    title = "Information",
    value = "",
    accentColor,
    icon,        // Static fallback from old interface
    smartIcon,   // New rich icon interface
    theme,
    size,
    layout = 'default',
    image,
    visual_intent,
    animation_style,
    dynamicMedia,
    media
}) => {
    // 1. Resolve Media (Handle both 'media' and 'dynamicMedia' props)
    const resolvedMedia = dynamicMedia || media;

    // 2. Determine Colors
    const detectedColorName = (accentColor as string) || getIntentColors(visual_intent, guessColor(title || value));
    const colors = colorMap[detectedColorName] || colorMap.zinc;

    // 2. Determine Styling Classes
    const normalizedSize = (size === 'sm' || size === 'small') ? 'small' : (size === 'lg' || size === 'large') ? 'large' : 'medium';
    const normalizedTheme = theme || (visual_intent === 'cyberpunk' ? 'neon' : 'glass');

    const themeClasses = {
        glass: 'bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60',
        solid: 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-zinc-100/80',
        gradient: `bg-gradient-to-br from-white via-white to-${detectedColorName}-50/40 shadow-[0_15px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100`,
        neon: `bg-zinc-900 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-${detectedColorName}-500/50`
    };

    const sizeClasses = {
        small: 'p-3 w-full max-w-[260px] md:p-4 md:max-w-[280px]',
        medium: 'p-4 gap-3 w-full max-w-[340px] md:p-6 md:gap-5 md:max-w-[420px]',
        large: 'p-6 w-full max-w-4xl md:p-8'
    };

    // 3. Animation Variants
    const variants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 }
        },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
        pop: {
            hidden: { opacity: 0, scale: 0.5 },
            visible: { opacity: 1, scale: 1, transition: { type: 'spring' } }
        },
        slide: {
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 }
        }
    };

    // Choose variant based on style
    const selectedVariant = animation_style === 'pop' ? variants.pop :
        animation_style === 'slide' ? variants.slide :
                            /* default */ variants;

    // 4. Content Renderer (Helper)
    const renderContent = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n').filter(l => l.trim());
        return lines.map((line, i) => {
            const kvMatch = line.match(/^\*\*(.*?):\*\*\s*(.*)$/);
            if (kvMatch) {
                const [, label, val] = kvMatch;
                return (
                    <div key={i} className="flex flex-col gap-0.5 mb-2 last:mb-0 md:gap-1 md:mb-3">
                        <span className={`text-[9px] font-bold uppercase tracking-widest md:text-[10px] ${normalizedTheme === 'neon' ? 'text-zinc-500' : 'text-zinc-400'}`}>{label}</span>
                        <span className={`font-medium text-xs md:text-base ${normalizedTheme === 'neon' ? 'text-zinc-100' : 'text-zinc-800'}`}>{val}</span>
                    </div>
                );
            }
            return <p key={i} className="mb-1.5 last:mb-0 text-xs leading-relaxed opacity-90 md:mb-2 md:text-sm">{line.replace(/\*\*/g, '')}</p>;
        });
    };

    return (
        <motion.div
            layout // Enable layout animations for smooth reordering
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={selectedVariant as any}
            className={`
                relative overflow-hidden rounded-[2rem] 
                ${themeClasses[normalizedTheme as keyof typeof themeClasses]} 
                ${sizeClasses[normalizedSize]}
                group transition-colors
            `}
        >
            {/* Ambient Glow */}
            <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${colors.glow} blur-[60px] opacity-40`} />

            <div className={`relative z-10 flex flex-col h-full gap-5 ${layout === 'media-top' ? 'justify-start' : 'justify-between'}`}>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Smart Icon Wrapper */}
                        <div className={`
                            flex h-10 w-10 items-center justify-center rounded-xl md:h-12 md:w-12 md:rounded-2xl
                            ${normalizedTheme === 'neon' ? `bg-gradient-to-br ${colors.gradient} text-white` : `bg-white ${colors.text} ring-1 ring-zinc-100 shadow-sm`}
                            transition-all duration-300 group-hover:scale-110
                        `}>
                            <SmartIcon
                                iconRef={smartIcon?.ref || icon || 'info'}
                                type={smartIcon?.type || 'static'}
                                className="w-5 h-5 md:w-6 md:h-6"
                            />
                        </div>

                        <div>
                            {/* <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">Insight</div> */}
                            <h3 className={`text-base font-bold leading-tight md:text-lg ${normalizedTheme === 'neon' ? 'text-white' : 'text-zinc-900'}`}>
                                {title}
                            </h3>
                        </div>
                    </div>

                    {/* Status Dot */}
                    {visual_intent === 'processing' ? (
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        </div>
                    ) : (
                        <div className={`w-2 h-2 rounded-full ${visual_intent === 'urgent' ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`} />
                    )}
                </div>

                {/* Dynamic Media / URLs / Static Image */}
                {(image || resolvedMedia) && (
                    <div className="mt-2 w-full">
                        <RichMedia
                            urls={resolvedMedia?.urls}
                            query={resolvedMedia?.query || (image ? undefined : title)}
                            source={resolvedMedia?.source}
                            aspectRatio={resolvedMedia?.aspectRatio || 'video'}
                            alt={title}
                        />
                        {/* Fallback for old static image if no dynamicMedia exists */}
                        {!resolvedMedia && image?.url && (
                            <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 aspect-video w-full">
                                <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={`text-sm ${normalizedTheme === 'neon' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {renderContent(value)}
                </div>
            </div>
        </motion.div>
    );
});
