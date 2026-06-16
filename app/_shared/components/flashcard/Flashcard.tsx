import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    FlashcardStyle,
    FlashcardMedia,
    FlashcardContentKind,
    FlashcardContent,
    StatContent,
    StepsContent,
    LogoContent,
} from '@/app/_shared/types/agentTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SmartIcon } from '../primitives/SmartIcon';
import { RichMedia } from '../media/RichMedia';
import { INTENT_COLOR_MAP, COLOR_PALETTE } from './flashcardThemes';
import { cardVariants } from './flashcardAnimations';

// ─── Props ───────────────────────────────────────────────────────────────────

interface FlashcardProps {
    title: string;
    value: string;
    media?: FlashcardMedia;
    card_index?: number;
    content_kind?: FlashcardContentKind;
    content?: FlashcardContent;
    // Layout is passed by AgentInterface based on grid context — NOT from backend
    layout?: 'default' | 'horizontal' | 'centered';
    layoutId?: string;
    shouldStreamText?: boolean;
    /** Render flat (no scrim / glow / blur) — used in the widget where the window
     *  glass is already the surface, so a per-card scrim would nest surfaces. */
    chromeless?: boolean;
}

type FullFlashcardProps = FlashcardProps & FlashcardStyle;

// ─── Rich body renderers ──────────────────────────────────────────────────────
// Each renders a structured `content` payload. No new deps — lucide via SmartIcon,
// framer-motion (already imported) for entrance.

interface RichBodyProps<T> { content: T; isNeon: boolean; colorText: string; }

