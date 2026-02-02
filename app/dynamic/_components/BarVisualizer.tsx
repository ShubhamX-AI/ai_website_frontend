"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { useAudioFFT } from './useAudioFFT';

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
    // access the raw media stream tracks
    const agentMediaTrack = agentTrack?.publication?.track?.mediaStreamTrack;
    const userMediaTrack = userTrack?.publication?.track?.mediaStreamTrack;

    // Get FFT data for both (fftSize 128 -> 64 bins, enough for visualizer)
    const agentData = useAudioFFT(agentMediaTrack, 128);
    const userData = useAudioFFT(userMediaTrack, 128);

    // Dynamic bar count based on mode
    const barCount = customBarCount || (mode === 'mini' ? 12 : 30);

    // Compute activity to determine colors
    const getAverageVolume = (data: Uint8Array | null) => {
        if (!data) return 0;
        let sum = 0;
        // We only care about the lower frequency range where voice usually is
        const range = Math.min(data.length, barCount);
        for (let i = 0; i < range; i++) {
            sum += data[i];
        }
        return sum / range;
    };

    const agentVol = getAverageVolume(agentData);
    const userVol = getAverageVolume(userData);

    // Thresholds (0-255 scale)
    const isAgentSpeaking = agentVol > 10;
    const isUserSpeaking = userVol > 10;
    const isSpeaking = isAgentSpeaking || isUserSpeaking;

    // Premium Color Tokens
    const colors = {
        agent: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.4)' },
        user: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
        idle: { primary: '#94a3b8', secondary: '#64748b', glow: 'rgba(148, 163, 184, 0)' }
    };

    // Determine active theme
    // Prioritize Agent if both are speaking (or maybe mix?) -> sticking to one dominant color implies clarity
    const activeTheme = isAgentSpeaking ? colors.agent : (isUserSpeaking ? colors.user : colors.idle);

    // Combine data: We want to visualize whoever is speaking essentially.
    const combinedData = useMemo(() => {
        const result = new Uint8Array(barCount);
        // Map FFT bins to bars. 
        // We usually have 64 bins. We want to sample them to fit `barCount`.
        const sourceData = (isAgentSpeaking && !isUserSpeaking) ? agentData :
            (!isAgentSpeaking && isUserSpeaking) ? userData :
                // If both or neither, combine max
                null;

        for (let i = 0; i < barCount; i++) {
            // Map bar index to FFT bin index (focus on lower half of spectrum for voice)
            // Voice is typically in lower frequencies. 
            // 64 bins covers 0 - Nyquist (e.g. 24kHz). 
            // We want 0 - 4kHz ideally. So first ~10-15 bins are most relevant.
            // Let's stretch the first 24-30 bins across the bars.
            const binIndex = Math.floor(i * (32 / barCount)); // Use first 32 bins

            let val = 0;
            if (sourceData) {
                val = sourceData[binIndex] || 0;
            } else {
                // Mix or idle
                const aVal = agentData ? agentData[binIndex] : 0;
                const uVal = userData ? userData[binIndex] : 0;
                val = Math.max(aVal, uVal);
            }
            result[i] = val;
        }
        return result;
    }, [agentData, userData, barCount, isAgentSpeaking, isUserSpeaking]);


    return (
        <div
            className={`
                relative flex items-center justify-center w-full h-full
                ${mode === 'mini' ? 'gap-0.5' : 'gap-1'}
            `}
            style={{
                // Fade out edges for a high-end "optical" look
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
            }}
        >
            {Array.from({ length: barCount }).map((_, i) => (
                <VisualizerBar
                    key={i}
                    value={combinedData[i]} // 0-255
                    theme={activeTheme}
                    mode={mode}
                    isSpeaking={isSpeaking}
                    index={i}
                    total={barCount}
                />
            ))}
        </div>
    );
};

const VisualizerBar = ({ value, theme, mode, isSpeaking, index, total }: any) => {
    // Enhance the value with some shaping (bell curve) to avoid "wall of sound" look if input is flat
    // but relies mostly on FFT data.

    // Scale 0-255 to height pixels
    // Min height when idle: 4px
    // Max height: container height (approx 48-64px?)

    // Normalize value 0-1
    const norm = value / 255;

    // Apply a slight bell curve attenuation to edges to keep the "focused" look?
    const centerOffset = Math.abs(index - (total - 1) / 2) / ((total - 1) / 2); // 0 at center, 1 at edges
    const positionMultiplier = 0.5 + 0.5 * Math.pow(Math.cos(centerOffset * Math.PI / 2), 0.5); // 1.0 at center, 0.5 at edges

    // Calculate target height
    const baseHeight = mode === 'mini' ? 4 : 6;
    const maxHeight = mode === 'mini' ? 24 : 64; // Adjusted max height to fit typical container

    const targetHeight = baseHeight + (norm * (maxHeight - baseHeight) * positionMultiplier);

    return (
        <motion.div
            initial={{ height: baseHeight }}
            animate={{
                height: targetHeight,
                backgroundColor: theme.primary,
            }}
            transition={{
                height: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.5
                },
                backgroundColor: { duration: 0.2 }
            }}
            style={{
                boxShadow: isSpeaking && value > 10 ? `0 0 12px ${theme.glow}` : 'none',
                width: mode === 'mini' ? '3px' : '4px',
                minWidth: mode === 'mini' ? '3px' : '4px',
            }}
            className="rounded-full relative z-10 flex-shrink-0"
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </motion.div>
    );
};