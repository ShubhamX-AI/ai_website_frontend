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
import { INTENT_COLORS, chipIcon } from './flashcardThemes';
import { cardVariants } from './flashcardAnimations';

// ─── Props ───────────────────────────────────────────────────────────────────

interface FlashcardProps {
    title: string;
    value: string;
    media?: FlashcardMedia;
    card_index?: number;
    content_kind?: FlashcardContentKind;
    content?: FlashcardContent;
    /** rich_card: checklist rows (blue check) + footer tag pills. */
    bullets?: string[];
    chips?: string[];
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

interface RichBodyProps<T> { content: T; colorText: string; }

const StatBody = ({ content }: RichBodyProps<StatContent>) => (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
        {content.items?.map((item, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
                className="flex flex-col"
            >
                <span className="font-display text-3xl md:text-5xl font-semibold leading-none tracking-tight text-zinc-900">
                    {item.value}
                    {item.trend && (
                        <span className={`ml-1 align-middle ${item.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.trend === 'up' ? '↑' : '↓'}
                        </span>
                    )}
                </span>
                <span className="mt-1 text-sm md:text-base text-zinc-500">
                    {item.label}
                </span>
            </motion.div>
        ))}
    </div>
);

const StepsBody = ({ content, colorText }: RichBodyProps<StepsContent>) => (
    <ol className="flex flex-col gap-4">
        {content.steps?.map((step, i) => (
            <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
                className="flex items-start gap-3"
            >
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold bg-zinc-900/5 ${colorText}`}>
                    {step.icon
                        ? <SmartIcon iconRef={step.icon} type="static" className="h-4 w-4" />
                        : i + 1}
                </span>
                <div className="min-w-0">
                    <p className="text-base md:text-lg font-semibold leading-snug text-zinc-900">
                        {step.title}
                    </p>
                    {step.detail && (
                        <p className="mt-0.5 text-sm md:text-base text-zinc-600">
                            {step.detail}
                        </p>
                    )}
                </div>
            </motion.li>
        ))}
    </ol>
);

const LogoBody = ({ content, colorText }: RichBodyProps<LogoContent>) => (
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
            <span className={colorText}>
                <SmartIcon iconRef={content.icon} type="static" className="h-12 w-12 md:h-16 md:w-16" />
            </span>
        ) : null}
        <span className="font-display text-xl md:text-2xl font-semibold text-zinc-900">
            {content.name}
        </span>
        {content.caption && (
            <span className="text-sm md:text-base text-zinc-500">
                {content.caption}
            </span>
        )}
    </motion.div>
);

// ─── Markdown renderers ───────────────────────────────────────────────────────
// Plain markdown → mockup-grade visuals: blue check-circle bullets, accent-barred
// headings, gradient dividers, callouts. The per-block cascade comes from the
// `.md-stagger` CSS (globals.css); these just restyle each element. No new deps.

// Blue filled check-circle (the headline bullet visual). Inline SVG = crisp + cheap.
const CheckDot = () => (
    <svg viewBox="0 0 24 24" className="mt-[0.15em] h-[1.15rem] w-[1.15rem] shrink-0 md:h-5 md:w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#3b82f6" />
        <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Track whether the current list is ordered so <li> renders a number vs a check.
const OrderedListContext = React.createContext(false);

const MD_COMPONENTS = {
    h1: ({ children }: any) => (
        <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 mt-5 first:mt-0 mb-2">
            {children}
            <span className="mt-1.5 block h-[3px] w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
        </h1>
    ),
    h2: ({ children }: any) => (
        <h2 className="font-display text-lg md:text-xl font-semibold tracking-tight text-zinc-900 mt-5 first:mt-0 mb-2">
            {children}
            <span className="mt-1.5 block h-[3px] w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
        </h2>
    ),
    h3: ({ children }: any) => (
        <h3 className="font-display text-base md:text-lg font-semibold tracking-tight text-zinc-900 mt-4 first:mt-0 mb-1.5">{children}</h3>
    ),
    p: ({ children }: any) => (
        <p className="my-2.5 leading-[1.7] text-zinc-600">{children}</p>
    ),
    ul: ({ children }: any) => (
        <OrderedListContext.Provider value={false}>
            <ul className="my-3 flex list-none flex-col gap-2.5 pl-0">{children}</ul>
        </OrderedListContext.Provider>
    ),
    ol: ({ children }: any) => (
        <OrderedListContext.Provider value={true}>
            <ol className="my-3 flex list-none flex-col gap-2.5 pl-0 [counter-reset:md-step]">{children}</ol>
        </OrderedListContext.Provider>
    ),
    li: ({ children }: any) => {
        const ordered = React.useContext(OrderedListContext);
        if (ordered) {
            return (
                <li className="flex items-start gap-3 leading-[1.6] text-zinc-700 [counter-increment:md-step]">
                    <span className="mt-[0.1em] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[0.7rem] font-semibold text-blue-600 before:content-[counter(md-step)] md:h-6 md:w-6 md:text-xs" />
                    <span className="min-w-0">{children}</span>
                </li>
            );
        }
        return (
            <li className="flex items-start gap-3 leading-[1.6] text-zinc-700">
                <CheckDot />
                <span className="min-w-0">{children}</span>
            </li>
        );
    },
    a: ({ children, href }: any) => (
        <a href={href} target="_blank" rel="noreferrer" className="font-medium text-blue-600 underline-offset-2 decoration-blue-400 hover:underline">{children}</a>
    ),
    strong: ({ children }: any) => <strong className="font-semibold text-zinc-900">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-zinc-700">{children}</em>,
    code: ({ children }: any) => (
        <code className="rounded bg-zinc-900/5 px-1.5 py-0.5 text-[0.85em] font-medium text-blue-700">{children}</code>
    ),
    blockquote: ({ children }: any) => (
        <blockquote className="my-3 rounded-r-lg border-l-2 border-blue-300 bg-blue-50/40 py-1 pl-4 italic text-zinc-500">{children}</blockquote>
    ),
    hr: () => (
        <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
    ),
    table: ({ children }: any) => (
        <div className="my-3 overflow-hidden rounded-xl ring-1 ring-zinc-200">
            <table className="w-full border-collapse text-sm">{children}</table>
        </div>
    ),
    th: ({ children }: any) => (
        <th className="bg-zinc-50 px-3 py-2 text-left font-semibold text-zinc-700">{children}</th>
    ),
    td: ({ children }: any) => (
        <td className="border-t border-zinc-100 px-3 py-2 text-zinc-600">{children}</td>
    ),
    img: ({ src, alt }: any) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="my-3 w-full rounded-xl shadow-sm" />
    ),
};

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
    bullets,
    chips,
    layout = 'default',
    layoutId,
    shouldStreamText = false,
    chromeless = false,
}: FullFlashcardProps) => {

    // Derive accent color purely from visual_intent
    const colors = INTENT_COLORS[visual_intent ?? 'neutral'] ?? INTENT_COLORS.neutral;

    // Theme: the card floats on a soft scrim — no card box (no ring / hard shadow),
    // just a faint blur halo for legibility. `chromeless` (widget) drops the scrim
    // entirely so the card sits flat on the window glass.
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
                markdown-render md-stagger text-zinc-700
                text-[15px] md:text-lg leading-relaxed tracking-[-0.005em]
                ${layout === 'centered' ? 'text-center [&>*]:text-center' : ''}
            `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>{text}</ReactMarkdown>
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
                relative overflow-visible
                ${chromeless ? '' : 'backdrop-blur-md'}
                ${chromeless ? '' : 'p-5 md:p-8'} w-full
                group flex flex-col ${chromeless ? '' : 'h-full'} transition-colors
            `}
        >
            {/* Soft scrim: a faint blurred halo that hugs the content so text/image
                stay legible on the blue surface — reads as floating, not a card box.
                `chromeless` (widget) drops it so the card sits flat on the window glass. */}
            {!chromeless && (
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
                                ${colors.bg} ${colors.text} ring-1 ${colors.ring} shadow-sm
                                transition-all duration-300 group-hover:scale-110
                            `}>
                                <SmartIcon
                                    iconRef={typeof icon === 'object' ? icon.ref : (icon || 'info')}
                                    type="static"
                                    className="w-5 h-5 md:w-6 md:h-6"
                                />
                            </div>

                            <div>
                                <h3 className="font-display text-lg md:text-2xl font-semibold leading-tight tracking-tight text-zinc-900">
                                    {title}
                                </h3>
                                {/* Accent underline — the blue bar under the title (mockup) */}
                                <motion.span
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className={`mt-2 block h-[3px] w-10 origin-left rounded-full bg-gradient-to-r from-blue-500 to-blue-400 ${layout === 'centered' ? 'mx-auto origin-center' : ''}`}
                                />
                            </div>
                        </div>

                        {/* Status indicator — only for meaningful states (processing /
                            urgent). No decorative dot otherwise, for a clean surface. */}
                        {visual_intent === 'processing' ? (
                            <div className="flex shrink-0 space-x-1 mt-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                            </div>
                        ) : visual_intent === 'urgent' ? (
                            <div className="shrink-0 w-2 h-2 rounded-full mt-2 bg-red-500 animate-ping" />
                        ) : null}
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
                    <div className="mt-4 text-zinc-700">
                        {content_kind === 'stat' && content ? (
                            <StatBody content={content as StatContent} colorText={colors.text} />
                        ) : content_kind === 'steps' && content ? (
                            <StepsBody content={content as StepsContent} colorText={colors.text} />
                        ) : content_kind === 'logo' && content ? (
                            <LogoBody content={content as LogoContent} colorText={colors.text} />
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

                    {/* Checklist — structured bullets from rich_card (blue check rows) */}
                    {bullets && bullets.length > 0 && (
                        <ul className="md-stagger mt-5 flex list-none flex-col gap-2.5 pl-0">
                            {bullets.map((b, i) => (
                                <li key={i} className="flex items-start gap-3 text-[15px] leading-[1.5] text-zinc-700 md:text-base">
                                    <CheckDot />
                                    <span className="min-w-0">{b}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Footer chips — tag pills with auto-derived icons */}
                    {chips && chips.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-zinc-900/[0.06]">
                            <div className={`flex flex-wrap gap-2 ${layout === 'centered' ? 'justify-center' : ''}`}>
                                {chips.map((chip, i) => (
                                    <motion.span
                                        key={`${chip}-${i}`}
                                        initial={prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 240, damping: 20 }}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/[0.04] px-3 py-1.5 text-[13px] font-medium text-zinc-600 ring-1 ring-black/5"
                                    >
                                        <SmartIcon iconRef={chipIcon(chip)} type="static" className={`h-3.5 w-3.5 ${colors.text}`} />
                                        {chip}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

Flashcard.displayName = 'Flashcard';
