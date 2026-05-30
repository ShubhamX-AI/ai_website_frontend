import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentInteraction } from '@/app/_shared/hooks/useAgentInteraction';
import { useLocalParticipant, RoomAudioRenderer } from '@livekit/components-react';
import { Canvas } from './Canvas';
import { VoiceDock } from './VoiceDock';
import { useVisualMessageFilters } from './useVisualMessageFilters';

interface AgentInterfaceProps {
    onDisconnect: () => void;
    /**
     * 'immersive' — full-window experience (/dynamic). Default.
     * 'window'    — compact, tightened spacing for the Vani chat window / embed drawer.
     */
    variant?: 'immersive' | 'window';
}

/**
 * AgentInterface — the shared agent shell.
 *
 * Owns the engine (LiveKit room state via useAgentInteraction) and composes the
 * two views that always travel together:
 *   <Canvas>     — the visual board (cards, maps, forms)
 *   <VoiceDock>  — the control bar (visualizer, mic, text input)
 * Both read from the same message stream; neither works alone. Used by /dynamic
 * (immersive), the Vani window, and the /embed widget.
 */
export const AgentInterface: React.FC<AgentInterfaceProps> = ({ onDisconnect, variant = 'immersive' }) => {
    const {
        agentState,
        mode,
        setInteractionMode,
        messages,
        updateMessages,
        activeTrack,
        userTrack,
        toggleMic,
        sendText,
    } = useAgentInteraction();

    const flashcards = useMemo(() => messages.filter(m => m.type === 'flashcard'), [messages]);
    const visuals = useVisualMessageFilters(messages);
    const { locationRequestMessage } = visuals;

    const { localParticipant } = useLocalParticipant();

    // ─── Location Request Handler ────────────────────────────────────────────
    // The agent can ask for the user's geolocation silently (no UI). We resolve
    // it here, at the engine level, and publish the result back over the room.
    useEffect(() => {
        if (!locationRequestMessage || !localParticipant) return;

        const messageId = locationRequestMessage.id;
        console.log('--- GEOLOCATION: Requesting user location ---', { messageId });

        const publishLocation = (payload: object) => {
            const encoded = new TextEncoder().encode(JSON.stringify(payload));
            localParticipant.publishData(encoded, { topic: 'user.location' });
            console.log('--- GEOLOCATION: Sent to backend ---', payload);
        };

        if (!navigator.geolocation) {
            publishLocation({ status: 'unsupported' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                publishLocation({
                    status: 'success',
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
            },
            (err) => {
                console.warn('--- GEOLOCATION: Error ---', err.message);
                publishLocation({ status: 'denied', error: err.message });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationRequestMessage?.id]); // Only re-fire when a NEW location request arrives
    // ────────────────────────────────────────────────────────────────────────

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-transparent ring-1 ring-black/5 shadow-2xl">
            <RoomAudioRenderer />

            {/* Thinking / Loading Overlay */}
            <AnimatePresence>
                {agentState === 'thinking' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex items-center justify-center bg-white/10 backdrop-blur-[2px]"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.6,
                                            delay: i * 0.1,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600/80">
                                Thinking
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Canvas
                visuals={visuals}
                flashcards={flashcards}
                agentState={agentState}
                variant={variant}
                updateMessages={updateMessages}
                activeTrack={activeTrack}
                userTrack={userTrack}
            />

            <VoiceDock
                mode={mode}
                setInteractionMode={setInteractionMode}
                toggleMic={toggleMic}
                sendText={sendText}
                onDisconnect={onDisconnect}
                activeTrack={activeTrack}
                userTrack={userTrack}
                variant={variant}
            />
        </div>
    );
};
