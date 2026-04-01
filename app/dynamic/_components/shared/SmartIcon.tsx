'use client';

import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports'; // Use correct import for dynamic icons

interface SmartIconProps extends LucideProps {
    type?: 'animated' | 'static';
    iconRef: string; // The icon name
    fallback?: string;
    className?: string;
}

// 1. Dynamic Lucide Icon Loader
const iconCache: Record<string, any> = {};

const LucideIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    if (!iconCache[name]) {
        const importFn = dynamicIconImports[name as keyof typeof dynamicIconImports] || dynamicIconImports['info'];
        iconCache[name] = dynamic(importFn);
    }
    const IconComponent = iconCache[name];

    return (
        <Suspense fallback={<div className="w-5 h-5 bg-zinc-200 rounded-full animate-pulse" />}>
            <IconComponent {...props} />
        </Suspense>
    );
};

// 2. Animated Lottie Loader (Placeholder for actual Lottie files)
// In a real app, 'iconRef' would map to a URL or a JSON import.
// For now, we will simulate this or use a generic loader if a URL is provided.
const LottieIcon = ({ src, className }: { src: string; className?: string }) => {
    const [Lottie, setLottie] = useState<any>(null);
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        // Dynamic import to avoid SSR issues with some Lottie libs
        import('lottie-react').then((mod) => setLottie(() => mod.default));

        // If src is a URL, fetch it. If it's a slug, map it (mock implementation)
        if (src.startsWith('http')) {
            fetch(src)
                .then(res => res.json())
                .then(data => setAnimationData(data))
                .catch(err => console.error("Failed to load Lottie:", err));
        } else {
            // TODO: Map slugs to local JSONs
            //For prototype, we fallback to nothing or a loader
        }
    }, [src]);

    if (!Lottie || !animationData) return <div className={`animate-pulse bg-zinc-100 rounded-full ${className}`} />;

    return <Lottie animationData={animationData} loop={true} className={className} />;
};

export const SmartIcon: React.FC<SmartIconProps> = ({
    type = 'static',
    iconRef,
    fallback,
    className,
    ...props
}) => {
    // If animated and we have a valid source/ref
    if (type === 'animated') {
        return <LottieIcon src={iconRef} className={className} />;
    }

    // Default to dynamic Lucide
    // Clean the name (remove 'lucide-' prefix if present)
    const cleanName = iconRef.replace('lucide-', '').toLowerCase();

    // Check if it exists in imports, else use fallback
    const validName = (cleanName in dynamicIconImports) ? cleanName : (fallback || 'info');

    return <LucideIcon name={validName} className={className} {...props} />;
};
