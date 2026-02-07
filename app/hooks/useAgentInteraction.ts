import { useMemo } from 'react';
import {
    useVoiceAssistant,
    useLocalParticipant,
    useRoomContext,
    type TrackReferenceOrPlaceholder
} from '@livekit/components-react';
import { Track } from 'livekit-client';

// Import Types
import { AgentState, InteractionMode, FlashcardStyle, ChatMessage } from './agentTypes';
export type { AgentState, InteractionMode, FlashcardStyle, ChatMessage };

// Import Sub-Hooks
import { useAgentMessages } from './useAgentMessages';
import { useContextSync } from './useContextSync';
import { useInteractionControl } from './useInteractionControl';

export function useAgentInteraction() {
    const { state, audioTrack: agentTrack } = useVoiceAssistant();
    const { localParticipant, microphoneTrack } = useLocalParticipant();
    const room = useRoomContext();

    // 1. Message Handling
    const { messages, messagesRef, updateMessages, onStreamCompleteRef } = useAgentMessages();

    // 2. Context Synchronization (Passes messagesRef to sync snapshots)
    useContextSync(messagesRef, onStreamCompleteRef);

    // 3. Interaction Control (Mode, Mic, Send Text)
    const { mode, setInteractionMode, toggleMic, sendText } = useInteractionControl(updateMessages);

    // --- State & Tracks (Kept here as it's simple/glue code) ---
    // Simple state mapping
    const agentState: AgentState = state === 'speaking' ? 'speaking' :
        state === 'listening' ? 'listening' : 'idle';

    // Pass the agentTrack directly
    const activeTrack = useMemo(() => {
        if (agentTrack?.publication?.track) {
            return agentTrack;
        }
        return undefined;
    }, [agentTrack]);

    // For userTrack, we need to construct a proper TrackReference
    const userTrack = useMemo(() => {
        if (localParticipant && microphoneTrack?.track) {
            return {
                participant: localParticipant,
                source: Track.Source.Microphone,
                publication: microphoneTrack,
            } as TrackReferenceOrPlaceholder;
        }
        return undefined;
    }, [localParticipant, microphoneTrack]);

    return {
        agentState,
        mode,
        setInteractionMode,
        messages,
        activeTrack, // Agent audio
        userTrack,   // User mic
        toggleMic,
        sendText,
        roomState: room?.state
    };
}
