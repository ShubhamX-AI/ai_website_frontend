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

    useEffect(() => {
        const fetchPixabayImage = async () => {
            if (source !== 'pixabay') {
                // Fallback to a reliable high-quality tech background
                setImageUrl(`https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=${width}&auto=format&fit=crop`);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await searchPixabayImages(query, {
                    imageType: 'photo',
                    orientation: 'all',
                    perPage: 3,
                    page: Math.floor(Math.random() * 10) + 1,
                    safeSearch: true,
                });

                if (response.hits && response.hits.length > 0) {
                    setImageUrl(response.hits[0].webformatURL);
                } else {
                    // No results, fallback to reliable Unsplash direct link
                    setImageUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=${width}&auto=format&fit=crop`);
                }
            } catch (err) {
                console.error('Pixabay API error:', err);
                setImageUrl(`https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=${width}&auto=format&fit=crop`);
            } finally {

                setIsLoading(false);
            }
        };

        fetchPixabayImage();
    }, [query, source, width, height]);

    const fallbackUrl = `https://placehold.co/${width}x${height}?text=${encodeURIComponent(alt)}`;

    return (
        <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 z-10 bg-zinc-100/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            )}

            {/* Image */}
            {imageUrl && (
                <Image
                    src={error ? fallbackUrl : imageUrl}
                    alt={alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setError(true);
                        setIsLoading(false);
                    }}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    quality={85}
                    priority={false}
                />
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
    );
};
