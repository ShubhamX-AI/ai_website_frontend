'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicImage } from './DynamicImage';

interface RichMediaProps {
    urls?: string[];
    query?: string;
    source?: 'unsplash' | 'pexels' | 'pixabay';
    aspectRatio?: 'auto' | 'video' | 'square' | 'portrait';
    alt?: string;
    mediaType?: 'image' | 'video' | 'youtube' | 'vimeo'; // Explicit override
}

type MediaType = 'image' | 'video' | 'youtube' | 'vimeo' | 'unknown';

export const RichMedia: React.FC<RichMediaProps> = ({
    urls = [],
    query,
    source,
    aspectRatio = 'video',
    alt = 'Media content',
    mediaType: explicitMediaType
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const isMuted = true;

    const safeUrls = Array.isArray(urls) ? urls : (typeof urls === 'string' ? [urls] : []);
    const firstUrl = safeUrls[0] ?? '';

    useEffect(() => {
        const resetTimer = window.setTimeout(() => {
            setCurrentIndex(0);
            setIsLoading(true);
        }, 0);

        const timer = window.setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => {
            window.clearTimeout(resetTimer);
            window.clearTimeout(timer);
        };
    }, [safeUrls.length, firstUrl, query]);

    // Helpers to detect media type
    const getMediaType = (url: string): MediaType => {
        if (explicitMediaType) return explicitMediaType; // Use explicit type if provided
        if (!url) return 'unknown';
        const u = url.toLowerCase();

        if (u.match(/\.(mp4|webm|ogg|mov|m4v)$/) || u.includes('cloudinary.com/video/upload') || u.includes('stream')) return 'video';
        if (u.includes('youtube.com') || u.includes('youtu.be') || u.includes('youtube-nocookie.com')) return 'youtube';
        if (u.includes('vimeo.com')) return 'vimeo';

        return 'image';
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getVimeoId = (url: string) => {
        const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
        return match ? match[1] : null;
    };

    const renderSingleMedia = (url: string, type: MediaType, index: number) => {
        const frameClasses = 'relative z-10 h-full w-full';
        const imageFrameClasses = 'relative z-10 flex h-full w-full items-center justify-center p-4 md:p-5';
        const imageClasses = 'h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]';

        if (type === 'video') {
            return (
                <div className={frameClasses}>
                    <video
                        src={url}
                        autoPlay
                        muted={isMuted}
                        loop
                        playsInline
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        onLoadedData={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        if (type === 'youtube') {
            const id = getYoutubeId(url);
            return (
                <div className={frameClasses}>
                    <iframe
                        src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&rel=0`}
                        className="h-full w-full pointer-events-none border-0"
                        allow="autoplay; encrypted-media"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        if (type === 'vimeo') {
            const id = getVimeoId(url);
            return (
                <div className={frameClasses}>
                    <iframe
                        src={`https://player.vimeo.com/video/${id}?autoplay=1&muted=1&background=1&loop=1`}
                        className="h-full w-full pointer-events-none border-0"
                        allow="autoplay; fullscreen"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        return (
            <>
                <div className="absolute inset-0 scale-110 opacity-30">
                    <img
                        src={url}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover blur-2xl saturate-[1.15]"
                    />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),rgba(255,255,255,0)_58%),linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0.04))]" />
                <div className={imageFrameClasses}>
                    <img
                        src={url}
                        alt={`${alt} ${index + 1}`}
                        className={imageClasses}
                        onLoad={() => setIsLoading(false)}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/1200x900/f4f4f5/71717a?text=${encodeURIComponent(alt || 'Visual')}`;
                            setIsLoading(false);
                        }}
                    />
                </div>
            </>
        );
    };

    const ratioMap = {
        auto: 'aspect-auto',
        video: 'aspect-video',
        square: 'aspect-square',
        portrait: 'aspect-[3/4]'
    };

    const containerClasses = `group relative isolate w-full overflow-hidden rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(244,244,245,0.94))] ring-1 ring-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_35px_rgba(0,0,0,0.08)] transition-all duration-500 md:rounded-[1.45rem] ${ratioMap[aspectRatio]}`;
    const autoRatioFallback = aspectRatio === 'auto' ? 'min-h-[220px] md:min-h-[260px]' : '';

    // Priority 1: Direct URLs
    if (safeUrls && safeUrls.length > 0) {
        const currentUrl = safeUrls[currentIndex] ?? safeUrls[0];
        const mediaType = getMediaType(currentUrl);

        return (
            <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className={containerClasses}>
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/35 backdrop-blur-sm">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentUrl}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="h-full w-full"
                        >
                            {renderSingleMedia(currentUrl, mediaType, currentIndex)}
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute left-3 top-3 z-30 flex gap-2">
                        {(mediaType === 'video' || mediaType === 'youtube' || mediaType === 'vimeo') && (
                            <div className="flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-white shadow-lg backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Video</span>
                            </div>
                        )}
                        {safeUrls.length > 1 && (
                            <div className="rounded-full border border-black/5 bg-white/88 px-2.5 py-1 shadow-lg backdrop-blur-md">
                                <span className="text-[10px] font-bold text-zinc-900">{currentIndex + 1} / {safeUrls.length}</span>
                            </div>
                        )}
                    </div>

                    {safeUrls.length > 1 && (
                        <>
                            <div className="absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-3 opacity-100 transition-all duration-300 md:opacity-0 md:group-hover:opacity-100">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentIndex((prev) => (prev - 1 + safeUrls.length) % safeUrls.length);
                                    }}
                                    className="rounded-full bg-white/92 p-2 text-zinc-900 shadow-xl backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white hover:scale-105 active:scale-95 md:p-2.5"
                                    aria-label="Previous visual"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentIndex((prev) => (prev + 1) % safeUrls.length);
                                    }}
                                    className="rounded-full bg-white/92 p-2 text-zinc-900 shadow-xl backdrop-blur-xl ring-1 ring-black/5 transition hover:bg-white hover:scale-105 active:scale-95 md:p-2.5"
                                    aria-label="Next visual"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 p-1.5 backdrop-blur-sm">
                                {safeUrls.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        aria-label={`Show visual ${i + 1}`}
                                        className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.04)_22%,rgba(255,255,255,0)_45%),linear-gradient(0deg,rgba(17,24,39,0.06),rgba(17,24,39,0)_30%)]" />
                </div>
            </div>
        );
    }

    // Priority 2: Dynamic Search Fallback
    if (query) {
        return (
            <div className={`${containerClasses} ${autoRatioFallback}`}>
                <DynamicImage
                    query={query}
                    source={source}
                    alt={alt || 'Dynamic Search Results'}
                    className="h-full w-full"
                />
            </div>
        );
    }

    return (
        <div className={`${containerClasses} ${autoRatioFallback}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),rgba(255,255,255,0)_55%),linear-gradient(135deg,rgba(59,130,246,0.08),rgba(161,161,170,0.03)_55%,rgba(255,255,255,0.4))]" />
            <div className="relative z-10 flex h-full min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-10 text-center md:min-h-[260px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-zinc-500 ring-1 ring-black/5 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                        <path d="M4.5 5.25A2.25 2.25 0 0 1 6.75 3h10.5A2.25 2.25 0 0 1 19.5 5.25v13.5A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75V5.25Zm2.53 11.72a.75.75 0 0 0 1.04 0l2.4-2.31a1.5 1.5 0 0 1 2.06-.02l1.95 1.83a.75.75 0 0 0 1.03-.01l1.94-1.88a.75.75 0 1 0-1.04-1.08l-1.42 1.38-1.44-1.35a3 3 0 0 0-4.12.04l-1.88 1.81a.75.75 0 0 0 0 1.59ZM8.625 9.75a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" />
                    </svg>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-800">Visual unavailable</p>
                    <p className="text-xs leading-relaxed text-zinc-500">We could not load a supporting visual for this card.</p>
                </div>
            </div>
        </div>
    );
};
