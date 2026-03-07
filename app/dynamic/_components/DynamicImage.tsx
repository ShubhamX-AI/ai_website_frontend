'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { searchPixabayImages } from '@/lib/pixabay';

interface DynamicImageProps {
    query?: string;
    source?: 'unsplash' | 'pexels' | 'local' | 'pixabay';
    alt: string;
    className?: string;
    width?: number;
    height?: number;
}

export const DynamicImage: React.FC<DynamicImageProps> = ({
    query = 'technology',
    source = 'pixabay',
    alt,
    className,
    width = 800,
    height = 600
}) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const requestWidth = Math.max(width, 1400);
    const fallbackUrl = `https://placehold.co/${Math.max(width, 1200)}x${Math.max(height, 900)}/f4f4f5/71717a?text=${encodeURIComponent(alt)}`;

    useEffect(() => {
        const fetchPixabayImage = async () => {
            setError(false);

            if (source !== 'pixabay') {
                setImageUrl(`https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=90&w=${requestWidth}&auto=format&fit=max`);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                let response = await searchPixabayImages(query, {
                    imageType: 'photo',
                    orientation: 'all',
                    perPage: 3,
                    page: 1,
                    safeSearch: true,
                });

                if (response.hits && response.hits.length === 0) {
                    const fallbackQuery = query.split(' ')[0] || 'business';
                    response = await searchPixabayImages(fallbackQuery, {
                        imageType: 'photo',
                        orientation: 'all',
                        perPage: 3,
                        page: Math.floor(Math.random() * 3) + 1,
                        safeSearch: true,
                    });
                }

                if (response.hits && response.hits.length > 0) {
                    setImageUrl(response.hits[0].webformatURL);
                } else {
                    setImageUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?q=90&w=${requestWidth}&auto=format&fit=max`);
                }
            } catch (err) {
                console.error('Pixabay API error:', err);
                setImageUrl(`https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=90&w=${requestWidth}&auto=format&fit=max`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPixabayImage();
    }, [query, source, requestWidth, alt]);

    const displayUrl = error ? fallbackUrl : imageUrl;

    return (
        <div
            className={`relative h-full w-full overflow-hidden bg-zinc-100 ${className || ''}`}
        >
            {isLoading && (
                <div className="absolute inset-0 z-10 bg-zinc-100/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}

            {displayUrl && (
                <>
                    <div className="absolute inset-0 scale-110 opacity-35">
                        <Image
                            src={displayUrl}
                            alt=""
                            aria-hidden
                            fill
                            sizes="100vw"
                            className="object-cover blur-2xl saturate-[1.12]"
                            quality={70}
                        />
                    </div>

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),rgba(255,255,255,0)_58%),linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.02))]" />

                    <div className="relative z-10 flex h-full w-full items-center justify-center p-4 md:p-5">
                        <Image
                            src={displayUrl}
                            alt={alt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 40vw"
                            className="object-contain p-0 transition-transform duration-700"
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                if (!error) {
                                    setError(true);
                                }
                                setIsLoading(false);
                            }}
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                            quality={85}
                            priority={false}
                        />
                    </div>
                </>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10" />
        </div>
    );
};
