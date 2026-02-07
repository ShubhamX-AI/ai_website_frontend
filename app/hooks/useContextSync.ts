import { useRef, useCallback, useEffect } from 'react';
import { useRoomContext, useLocalParticipant, useVoiceAssistant } from '@livekit/components-react';
import { ChatMessage } from './agentTypes';

export function useContextSync(
    messagesRef: React.MutableRefObject<Map<string, ChatMessage>>,
    onStreamCompleteRef: React.MutableRefObject<(() => void) | null>
) {
    const { localParticipant } = useLocalParticipant();
    const room = useRoomContext();
    const { audioTrack: agentTrack } = useVoiceAssistant();
    
    const syncPerformed = useRef(false);
    const syncRef = useRef<() => void>(() => { });

    // UI Context Sync to Backend (Snapshot Protocol)
    const syncUIContext = useCallback(() => {
        if (!localParticipant || !room || room.state !== 'connected') return;

        const isMobile = window.innerWidth < 768;

        // Use messagesRef for the absolute latest data (bypasses async state lag)
        const currentMessages = Array.from(messagesRef.current.values())
            .sort((a, b) => a.timestamp - b.timestamp);

        // Extract recent flashcards to provide visual context to the agent
        const visibleCards = currentMessages
            .filter(m => m.type === 'flashcard')
            .map(m => ({
                id: m.id,
                type: m.type,
                title: m.cardData?.title,
                summary: m.cardData?.value?.substring(0, 100) + (m.cardData?.value && m.cardData.value.length > 100 ? '...' : '')
            }));

        // [NEW] Get User Info from Local Storage
        let userInfo = { name: "", id: "" };
        try {
            const storedUser = localStorage.getItem("user_info");
            if (storedUser) {
                userInfo = JSON.parse(storedUser);
            }
        } catch (e) {
            console.warn("Failed to parse user_info for sync", e);
        }

        const context = {
            type: 'ui.context_sync',
            timestamp: Date.now(),
            viewport: {
                screen: isMobile ? 'mobile' : 'desktop',
                density: isMobile ? 'compact' : 'comfortable',
                theme: 'light',
                capabilities: {
                    canRenderCards: true,
                    maxVisibleCards: isMobile ? 1 : Math.floor(window.innerWidth / 320), // Dynamic based on screen width
                    supportsRichUI: true, // Animations, Smart Icons
                    supportsDynamicMedia: true
                }
            },
            active_elements: visibleCards
        };

        const encoder = new TextEncoder();
        console.log('--- SYNCING UI CONTEXT (SNAPSHOT) ---', context);
        localParticipant.publishData(encoder.encode(JSON.stringify(context)), {
            reliable: true,
            topic: 'ui.context'
        });

        // [NEW] Separate User Context Sync
        const userContext = {
            type: 'user.context_sync',
            timestamp: Date.now(),
            user_info: userInfo
        };

        console.log('--- SYNCING USER CONTEXT ---', userContext);
        localParticipant.publishData(encoder.encode(JSON.stringify(userContext)), {
            reliable: true,
            topic: 'user.context'
        });
    }, [localParticipant, room, messagesRef]);

    // Keep syncRef updated for event listeners
    useEffect(() => {
        syncRef.current = syncUIContext;
    }, [syncUIContext]);
    
    // Wire up the onStreamComplete callback
    useEffect(() => {
        onStreamCompleteRef.current = syncUIContext;
        return () => {
            onStreamCompleteRef.current = null;
        };
    }, [syncUIContext, onStreamCompleteRef]);

    useEffect(() => {
        if (room?.state === 'connected') {
            // Initial sync when agent is present - Perform only once
            if (agentTrack && !syncPerformed.current) {
                console.log('--- AGENT JOINED, PERFORMING INITIAL SYNC ---');
                syncUIContext();
                syncPerformed.current = true;
            }

            // Sync on resize (debounced)
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
        } else {
            // Reset if room disconnects or isn't connected yet
            syncPerformed.current = false;
        }
    }, [room?.state, !!agentTrack, syncUIContext]);

    return {
        syncUIContext
    };
}
