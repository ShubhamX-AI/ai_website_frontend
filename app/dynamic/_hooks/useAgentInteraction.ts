import { useCallback, useMemo, useState, useEffect } from 'react';
import {
    useVoiceAssistant,
    useLocalParticipant,
    useRoomContext,
    type TrackReferenceOrPlaceholder
} from '@livekit/components-react';
import { Track, RoomEvent, type TranscriptionSegment, type Participant } from 'livekit-client';

export type AgentState = 'listening' | 'speaking' | 'thinking' | 'idle';
export type InteractionMode = 'voice' | 'text';

// Reusing the message structure/logic but simplified for this hook
export interface FlashcardStyle {
    accentColor?: string;
    icon?: string;
    theme?: 'glass' | 'solid' | 'gradient' | 'neon' | 'highlight' | 'info' | 'light';
    size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
    layout?: 'default' | 'horizontal' | 'centered' | 'media-top';
    image?: {
        url: string;
        alt: string;
        aspectRatio?: string;
    };
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    type: 'text' | 'flashcard';
    text?: string;
    cardData?: {
        title: string;
        value: string;
    } & FlashcardStyle;
    isInterim?: boolean;
    timestamp: number;
}

export function useAgentInteraction() {
    const { state, audioTrack: agentTrack } = useVoiceAssistant();
    const { localParticipant, microphoneTrack } = useLocalParticipant();
    const room = useRoomContext();
    const [mode, setInteractionMode] = useState<InteractionMode>('voice');

    // Exclusive Mode Management
    useEffect(() => {
        if (!localParticipant) return;

        if (mode === 'voice') {
            localParticipant.setMicrophoneEnabled(true);
        } else {
            localParticipant.setMicrophoneEnabled(false);
        }
    }, [localParticipant, mode]);

    // UI Context Sync to Backend
    const syncUIContext = useCallback(() => {
        if (!localParticipant || !room || room.state !== 'connected') return;

        const isMobile = window.innerWidth < 768;
        const context = {
            type: 'ui.context',
            screen: isMobile ? 'mobile' : 'desktop',
            density: isMobile ? 'compact' : 'comfortable',
            cardSize: isMobile ? 'sm' : 'md',
            maxChars: isMobile ? 150 : 300,
            theme: 'light' // Defaulting to light as per page.tsx background
        };

        const encoder = new TextEncoder();
        console.log('--- SYNCING UI CONTEXT TO BACKEND ---', context);
        localParticipant.publishData(encoder.encode(JSON.stringify(context)), {
            reliable: true,
            topic: 'ui.context'
        });
    }, [localParticipant, room]);

    useEffect(() => {
        if (room?.state === 'connected') {
            // Sync when agent is present
            if (agentTrack) {
                console.log('--- AGENT JOINED, SYNCING UI CONTEXT ---');
                syncUIContext();
            } else {
                console.log('--- ROOM CONNECTED, WAITING FOR AGENT TO JOIN... ---');
            }

            // Sync on resize (debounced slightly)
            let timeout: NodeJS.Timeout;
            const handleResize = () => {
                clearTimeout(timeout);
                timeout = setTimeout(syncUIContext, 1000);
            };
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                clearTimeout(timeout);
            };
        }
    }, [room?.state, !!agentTrack, syncUIContext]);

    // Map-based logic for transcription + data messages
    const [messagesMap, setMessagesMap] = useState<Map<string, ChatMessage>>(new Map());

    useEffect(() => {
        if (!room) return;

        const onTranscription = (segments: TranscriptionSegment[], participant?: Participant) => {
            if (!participant) return;
            const senderIsAgent = participant.identity !== localParticipant?.identity;

            setMessagesMap((prev) => {
                const next = new Map(prev);
                for (const segment of segments) {
                    next.set(segment.id, {
                        id: segment.id,
                        type: 'text',
                        text: segment.text.replace(/\[.*?\]/g, '').trim(),
                        sender: senderIsAgent ? "agent" : "user",
                        isInterim: !segment.final,
                        timestamp: segment.firstReceivedTime,
                    });
                }
                return next;
            });
        };

        const onData = (payload: Uint8Array, participant?: Participant, _kind?: any, topic?: string) => {
            const strData = new TextDecoder().decode(payload);
            try {
                const data = JSON.parse(strData);
                // Check either topic or data type for flashcards
                if (topic === 'ui.flashcard' || data.type === 'flashcard') {
                    const id = `card-${Date.now()}-${Math.random()}`;
                    setMessagesMap((prev) => {
                        const next = new Map(prev);
                        next.set(id, {
                            id,
                            type: 'flashcard',
                            cardData: {
                                title: data.title || "Information",
                                value: data.value || JSON.stringify(data),
                                accentColor: data.accentColor,
                                icon: data.icon,
                                theme: data.theme,
                                size: data.size,
                                layout: data.layout,
                                image: data.image
                            },
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false
                        });
                        return next;
                    });
                }
                // Check for agent text responses if transmitted via data channel
                else if (topic === 'ui.text' || data.type === 'agent_chat') {
                    const id = `agent-${Date.now()}`;
                    setMessagesMap((prev) => {
                        const next = new Map(prev);
                        next.set(id, {
                            id,
                            type: 'text',
                            text: data.text || data.message || strData,
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false
                        });
                        return next;
                    });
                }
            } catch (e) { /* ignore non-json or noise */ }
        };

        room.on(RoomEvent.TranscriptionReceived, onTranscription);
        room.on(RoomEvent.DataReceived, onData);

        return () => {
            room.off(RoomEvent.TranscriptionReceived, onTranscription);
            room.off(RoomEvent.DataReceived, onData);
        };
    }, [room, localParticipant]);

    // Derived array
    const sortedMessages = useMemo(() => {
        return Array.from(messagesMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    }, [messagesMap]);


    // --- State & Tracks ---
    // Simple state mapping
    const agentState: AgentState = state === 'speaking' ? 'speaking' :
        state === 'listening' ? 'listening' : 'idle';
    // 'thinking' is not a default state in standard hook, but we can infer if needed

    const activeTrack = useMemo(() => {
        if (agentTrack?.publication) {
            return {
                participant: agentTrack.participant,
                source: Track.Source.Microphone, // Agents usually act as microphone sources
                publication: agentTrack.publication
            } as TrackReferenceOrPlaceholder;
        }
        return undefined;
    }, [agentTrack]);

    const userTrack = useMemo(() => {
        if (localParticipant && microphoneTrack) {
            return {
                participant: localParticipant,
                source: Track.Source.Microphone,
                publication: microphoneTrack
            } as TrackReferenceOrPlaceholder;
        }
        return undefined;
    }, [localParticipant, microphoneTrack]);


    // --- Actions ---
    const toggleMic = useCallback((mute: boolean) => {
        if (localParticipant) {
            // Mute = User wants silence. If they unmute, they enter Voice mode.
            if (!mute) {
                setInteractionMode('voice');
            }
            localParticipant.setMicrophoneEnabled(!mute);
        }
    }, [localParticipant]);

    const sendText = useCallback(async (text: string) => {
        if (localParticipant) {
            // Activating text mode
            setInteractionMode('text');

            // Standard LiveKit Text Stream
            await localParticipant.sendText(text, { topic: 'lk.chat' });

            // Optimistically add to UI
            const id = `local-${Date.now()}`;
            setMessagesMap((prev) => {
                const next = new Map(prev);
                next.set(id, {
                    id,
                    sender: 'user',
                    type: 'text',
                    text,
                    timestamp: Date.now(),
                    isInterim: false
                });
                return next;
            });
        }
    }, [localParticipant]);

    return {
        agentState,
        mode,
        setInteractionMode,
        messages: sortedMessages,
        activeTrack, // Agent audio
        userTrack,   // User mic
        toggleMic,
        sendText,
        roomState: room?.state
    };
}
