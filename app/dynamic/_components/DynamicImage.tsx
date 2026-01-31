'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface DynamicImageProps {
    query?: string;
    source?: 'unsplash' | 'pexels' | 'local';
    alt: string;
    className?: string;
    width?: number;
    height?: number;
}

export const DynamicImage: React.FC<DynamicImageProps> = ({
    query = 'technology',
    source = 'unsplash',
    alt,
    className,
    width = 800,
    height = 600
}) => {
    const [error, setError] = useState(false);

    // Construct URL based on source
    // Note: source.unsplash.com is deprecated but often mapped; 
    // better to use a specific service or user-provided key in production.
    // For this prototype, we use a reliable placeholder service that supports keywords 
    // if the main one fails, or try a direct typically working public endpoint if available.

    // Using a robust placeholder service for demo stability:
    // https://placehold.co doesn't do keywords well visually.
    // https://loremflickr.com/ is good for keywords.
    const getUrl = () => {
        const encodedQuery = encodeURIComponent(query);
        // Using Lorem Flickr search for reliable keyword-based variety
        return `https://loremflickr.com/${width}/${height}/${encodedQuery},technology/all`;
    };

    const imageUrl = error ? `https://placehold.co/${width}x${height}?text=${encodeURIComponent(alt)}` : getUrl();

    return (
        <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
            {/* We use standard img tag here to avoid Next.js Image Config External Domain errors for random sources,
                 or we must configure next.config.ts to allow all domains. 
                 Safest for 'dynamic wild sources' is standard img with unoptimized prop if using Next Image, 
                 or just <img />. */}
            <img
                src={imageUrl}
                alt={alt}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                onError={() => setError(true)}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
    );
};
