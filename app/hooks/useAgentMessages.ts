import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';
import { RoomEvent, type TranscriptionSegment, type Participant } from 'livekit-client';
import { ChatMessage } from './agentTypes';

export function useAgentMessages() {
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    
    const [messagesMap, setMessagesMap] = useState<Map<string, ChatMessage>>(new Map());
    const messagesRef = useRef<Map<string, ChatMessage>>(new Map());
    
    // Callback to trigger context sync when stream ends - will be set by useContextSync
    const onStreamCompleteRef = useRef<(() => void) | null>(null);

    // Update messagesRef whenever state changes (keeping it in sync for listeners)
    const updateMessages = useCallback((updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => {
        setMessagesMap(prev => {
            const next = updater(prev);
            messagesRef.current = next;
            return next;
        });
    }, []);

    // Derived array
    const sortedMessages = useMemo(() => {
        return Array.from(messagesMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    }, [messagesMap]);

    useEffect(() => {
        if (!room) return;

        const onTranscription = (segments: TranscriptionSegment[], participant?: Participant) => {
            if (!participant) return;
            const senderIsAgent = participant.identity !== localParticipant?.identity;

            updateMessages((prev) => {
                const next = new Map(prev);
                for (const segment of segments) {
                    next.set(segment.id, {
                        id: segment.id,
                        type: 'text',
                        text: segment.text.replace(/\[.*?\]|<.*?>/g, '').trim(),
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
                console.log('--- INCOMING DATA CHANNEL MESSAGE ---', { topic, data });
                
                // Check either topic or data type for flashcards
                if (topic === 'ui.flashcard' || data.type === 'flashcard') {
                    const id = `card-${Date.now()}-${Math.random()}`;
                    const streamId = data.stream_id || null;

                    console.log('--- PROCESSING FLASHCARD ---', {
                        streamId,
                        card_index: data.card_index,
                        title: data.title
                    });

                    // [NEW] Handle End of Stream
                    if (data.type === 'end_of_stream') {
                        console.log('--- STREAM COMPLETED, SYNCING UI CONTEXT ---', streamId);
                        if (onStreamCompleteRef.current) {
                            onStreamCompleteRef.current();
                        }
                        return;
                    }

                    updateMessages((prev) => {
                        const next = new Map(prev);

                        // Find the current active stream_id from existing flashcards
                        const existingCards = Array.from(next.values()).filter(m => m.type === 'flashcard');
                        const currentStreamId = existingCards.length > 0
                            ? existingCards[existingCards.length - 1].cardData?.stream_id
                            : null;

                        console.log('--- STREAM COMPARISON ---', {
                            newStreamId: streamId,
                            currentStreamId: currentStreamId,
                            existingCardsCount: existingCards.length,
                            willClear: streamId && streamId !== currentStreamId
                        });

                        // If stream ID is different, clear previous cards
                        if (streamId && currentStreamId && streamId !== currentStreamId) {
                            console.log('--- CLEARING OLD STREAM ---', { oldStream: currentStreamId, newStream: streamId });
                            for (const [key, msg] of next.entries()) {
                                if (msg.type === 'flashcard') {
                                    next.delete(key);
                                }
                            }
                        }

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
                                image: data.image,
                                stream_id: streamId,
                                card_index: data.card_index,
                                // [NEW] Map new fields
                                visual_intent: data.visual_intent,
                                animation_style: data.animation_style,
                                smartIcon: data.icon ? (typeof data.icon === 'string' ? { type: 'static', ref: data.icon } : data.icon) : undefined,
                                dynamicMedia: data.media ? {
                                    ...data.media,
                                    urls: data.urls || data.media?.urls // Handle both flat 'urls' and nested 'media.urls'
                                } : undefined
                            },
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false
                        });

                        console.log('--- CARDS AFTER ADD ---', {
                            totalCards: Array.from(next.values()).filter(m => m.type === 'flashcard').length
                        });

                        return next;
                    });
                }
                // Check for agent text responses if transmitted via data channel
                else if (topic === 'ui.text' || data.type === 'agent_chat') {
                    const id = `agent-${Date.now()}`;
                    updateMessages((prev) => {
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
                else if (topic === 'user.details'){
                    console.log('--- USER DETAILS (INCOMING) ---', data);
                    // 1. Get the existing details from storage first
                    const existingStr = localStorage.getItem('user_info');
                    const existing = existingStr ? JSON.parse(existingStr) : {};
                    // 2. Merge existing with new (new fields will overwrite old ones, but old ones stay if not in new)
                    const userInfo = {
                        ...existing,
                        ...(data.user_name && { user_name: data.user_name }),
                        ...(data.user_email && { user_email: data.user_email }),
                        ...(data.user_id && { user_id: data.user_id }),
                    }
                    localStorage.setItem('user_info', JSON.stringify(userInfo));
                    console.log('--- USER DETAILS (MERGED & SAVED) ---', userInfo);
                }
            } catch (e) { /* ignore non-json or noise */ }
        };

        room.on(RoomEvent.TranscriptionReceived, onTranscription);
        room.on(RoomEvent.DataReceived, onData);

        return () => {
            room.off(RoomEvent.TranscriptionReceived, onTranscription);
            room.off(RoomEvent.DataReceived, onData);
        };
    }, [room, localParticipant, updateMessages]); // Added updateMessages to deps

    return {
        messages: sortedMessages,
        messagesRef,
        updateMessages,
        onStreamCompleteRef
    };
}
