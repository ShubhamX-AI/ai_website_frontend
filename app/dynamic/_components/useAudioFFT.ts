import { useEffect, useRef, useState } from 'react';

export const useAudioFFT = (track?: MediaStreamTrack | null, fftSize: number = 128) => {
    const [data, setData] = useState<Uint8Array | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!track) {
            setData(null);
            return;
        }

        const setupAudio = async () => {
            try {
                // Cleanup previous context if exists
                if (audioContextRef.current?.state !== 'closed') {
                    audioContextRef.current?.close();
                }

                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = ctx;

                const analyser = ctx.createAnalyser();
                analyser.fftSize = fftSize;
                analyser.smoothingTimeConstant = 0.8; // Smooth out the animation
                analyserRef.current = analyser;

                const source = ctx.createMediaStreamSource(new MediaStream([track]));
                source.connect(analyser);
                sourceRef.current = source;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const update = () => {
                    if (!analyserRef.current) return;

                    analyserRef.current.getByteFrequencyData(dataArray);
                    // Create a new array to ensure React sees the change
                    // We can optimize this by checking if values changed significantly if needed
                    setData(new Uint8Array(dataArray));

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
    }, [track, fftSize]);

    return data;
};
