'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicImage } from './DynamicImage';

interface RichMediaProps {
    urls?: string[];
    query?: string;
    source?: 'unsplash' | 'pexels' | 'pixabay';
    aspectRatio?: 'auto' | 'video' | 'square' | 'portrait';
    alt?: string;
}

type MediaType = 'image' | 'video' | 'youtube' | 'vimeo' | 'unknown';

export const RichMedia: React.FC<RichMediaProps> = ({
    urls = [],
    query,
    source,
    aspectRatio = 'video',
    alt = 'Media content'
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    const safeUrls = urls || [];

    // Reset index if URLs change
    useEffect(() => {
        setCurrentIndex(0);
        setIsLoading(true);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500); // Failsafe: max load time 2.5s

        return () => clearTimeout(timer);
    }, [safeUrls.length, safeUrls[0] || '']);

    // Helpers to detect media type
    const getMediaType = (url: string): MediaType => {
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
        const commonClasses = "h-full w-full object-cover transition-all duration-700";

        if (type === 'video') {
            return (
                <video
                    src={url}
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                    className={commonClasses}
                    onLoadedData={() => setIsLoading(false)}
                />
            );
        }

        if (type === 'youtube') {
            const id = getYoutubeId(url);
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&rel=0`}
                    className={`${commonClasses} pointer-events-none border-0`}
                    allow="autoplay; encrypted-media"
                    onLoad={() => setIsLoading(false)}
                />
            );
        }

        if (type === 'vimeo') {
            const id = getVimeoId(url);
            return (
                <iframe
                    src={`https://player.vimeo.com/video/${id}?autoplay=1&muted=1&background=1&loop=1`}
                    className={`${commonClasses} pointer-events-none border-0`}
                    allow="autoplay; fullscreen"
                    onLoad={() => setIsLoading(false)}
                />
            );
        }

        return (
            <img
                src={url}
                alt={`${alt} ${index + 1}`}
                className={`${commonClasses} group-hover:scale-105`}
                onLoad={() => setIsLoading(false)}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/800x600?text=${encodeURIComponent(alt || 'Asset')}`;
                    setIsLoading(false);
                }}
            />
        );
    };

    const ratioMap = {
        auto: 'aspect-auto',
        video: 'aspect-video',
        square: 'aspect-square',
        portrait: 'aspect-[3/4]'
    };

    const containerClasses = `relative w-full overflow-hidden rounded-[1.5rem] group ring-1 ring-black/5 shadow-inner bg-zinc-100/50 ${ratioMap[aspectRatio]}`;

    // Priority 1: Direct URLs
    if (safeUrls && safeUrls.length > 0) {
        const currentUrl = safeUrls[currentIndex];
        const mediaType = getMediaType(currentUrl);

        return (
            <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className={containerClasses}>
                    {/* Shimmer Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 z-10 bg-zinc-100/50 backdrop-blur-sm flex items-center justify-center">
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

                    {/* Media Info Badge (Video/Count) */}
                    <div className="absolute top-3 left-3 flex gap-2 z-20">
                        {(mediaType === 'video' || mediaType === 'youtube' || mediaType === 'vimeo') && (
                            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Video</span>
                            </div>
                        )}
                        {safeUrls.length > 1 && (
                            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-black/5">
                                <span className="text-[10px] font-bold text-zinc-900">{currentIndex + 1} / {safeUrls.length}</span>
                            </div>
                        )}
                    </div>

                    {/* Controls for Multiple URLs */}
                    {safeUrls.length > 1 && (
                        <>
                            <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentIndex((prev) => (prev - 1 + safeUrls.length) % safeUrls.length);
                                    }}
                                    className="p-2.5 rounded-full bg-white/95 text-zinc-900 shadow-xl backdrop-blur-xl hover:bg-white hover:scale-110 active:scale-95 z-30 ring-1 ring-black/5"
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
                                    className="p-2.5 rounded-full bg-white/95 text-zinc-900 shadow-xl backdrop-blur-xl hover:bg-white hover:scale-110 active:scale-95 z-30 ring-1 ring-black/5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Dot Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/20 backdrop-blur-sm p-1.5 rounded-full">
                                {safeUrls.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Ambient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[1.5rem] pointer-events-none" />
                </div>
            </div>
        );
    }

    // Priority 2: Dynamic Search Fallback
    if (query) {
        return (
            <div className={containerClasses}>
                <DynamicImage
                    query={query}
                    source={source}
                    alt={alt || 'Dynamic Search Results'}
                    className="h-full w-full"
                />
            </div>
        );
    }

    return null;
};
