import { useState, useCallback, useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { InteractionMode, ChatMessage } from './agentTypes';

export function useInteractionControl(
    updateMessages: (updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => void
) {
    const { localParticipant } = useLocalParticipant();
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
            updateMessages((prev) => {
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
    }, [localParticipant, updateMessages]);

    return {
        mode,
        setInteractionMode,
        toggleMic,
        sendText
    };
}