const StatBody = ({ content, isNeon }: RichBodyProps<StatContent>) => (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
        {content.items?.map((item, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
                className="flex flex-col"
            >
                <span className={`font-display text-3xl md:text-5xl font-semibold leading-none tracking-tight ${isNeon ? 'text-white' : 'text-zinc-900'}`}>
                    {item.value}
                    {item.trend && (
                        <span className={`ml-1 align-middle ${item.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.trend === 'up' ? '↑' : '↓'}
                        </span>
                    )}
                </span>
                <span className={`mt-1 text-sm md:text-base ${isNeon ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {item.label}
                </span>
            </motion.div>
        ))}
    </div>
);

const StepsBody = ({ content, isNeon, colorText }: RichBodyProps<StepsContent>) => (
    <ol className="flex flex-col gap-4">
        {content.steps?.map((step, i) => (
            <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
                className="flex items-start gap-3"
            >
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isNeon ? 'bg-white/15 text-white' : `bg-zinc-900/5 ${colorText}`}`}>
                    {step.icon
                        ? <SmartIcon iconRef={step.icon} type="static" className="h-4 w-4" />
                        : i + 1}
                </span>
                <div className="min-w-0">
                    <p className={`text-base md:text-lg font-semibold leading-snug ${isNeon ? 'text-white' : 'text-zinc-900'}`}>
                        {step.title}
                    </p>
                    {step.detail && (
                        <p className={`mt-0.5 text-sm md:text-base ${isNeon ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            {step.detail}
                        </p>
                    )}
                </div>
            </motion.li>
        ))}
    </ol>
);

const LogoBody = ({ content, isNeon, colorText }: RichBodyProps<LogoContent>) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="flex flex-col items-center gap-3 py-2 text-center"
    >
        {content.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.image_url} alt={content.name} className="h-16 w-auto object-contain md:h-20" />
        ) : content.icon ? (
            <span className={isNeon ? 'text-white' : colorText}>
                <SmartIcon iconRef={content.icon} type="static" className="h-12 w-12 md:h-16 md:w-16" />
            </span>
        ) : null}
        <span className={`font-display text-xl md:text-2xl font-semibold ${isNeon ? 'text-white' : 'text-zinc-900'}`}>
            {content.name}
        </span>
        {content.caption && (
            <span className={`text-sm md:text-base ${isNeon ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {content.caption}
            </span>
        )}
    </motion.div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const Flashcard = React.memo(({
    title = 'Information',
    value = '',
    visual_intent,
    icon,
    media,
    card_index = 0,
    content_kind = 'markdown',
    content,
    layout = 'default',
    layoutId,
    shouldStreamText = false,
    chromeless = false,
}: FullFlashcardProps) => {

    // Derive accent color purely from visual_intent
    const colorKey = INTENT_COLOR_MAP[visual_intent ?? 'neutral'] ?? 'zinc';
    const colors = COLOR_PALETTE[colorKey] ?? COLOR_PALETTE.zinc;

    // Theme: neon keeps its solid panel; everything else floats on a soft scrim —
    // no card box (no ring / hard shadow), just a faint blur halo for legibility.
    // `chromeless` (widget) drops the scrim entirely so the card sits flat on the
    // window glass.
    const isNeon = visual_intent === 'cyberpunk';
    const themeClass = isNeon
        ? `bg-zinc-900 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-${colorKey}-500/50 rounded-[1.5rem] md:rounded-[2rem]`
        : chromeless ? '' : 'backdrop-blur-md';
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
                ${isNeon ? 'prose-invert text-zinc-200' : 'text-zinc-700'}
                prose md:prose-lg max-w-none
                prose-p:leading-relaxed prose-p:my-2
                prose-headings:my-2 prose-headings:font-bold prose-headings:text-inherit
                prose-strong:text-inherit prose-strong:font-bold
                prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 [&_ul>li::marker]:text-blue-500
                prose-li:my-1
                text-base md:text-xl leading-relaxed
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
                relative ${isNeon ? 'overflow-hidden' : 'overflow-visible'}
                ${themeClass}
                ${chromeless ? 'px-5 py-5' : 'p-5 md:p-8'} w-full
                group flex flex-col h-full transition-colors
            `}
        >
            {/* Soft scrim: a faint blurred halo that hugs the content so text/image
                stay legible on the blue surface — reads as floating, not a card box.
                Neon keeps its solid panel; the scrim is non-neon only; `chromeless`
                (widget) drops it so the card sits flat on the window glass. */}
            {!isNeon && !chromeless && (
                <div className="pointer-events-none absolute -inset-3 md:-inset-5 -z-10 rounded-[2rem] md:rounded-[2.5rem] bg-[radial-gradient(120%_120%_at_50%_30%,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.42)_45%,rgba(255,255,255,0)_78%)]" />
            )}
            {/* Ambient color glow — the floating halo (non-chromeless only) */}
            {!chromeless && (
                <div className={`pointer-events-none absolute -right-16 -top-16 -z-10 h-40 w-40 md:h-64 md:w-64 rounded-full ${colors.glow} blur-[40px] md:blur-[70px] opacity-20 md:opacity-30`} />
            )}

            <div className={`relative z-10 flex flex-col
                ${layout === 'horizontal' ? 'gap-4 md:flex-row md:items-center md:gap-6' : 'gap-4 md:gap-5'}
                ${layout === 'centered'   ? 'justify-center text-center items-center' : ''}
            `}>

                {/* Horizontal media (left side) */}
                {showHorizontalMedia && (
                    <div className="w-full shrink-0 md:w-[min(40%,20rem)] md:max-w-[20rem]">
                        <RichMedia
                            urls={media?.urls}
                            query={media?.query}
                            source={media?.source}
                            alt={title}
                        />
                    </div>
                )}

                <div className={`flex flex-col ${layout === 'horizontal' ? 'min-w-0 flex-1 justify-center' : 'w-full'}`}>
                    {/* Header row: icon + title + status indicator */}
                    <div className={`flex items-start ${layout === 'centered' ? 'justify-center w-full relative' : 'justify-between'}`}>
                        <div className={`flex items-center gap-2 md:gap-3 ${layout === 'centered' ? 'flex-col gap-3' : ''}`}>
                            <div className={`
                                flex shrink-0 h-9 w-9 items-center justify-center rounded-xl md:h-11 md:w-11
                                ${isNeon
                                    ? `bg-gradient-to-br ${colors.gradient} text-white`
                                    : `${colors.text}`
                                }
                                transition-all duration-300 group-hover:scale-110
                            `}>
                                <SmartIcon
                                    iconRef={typeof icon === 'object' ? icon.ref : (icon || 'info')}
                                    type="static"
                                    className="w-5 h-5 md:w-6 md:h-6"
                                />
                            </div>

                            <div>
                                <h3 className={`font-display text-lg md:text-2xl font-semibold leading-tight tracking-tight ${isNeon ? 'text-white' : 'text-zinc-900'}`}>
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
                        <div className="mt-4">
                            <RichMedia
                                urls={media?.urls}
                                query={media?.query}
                                source={media?.source}
                                alt={title}
                            />
                        </div>
                    )}

                    {/* Body — markdown (streamed) by default, or a structured renderer */}
                    <div className={`mt-4 ${isNeon ? 'text-zinc-200' : 'text-zinc-700'}`}>
                        {content_kind === 'stat' && content ? (
                            <StatBody content={content as StatContent} isNeon={isNeon} colorText={colors.text} />
                        ) : content_kind === 'steps' && content ? (
                            <StepsBody content={content as StepsContent} isNeon={isNeon} colorText={colors.text} />
                        ) : content_kind === 'logo' && content ? (
                            <LogoBody content={content as LogoContent} isNeon={isNeon} colorText={colors.text} />
                        ) : (
                            <>
                                {renderContent(visibleText)}
                                {displayLength > 0 && displayLength < safeValue.length && (
                                    <span
                                        aria-hidden="true"
                                        className="ml-1 inline-block h-4 w-[2px] animate-pulse rounded-full bg-current align-middle opacity-50"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

Flashcard.displayName = 'Flashcard';
