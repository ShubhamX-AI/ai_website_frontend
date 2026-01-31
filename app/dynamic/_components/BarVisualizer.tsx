"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';

interface BarVisualizerProps {
    agentTrack?: TrackReferenceOrPlaceholder;
    userTrack?: TrackReferenceOrPlaceholder;
    mode?: 'full' | 'mini';
}

export const BarVisualizer: React.FC<BarVisualizerProps> = ({ agentTrack, userTrack, mode = 'full' }) => {
    const agentVol = useTrackVolume(agentTrack as any);
    const userVol = useTrackVolume(userTrack as any);

    // Clean volume values
    const aVol = Math.max(0, agentVol || 0);
    const uVol = Math.max(0, userVol || 0);

    // React to the louder of the two
    const maxVol = Math.max(aVol, uVol);
    
    // Smoothly determine who is speaking with a slight threshold
    const isAgentSpeaking = aVol > 0.02 && aVol >= uVol;
    const isSpeaking = maxVol > 0.02;

    // Premium Color Palette
    const agentColor = '#10b981'; // Emerald Green
    const userColor = '#3b82f6';  // Royal Blue
    const idleColor = '#e2e8f0';  // Slate 200 (softer than pure white)

    const activeColor = isAgentSpeaking ? agentColor : userColor;

    // Base height multipliers for the wave shape
    const heightMultipliers = useMemo(() => [0.3, 0.6, 0.9, 1.0, 0.9, 0.6, 0.3], []);

    return (
        <div className={`flex h-full w-full items-center justify-center ${mode === 'mini' ? 'gap-[3%] px-0.5' : 'gap-[4%] px-4'}`}>
            {heightMultipliers.map((multiplier, index) => {
                const baseHeight = mode === 'mini' ? 25 : 15;
                const sensitivity = mode === 'mini' ? 70 : 85;

                // Amplified volume specifically for this bar's multiplier
                const barVolume = Math.min(1, maxVol * 4.5) * multiplier;
                const targetHeight = baseHeight + (barVolume * sensitivity);

                // Alternate colors for the wave effect
                const isColoredBar = index % 2 !== 0;
                const currentColor = isSpeaking && isColoredBar ? activeColor : idleColor;

                // Dynamic Glow Effect (Premium touch)
                const glowOpacity = isSpeaking && isColoredBar ? Math.min(1, barVolume * 2) : 0;
                const boxShadow = `0 0 ${mode === 'mini' ? '8px' : '15px'} ${currentColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}`;

                return (
                    <motion.div
                        key={index}
                        initial={{ height: `${baseHeight}%` }}
                        animate={{
                            height: `${targetHeight}%`,
                            backgroundColor: currentColor,
                            boxShadow: boxShadow,
                        }}
                        transition={{
                            height: {
                                type: 'spring',
                                stiffness: 350, // Slightly softer for "liquid" feel
                                damping: 25,
                                mass: 0.2, // Very light for instant reactivity
                            },
                            backgroundColor: { duration: 0.3 }, // Smooth color crossfade
                            boxShadow: { duration: 0.1 }
                        }}
                        className={`${mode === 'mini' ? 'w-[7%]' : 'w-[9%]'} rounded-full`}
                        style={{
                            minHeight: mode === 'mini' ? '4px' : '8px',
                            // Add a subtle gradient to the bars for depth
                            backgroundImage: isSpeaking && isColoredBar 
                                ? `linear-gradient(to bottom, ${currentColor}dd, ${currentColor})` 
                                : 'none'
                        }}
                    />
                );
            })}
        </div>
    );
};