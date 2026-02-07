import { useEffect, useRef, useState } from 'react';

export interface AudioFFTOptions {
    fftSize?: number;
    smoothingTimeConstant?: number;
    minVolumeThreshold?: number;
    barCount?: number;
}

export const useAudioFFT = (track?: MediaStreamTrack | null, options: AudioFFTOptions = {}) => {
    const {
        fftSize = 128,
        smoothingTimeConstant = 0.8,
        minVolumeThreshold = 10,
        barCount
    } = options;

    const [data, setData] = useState<Uint8Array | null>(null);
    const [volume, setVolume] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!track) {
            setData(null);
            setVolume(0);
            setIsSpeaking(false);
            return;
        }

        const setupAudio = async () => {
            try {
                if (audioContextRef.current?.state !== 'closed') {
                    audioContextRef.current?.close();
                }

                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = ctx;

                const analyser = ctx.createAnalyser();
                analyser.fftSize = fftSize;
                analyser.smoothingTimeConstant = smoothingTimeConstant;
                analyserRef.current = analyser;

                const source = ctx.createMediaStreamSource(new MediaStream([track]));
                source.connect(analyser);
                sourceRef.current = source;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const update = () => {
                    if (!analyserRef.current) return;

                    analyserRef.current.getByteFrequencyData(dataArray);

                    // Calculate volume
                    let sum = 0;
                    // Focus on lower frequencies for voice volume
                    const range = Math.min(dataArray.length, 32);
                    for (let i = 0; i < range; i++) {
                        sum += dataArray[i];
                    }
                    const avgVol = sum / range;
                    setVolume(avgVol);
                    setIsSpeaking(avgVol > minVolumeThreshold);

                    // Handle sampling if barCount is provided
                    if (barCount) {
                        const sampled = new Uint8Array(barCount);
                        for (let i = 0; i < barCount; i++) {
                            const binIndex = Math.floor(i * (range / barCount));
                            sampled[i] = dataArray[binIndex];
                        }
                        setData(sampled);
                    } else {
                        setData(new Uint8Array(dataArray));
                    }

                    rafRef.current = requestAnimationFrame(update);
                };

                update();
            } catch (err) {
                console.error("Error setting up audio FFT:", err);
            }
        };

        setupAudio();

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (sourceRef.current) sourceRef.current.disconnect();
            if (analyserRef.current) analyserRef.current.disconnect();
            if (audioContextRef.current?.state !== 'closed') {
                audioContextRef.current?.close();
            }
        };
    }, [track, fftSize, smoothingTimeConstant, minVolumeThreshold, barCount]);

    return { data, volume, isSpeaking };
};
