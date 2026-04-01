import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Variants, useReducedMotion } from 'framer-motion';
import { FlashcardStyle, FlashcardMedia } from '../../hooks/agentTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SmartIcon } from './SmartIcon';
import { RichMedia } from './RichMedia';

// ─── Props ───────────────────────────────────────────────────────────────────

interface FlashcardProps {
    title: string;
    value: string;
    media?: FlashcardMedia;
    card_index?: number;
    // Layout is passed by AgentInterface based on grid context — NOT from backend
    layout?: 'default' | 'horizontal' | 'centered';
    layoutId?: string;
    shouldStreamText?: boolean;
}

type FullFlashcardProps = FlashcardProps & FlashcardStyle;

// ─── Color System ──────────────────────────────────────────────────────────
// Derived purely from visual_intent — never sent by backend

const INTENT_COLOR_MAP: Record<string, string> = {
    urgent:     'rose',
    warning:    'amber',
    success:    'emerald',
    processing: 'blue',
    cyberpunk:  'violet',
    neutral:    'zinc',
};

type CardColors = {
    bg: string; text: string; ring: string; glow: string; gradient: string;
};

const COLOR_PALETTE: Record<string, CardColors> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10', gradient: 'from-emerald-500 to-emerald-600' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-100',    glow: 'bg-blue-500/10',    gradient: 'from-blue-500 to-blue-600'    },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100',   glow: 'bg-amber-500/10',   gradient: 'from-amber-500 to-amber-600'   },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100',    glow: 'bg-rose-500/10',    gradient: 'from-rose-500 to-rose-600'    },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100',  glow: 'bg-violet-500/10',  gradient: 'from-violet-500 to-violet-600'  },
    zinc:    { bg: 'bg-zinc-50',    text: 'text-zinc-600',    ring: 'ring-zinc-100',    glow: 'bg-zinc-500/10',    gradient: 'from-zinc-500 to-zinc-600'    },
};

