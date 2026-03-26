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
                let changed = false;

                for (const segment of segments) {
                    const cleanText = segment.text.replace(/\[.*?\]|<.*?>/g, '').trim();
                    if (!cleanText && segment.final) continue; // Skip empty final segments

                    const existing = next.get(segment.id);
                    if (existing && existing.text === cleanText && existing.isInterim === !segment.final) {
                        continue; // No change, skip update
                    }

                    next.set(segment.id, {
                        id: segment.id,
                        type: 'text',
                        text: cleanText,
                        sender: senderIsAgent ? "agent" : "user",
                        isInterim: !segment.final,
                        timestamp: segment.firstReceivedTime,
                    });
                    changed = true;
                }
                return changed ? next : prev;
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
                                stream_id: streamId,
                                card_index: data.card_index,
                                visual_intent: data.visual_intent,
                                icon: data.icon,
                                media: data.media ? {
                                    urls: data.media.urls,
                                    query: data.media.query,
                                    source: data.media.source,
                                } : undefined,
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
                else if (topic === 'user.details') {
                    console.log('--- USER DETAILS (INCOMING) ---', data);
                    // 1. Get the existing details from storage first
                    const existingStr = localStorage.getItem('user_info');
                    const existing = existingStr ? JSON.parse(existingStr) : {};
                    // 2. Merge existing with new (new fields will overwrite old ones, but old ones stay if not in new)
                    const userInfo = {
                        ...existing,
                        ...(data.user_name && { user_name: data.user_name }),
                        ...(data.user_email && { user_email: data.user_email }),
                        ...(data.user_phone && { user_phone: data.user_phone }),
                        ...(data.user_id && { user_id: data.user_id }),
                    }
                    localStorage.setItem('user_info', JSON.stringify(userInfo));
                    console.log('--- USER DETAILS (MERGED & SAVED) ---', userInfo);
                }
                else if (data.type === 'map.polyline') {
                    const id = `map-polyline-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    console.log('--- MAP POLYLINE (EXTRACTING) ---', {
                        hasDataNested: !!data.data,
                        keys: data.data ? Object.keys(data.data) : Object.keys(data)
                    });

                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(id, {
                            id,
                            type: 'map_polyline',
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false,
                            mapPolylineData: {
                                polyline: data.data?.polyline || data.polyline,
                                origin: data.data?.origin || data.origin,
                                destination: data.data?.destination || data.destination,
                                travelMode: (data.data?.travelMode || data.travelMode) as any,
                                distance: data.data?.distance || data.distance,
                                duration: data.data?.duration || data.duration,
                                mode_label: data.data?.mode_label || data.mode_label,
                                destination_image_url: data.data?.destination_image_url || data.destination_image_url,
                            }
                        });
                        return next;
                    });
                }
                else if (topic === 'ui.location_request' || data.type === 'location_request') {
                    // Check if this location request actually contains polyline data (some backends wrap them)
                    if (data.data?.polyline || data.polyline || data.type === 'map.polyline' || data.data?.type === 'map.polyline') {
                        const id = `map-polyline-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                        console.log('--- MAP POLYLINE (DETECTED INSIDE LOCATION REQ) ---', data);
                        updateMessages((prev) => {
                            const next = new Map(prev);
                            next.set(id, {
                                id,
                                type: 'map_polyline',
                                sender: 'agent',
                                timestamp: Date.now(),
                                isInterim: false,
                                mapPolylineData: {
                                    polyline: data.data?.polyline || data.polyline,
                                    origin: data.data?.origin || data.origin,
                                    destination: data.data?.destination || data.destination,
                                    travelMode: (data.data?.travelMode || data.travelMode) as any,
                                    distance: data.data?.distance || data.distance,
                                    duration: data.data?.duration || data.duration,
                                    mode_label: data.data?.mode_label || data.mode_label,
                                    destination_image_url: data.data?.destination_image_url || data.destination_image_url,
                                }
                            });
                            return next;
                        });
                        return;
                    }

                    const id = `location-req-${Date.now()}`;
                    console.log('--- LOCATION REQUEST (INCOMING) ---', data);

                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(id, {
                            id,
                            type: 'location_request',
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false,
                            locationRequestData: {
                                reason: data.reason || undefined,
                            }
                        });
                        return next;
                    });

                    // Safety net: auto-dismiss after 30s in case geolocation never resolves
                    setTimeout(() => {
                        updateMessages((prev) => {
                            const next = new Map(prev);
                            next.delete(id);
                            return next;
                        });
                    }, 30000);
                }
                else if (topic === 'ui.contact_form' || data.type === 'contact_form' || data.type === 'contact_form_submit') {
                    const isSubmit = data.type === 'contact_form_submit';
                    const msgType = isSubmit ? 'contact_form_submit' : 'contact_form';
                    const id = `${msgType}-${Date.now()}`;
                    console.log(`--- CONTACT FORM (${isSubmit ? 'submitted' : 'preview'}) ---`, data);

                    updateMessages((prev) => {
                        const next = new Map(prev);

                        // Clear previous contact_form previews on submit so screen is clean after dismiss
                        if (isSubmit) {
                            for (const [key, msg] of next.entries()) {
                                if (msg.type === 'contact_form') {
                                    next.delete(key);
                                }
                            }
                        }

                        next.set(id, {
                            id,
                            type: msgType,
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false,
                            contactFormData: {
                                user_name: data.data?.user_name || data.user_name,
                                user_email: data.data?.user_email || data.user_email,
                                user_phone: data.data?.user_phone || data.user_phone,
                                contact_details: data.data?.contact_details || data.contact_details,
                            }
                        });
                        return next;
                    });

                    // Auto-dismiss submit UI after 2 seconds
                    if (isSubmit) {
                        setTimeout(() => {
                            updateMessages((prev) => {
                                const next = new Map(prev);
                                next.delete(id);
                                return next;
                            });
                        }, 2000);
                    }
                }
                else if (topic === 'ui.meeting_form' || data.type === 'meeting_form' || data.type === 'meeting_invite_submit') {
                    const isSubmit = data.type === 'meeting_invite_submit';
                    const msgType = isSubmit ? 'meeting_form_submit' : 'meeting_form';
                    const id = `${msgType}-${Date.now()}`;
                    console.log(`--- MEETING FORM (${isSubmit ? 'submitted' : 'preview'}) ---`, data);

                    updateMessages((prev) => {
                        const next = new Map(prev);

                        // Clear previous meeting_form previews on submit
                        if (isSubmit) {
                            for (const [key, msg] of next.entries()) {
                                if (msg.type === 'meeting_form') {
                                    next.delete(key);
                                }
                            }
                        }

                        next.set(id, {
                            id,
                            type: msgType,
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false,
                            meetingFormData: !isSubmit ? {
                                recipient_email: data.data?.recipient_email || data.recipient_email,
                                subject: data.data?.subject || data.subject,
                                description: data.data?.description || data.description,
                                location: data.data?.location || data.location,
                                start_time: data.data?.start_time || data.start_time,
                                duration_hours: data.data?.duration_hours || data.duration_hours,
                            } : undefined,
                            meetingInviteSubmitData: isSubmit ? {
                                recipient_email: data.data?.recipient_email || data.recipient_email,
                                subject: data.data?.subject || data.subject,
                                start_time: data.data?.start_time || data.start_time,
                                status: data.data?.status || data.status,
                            } : undefined,
                        });
                        return next;
                    });

                    // Auto-dismiss submit UI after 2.5 seconds
                    if (isSubmit) {
                        setTimeout(() => {
                            updateMessages((prev) => {
                                const next = new Map(prev);
                                next.delete(id);
                                return next;
                            });
                        }, 2500);
                    }
                }
                else if (topic === 'ui.global_presense' || data.type === 'global_presence') {
                    const id = `global-presence-${Date.now()}`;
                    console.log('--- GLOBAL PRESENCE (INCOMING) ---', data);

                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(id, {
                            id,
                            type: 'global_presence',
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false,
                            globalPresenceData: {
                                regions: data.data?.regions || data.regions || {},
                                headquarters: data.data?.headquarters || data.headquarters || {},
                            }
                        });
                        return next;
                    });
                }
                else if (topic === 'ui.nearby_offices' || data.type === 'nearby_offices') {
                    const id = `nearby-offices-${Date.now()}`;
                    console.log('--- NEARBY OFFICES (INCOMING) ---', data);

                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(id, {
                            id,
                            type: 'nearby_offices',
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false,
                            nearbyOfficesData: {
                                offices: data.data?.offices || data.offices || [],
                            }
                        });
                        return next;
                    });
                }
                else if (topic === 'ui.job_application' || data.type === 'job_application_preview' || data.type === 'job_application_submit') {
                    const isSubmit = data.type === 'job_application_submit';
                    const msgType = isSubmit ? 'job_application_submit' : 'job_application_preview';
                    const id = `${msgType}-${Date.now()}`;
                    console.log(`--- JOB APPLICATION (${isSubmit ? 'submitted' : 'preview'}) ---`, data);

                    updateMessages((prev) => {
                        const next = new Map(prev);

                        // Clear previous job_application previews on submit so screen is clean after dismiss
                        if (isSubmit) {
                            for (const [key, msg] of next.entries()) {
                                if (msg.type === 'job_application_preview') {
                                    next.delete(key);
                                }
                            }
                        }

                        next.set(id, {
                            id,
                            type: msgType,
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false,
                            jobApplicationData: {
                                user_name: data.data?.user_name || data.user_name,
                                user_email: data.data?.user_email || data.user_email,
                                user_phone: data.data?.user_phone || data.user_phone,
                                job_details: data.data?.job_details || data.job_details,
                                // These might be empty initially in preview
                                resume: data.data?.resume || data.resume,
                                github: data.data?.github || data.github,
                                linkedin: data.data?.linkedin || data.linkedin,
                                portfolio: data.data?.portfolio || data.portfolio,
                            }
                        });
                        return next;
                    });

                    // Auto-dismiss submit UI after 2.5 seconds
                    if (isSubmit) {
                        setTimeout(() => {
                            updateMessages((prev) => {
                                const next = new Map(prev);
                                next.delete(id);
                                return next;
                            });
                        }, 2500);
                    }
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
