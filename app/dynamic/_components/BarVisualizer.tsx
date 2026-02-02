"use client";

import React, { useMemo, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';

interface BarVisualizerProps {
    agentTrack?: TrackReferenceOrPlaceholder;
    userTrack?: TrackReferenceOrPlaceholder;
    mode?: 'full' | 'mini';
    barCount?: number;
}

export const BarVisualizer: React.FC<BarVisualizerProps> = ({ 
    agentTrack, 
    userTrack, 
    mode = 'full',
    barCount: customBarCount 
}) => {
    const agentVol = useTrackVolume(agentTrack as any);
    const userVol = useTrackVolume(userTrack as any);

    // Dynamic bar count based on mode
    const barCount = customBarCount || (mode === 'mini' ? 12 : 24);

    // Audio State Logic
    const aVol = Math.max(0, agentVol || 0);
    const uVol = Math.max(0, userVol || 0);
    const isAgentSpeaking = aVol > 0.02 && aVol >= uVol;
    const activeVol = Math.max(aVol, uVol);
    const isSpeaking = activeVol > 0.01;

    // Premium Color Tokens
    const colors = {
        agent: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.4)' },
        user: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
        idle: { primary: '#94a3b8', secondary: '#64748b', glow: 'rgba(148, 163, 184, 0)' }
    };

    const activeTheme = !isSpeaking ? colors.idle : isAgentSpeaking ? colors.agent : colors.user;

    // Create a smoothed volume value to prevent "flicker"
    const smoothVol = useSpring(activeVol, {
        stiffness: 200,
        damping: 30,
        mass: 0.5
    });

    // Generate bar configurations with organic variation
    const bars = useMemo(() => {
        return Array.from({ length: barCount }).map((_, i) => {
            // Distance from center (0 to 1)
            const centerOffset = Math.abs(i - (barCount - 1) / 2) / ((barCount - 1) / 2);
            // Bell curve multiplier
            const multiplier = Math.pow(Math.cos(centerOffset * Math.PI / 2), 1.5);
            // Random jitter factor for "organic" feel
            const jitter = 0.8 + Math.random() * 0.4;
            
            return {
                multiplier: multiplier * jitter,
                delay: i * 0.01,
            };
        });
    }, [barCount]);

    return (
        <div 
            className={`
                relative flex items-center justify-center overflow-hidden
                ${mode === 'mini' ? 'h-8 w-32 gap-0.5' : 'h-24 w-full gap-1'}
            `}
            style={{
                // Fade out edges for a high-end "optical" look
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
            }}
        >
            {bars.map((bar, i) => (
                <VisualizerBar 
                    key={i}
                    volume={smoothVol}
                    theme={activeTheme}
                    multiplier={bar.multiplier}
                    mode={mode}
                    isSpeaking={isSpeaking}
                />
            ))}

            {/* Subtle background glow/halo */}
            <AnimatePresence>
                {isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle, ${activeTheme.glow} 0%, transparent 70%)`,
                            filter: 'blur(20px)'
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const VisualizerBar = ({ volume, theme, multiplier, mode, isSpeaking }: any) => {
    // Non-linear height scaling for better visual impact
    const height = useTransform(
        volume,
        [0, 0.1, 0.5, 1],
        [
            mode === 'mini' ? 4 : 8, // Base height
            mode === 'mini' ? 8 : 16, 
            mode === 'mini' ? 24 : 60, 
            mode === 'mini' ? 32 : 90  // Max height
        ]
    );

    // Apply the per-bar multiplier
    const scaledHeight = useTransform(height, (v) => v * multiplier);

    return (
        <motion.div
            style={{
                height: scaledHeight,
                backgroundColor: theme.primary,
                boxShadow: isSpeaking ? `0 0 12px ${theme.glow}` : 'none',
                width: mode === 'mini' ? '3px' : '4px',
            }}
            animate={{
                backgroundColor: theme.primary,
            }}
            transition={{
                backgroundColor: { duration: 0.4, ease: "easeInOut" }
            }}
            className="rounded-full relative z-10"
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </motion.div>
    );
};