// ─── Animation System ────────────────────────────────────────────────────────
// Purely frontend-controlled. Cards flow in sequentially with a staggered
// spring entrance. Each card uses the same smooth spring so the set feels
// like a single cohesive wave rather than independent elements.

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 24,
        scale: 0.97,
        filter: 'blur(6px)',
    },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 280,
            damping: 28,
            mass: 0.9,
            delay: index * 0.07, // stagger: each card follows the previous by 70ms
        },
    }),
    exit: {
        opacity: 0,
        y: -12,
        scale: 0.96,
        filter: 'blur(4px)',
        transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Flashcard = React.memo(({
    title = 'Information',
    value = '',
    visual_intent,
    icon,
    media,
    card_index = 0,
    layout = 'default',
    layoutId,
    shouldStreamText = false,
}: FullFlashcardProps) => {

    // Derive accent color purely from visual_intent
    const colorKey = INTENT_COLOR_MAP[visual_intent ?? 'neutral'] ?? 'zinc';
    const colors = COLOR_PALETTE[colorKey] ?? COLOR_PALETTE.zinc;

    // Theme: neon for cyberpunk, glass for everything else
    const isNeon = visual_intent === 'cyberpunk';
    const themeClass = isNeon
        ? `bg-zinc-900 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-${colorKey}-500/50`
        : 'bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60';
    const prefersReducedMotion = useReducedMotion();
    const hasStreamedOnceRef = useRef(false);
    const [displayLength, setDisplayLength] = useState(0);

    // Media
    const hasMedia = Boolean(media?.query || (media?.urls && media.urls.length > 0));
    const showHorizontalMedia = layout === 'horizontal' && hasMedia;
    const showStackedMedia    = layout !== 'horizontal'  && hasMedia;

    const safeValue = value ?? '';

    useEffect(() => {
        if (!safeValue) {
            setDisplayLength(0);
            return;
        }

        const shouldAnimate =
            shouldStreamText &&
            !prefersReducedMotion &&
            !hasStreamedOnceRef.current;

        if (!shouldAnimate) {
            setDisplayLength(safeValue.length);
            return;
        }

        setDisplayLength(0);
        hasStreamedOnceRef.current = true;

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const totalLength = safeValue.length;

        const delay =
            totalLength > 1200 ? 16 :
            totalLength > 700  ? 18 :
            totalLength > 350  ? 22 :
            totalLength > 140  ? 26 : 30;

        const getStep = (remaining: number) => {
            if (totalLength > 1200) return Math.max(5, Math.ceil(remaining / 28));
            if (totalLength > 700) return Math.max(4, Math.ceil(remaining / 24));
            if (totalLength > 350) return Math.max(3, Math.ceil(remaining / 20));
            if (totalLength > 140) return Math.max(2, Math.ceil(remaining / 18));
            return 1;
        };

        const streamStep = (currentLength: number) => {
            if (cancelled) return;
            const remaining = totalLength - currentLength;
            if (remaining <= 0) return;

            const nextLength = Math.min(totalLength, currentLength + getStep(remaining));
            setDisplayLength(nextLength);

            if (nextLength < totalLength) {
                timeoutId = setTimeout(() => streamStep(nextLength), delay);
            }
        };

        timeoutId = setTimeout(() => streamStep(0), 120);

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [safeValue, shouldStreamText, prefersReducedMotion]);

    const visibleText = useMemo(
        () => safeValue.slice(0, displayLength),
        [safeValue, displayLength]
    );

    const renderContent = (text: string) => {
        if (!text) return null;
        return (
            <div className={`
                markdown-render 
                ${isNeon ? 'prose-invert text-zinc-300' : 'text-zinc-600'}
                prose prose-sm max-w-none
                prose-p:leading-relaxed prose-p:my-1
                prose-headings:my-2 prose-headings:font-bold prose-headings:text-inherit
                prose-strong:text-inherit prose-strong:font-bold
                prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                prose-li:my-0.5
                text-[11px] md:text-sm
                ${layout === 'centered' ? 'text-center [&>*]:text-center' : ''}
            `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </div>
        );
    };

    return (
        <motion.div
            layout
            layoutId={layoutId}
            custom={card_index}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
            className={`
                relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem]
                ${themeClass}
                p-4 md:p-6 w-full
                group flex flex-col self-start transition-colors
            `}
        >
            {/* Ambient glow */}
            <div className={`absolute -right-20 -top-20 h-40 w-40 md:h-64 md:w-64 rounded-full ${colors.glow} blur-[30px] md:blur-[60px] opacity-25 md:opacity-40`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.14)_28%,rgba(255,255,255,0)_62%)]" />

            <div className={`relative z-10 flex flex-col
                ${layout === 'horizontal' ? 'gap-4 md:flex-row md:items-center md:gap-6' : 'gap-4 md:gap-5'}
                ${layout === 'centered'   ? 'justify-center text-center items-center' : ''}
            `}>

                {/* Horizontal media (left side) */}
                {showHorizontalMedia && (
                    <div className="w-full shrink-0 md:w-[min(40%,20rem)] md:max-w-[20rem]">
                        <div className="rounded-[1.35rem] bg-white/65 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-white/70 md:rounded-[1.6rem]">
                            <RichMedia
                                urls={media?.urls}
                                query={media?.query}
                                source={media?.source}
                                alt={title}
                            />
                        </div>
                    </div>
                )}

                <div className={`flex flex-col ${layout === 'horizontal' ? 'min-w-0 flex-1 justify-center' : 'w-full'}`}>
                    {/* Header row: icon + title + status indicator */}
                    <div className={`flex items-start ${layout === 'centered' ? 'justify-center w-full relative' : 'justify-between'}`}>
                        <div className={`flex items-center gap-2 md:gap-3 ${layout === 'centered' ? 'flex-col gap-3' : ''}`}>
                            <div className={`
                                flex shrink-0 h-8 w-8 items-center justify-center rounded-lg md:h-10 md:w-10 md:rounded-[14px]
                                ${isNeon
                                    ? `bg-gradient-to-br ${colors.gradient} text-white`
                                    : `bg-white ${colors.text} ring-1 ring-zinc-100 shadow-sm`
                                }
                                transition-all duration-300 group-hover:scale-110
                            `}>
                                <SmartIcon
                                    iconRef={typeof icon === 'object' ? icon.ref : (icon || 'info')}
                                    type="static"
                                    className="w-4 h-4 md:w-5 md:h-5"
                                />
                            </div>

                            <div>
                                <h3 className={`text-xs md:text-[15px] font-bold leading-tight ${isNeon ? 'text-white' : 'text-zinc-900'}`}>
                                    {title}
                                </h3>
                            </div>
                        </div>

                        {/* Status pulse indicator */}
                        {visual_intent === 'processing' ? (
                            <div className="flex shrink-0 space-x-0.5 md:space-x-1 mt-1">
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce" />
                            </div>
                        ) : (
                            <div className={`shrink-0 w-1 h-1 md:w-2 md:h-2 rounded-full mt-1 ${visual_intent === 'urgent' ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`} />
                        )}
                    </div>

                    {/* Stacked media (inside content column) */}
                    {showStackedMedia && (
                        <div className="mt-4 rounded-[1.35rem] bg-white/65 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-white/70 md:rounded-[1.7rem]">
                            <RichMedia
                                urls={media?.urls}
                                query={media?.query}
                                source={media?.source}
                                alt={title}
                            />
                        </div>
                    )}

                    {/* Body text */}
                    <div className={`mt-3 text-sm ${isNeon ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {renderContent(visibleText)}
                        {displayLength > 0 && displayLength < safeValue.length && (
                            <span
                                aria-hidden="true"
                                className="ml-1 inline-block h-3 w-[2px] animate-pulse rounded-full bg-current align-middle opacity-50"
                            />
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

Flashcard.displayName = 'Flashcard';
