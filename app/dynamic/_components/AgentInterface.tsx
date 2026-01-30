
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentInteraction, ChatMessage } from '../_hooks/useAgentInteraction';
import { ThreeJSVisualizer } from './ThreeJSVisualizer';
import { Flashcard } from './Flashcard';
import { RoomAudioRenderer } from '@livekit/components-react';

interface AgentInterfaceProps {
    onDisconnect: () => void;
}

const SubtitleOverlay = ({ text, isInterim }: { text: string | null; isInterim: boolean }) => {
    const [visibleText, setVisibleText] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        if (text) {
            setVisibleText(text);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // If it's a final message (not interim), hide it after a delay
            if (!isInterim) {
                timeoutRef.current = setTimeout(() => {
                    setVisibleText(null);
                }, 4000); // 4 seconds delay
            }
        }
    }, [text, isInterim]);

    if (!visibleText) return null;

    return (
        <div className="pointer-events-none absolute bottom-32 left-0 right-0 z-20 flex justify-center px-4">
            <div className={`max-w-2xl text-center transition-all duration-300 ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <span className={`inline-block rounded-2xl bg-black/40 px-6 py-3 text-lg font-medium text-white backdrop-blur-md shadow-lg
                    ${isInterim ? 'animate-pulse' : ''}`}>
                    {visibleText}
                </span>
            </div>
        </div>
    );
};

const CardDisplay = ({ cards }: { cards: ChatMessage[] }) => {
    if (cards.length === 0) return null;

    // Filter out cards without cardData
    const validCards = cards.filter((card): card is ChatMessage & { cardData: NonNullable<ChatMessage['cardData']> } =>
        card && card.cardData !== undefined && card.cardData.title !== undefined
    );
    if (validCards.length === 0) return null;

    return (
        <div className="relative flex w-full max-w-7xl flex-col items-center">
            {/* Grid layout for multiple cards */}
            <motion.div
                layout
                className={`relative z-10 w-full px-4 md:px-6 grid gap-6 ${validCards.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
                    validCards.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
                        validCards.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`}
            >
                <AnimatePresence mode="popLayout">
                    {validCards.map((card) => (
                        <motion.div
                            layout
                            key={card.id}
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <Flashcard {...card.cardData} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Optional card count indicator */}
            {validCards.length > 1 && (
                <div className="mt-6 flex items-center gap-2 rounded-full bg-white/40 px-4 py-2 backdrop-blur-xl ring-1 ring-black/5 shadow-lg">
                    <div className="flex gap-1.5">
                        {validCards.map((_, idx) => (
                            <motion.div
                                key={idx}
                                layoutId={`dot-${idx}`}
                                className="h-1.5 w-1.5 rounded-full bg-zinc-400"
                            />
                        ))}
                    </div>
                    <span className="text-xs font-medium text-zinc-600">
                        {validCards.length} {validCards.length === 1 ? 'Card' : 'Cards'}
                    </span>
                </div>
            )}
        </div>
    );
};

export const AgentInterface: React.FC<AgentInterfaceProps> = ({ onDisconnect }) => {
    const {
        agentState,
        mode,
        setInteractionMode,
        messages,
        activeTrack,
        userTrack,
        toggleMic,
        sendText
    } = useAgentInteraction();

    const [inputText, setInputText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isAgentMuted, setIsAgentMuted] = useState(false);

    // Compute flashcards and latest agent message
    const flashcards = useMemo(() => {
        return messages.filter(m => m.type === 'flashcard');
    }, [messages]);

    const latestAgentMessage = useMemo(() => {
        const agentMsgs = messages.filter(m => m.sender === 'agent' && m.type === 'text');
        // We want the very last one, even if interim
        return agentMsgs.length > 0 ? agentMsgs[agentMsgs.length - 1] : null;
    }, [messages]);

    // Handle Agent Muting
    useEffect(() => {
        if (activeTrack?.publication?.track && 'setVolume' in activeTrack.publication.track) {
            (activeTrack.publication.track as any).setVolume(isAgentMuted ? 0 : 1);
        }
    }, [isAgentMuted, activeTrack]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendText(inputText);
        setInputText('');
    };

    const handleMicToggle = () => {
        if (mode === 'text') {
            setInteractionMode('voice');
            setIsMuted(false);
            toggleMic(false);
        } else {
            const newState = !isMuted;
            setIsMuted(newState);
            toggleMic(newState);
        }
    };

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-transparent ring-1 ring-black/5 shadow-2xl">

            {/* Audio Renderer */}
            <RoomAudioRenderer />

            {/* Central Content (Card Display) */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 z-0 pb-32">
                <CardDisplay cards={flashcards} />

                {/* Empty State / Prompt if no card */}
                {/* Empty State / Prompt if no card */}
                {flashcards.length === 0 && (
                    <div className="flex items-center justify-center pointer-events-none">
                        <div className="relative h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] md:h-[500px] md:w-[500px]">
                            <ThreeJSVisualizer agentTrack={activeTrack} userTrack={userTrack} />
                        </div>
                    </div>
                )}
            </div>

            {/* Subtitles Overlay */}
            <SubtitleOverlay
                text={latestAgentMessage?.text || null}
                isInterim={latestAgentMessage?.isInterim || false}
            />

            {/* Content Wrapper for Controls (Z-Index ensures it's on top) */}
            <div className="relative z-30 mb-8 flex flex-col justify-end flex-1 pointer-events-none">
                {/* Bottom Control Bar */}
                <div className="pointer-events-auto flex w-full justify-center p-4">
                    <div className="flex w-full items-center gap-1.5 rounded-[32px] bg-white/90 p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-zinc-200 backdrop-blur-2xl transition-all sm:w-auto sm:max-w-none sm:gap-3 sm:p-2 sm:pl-3 hover:scale-[1.01] hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]">

                        {/* AI Orb Visualizer */}
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100/50 ring-1 ring-zinc-200 sm:h-12 sm:w-12">
                            <ThreeJSVisualizer agentTrack={activeTrack} userTrack={userTrack} />
                        </div>

                        {/* Agent Mute Toggle (Speaker Icon) */}
                        <button
                            onClick={() => setIsAgentMuted(!isAgentMuted)}
                            className={`group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-11 sm:w-11 ${isAgentMuted
                                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                            title={isAgentMuted ? "Unmute Agent" : "Mute Agent"}
                        >
                            {isAgentMuted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5a2.25 2.25 0 0 0 2.25 2.25h2.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.96 8.01a.75.75 0 0 1 1.06 0 11.25 11.25 0 0 1 0 15.91.75.75 0 0 1-1.06-1.06 9.75 9.75 0 0 0 0-13.79.75.75 0 0 1 0-1.06ZM17.22 10.34a.75.75 0 0 1 1.06 0 7.5 7.5 0 0 1 0 10.61.75.75 0 1 1-1.06-1.06 6 6 0 0 0 0-8.49.75.75 0 0 1 0-1.06Z" />
                                    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5a2.25 2.25 0 0 0 2.25 2.25h2.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06Z" />
                                    <path d="M20 12c0-1.23-.29-2.39-.805-3.415a.75.75 0 0 1 1.39-.565C21.31 9.4 21.5 10.68 21.5 12s-.19 2.6-.915 3.98a.75.75 0 1 1-1.39-.565c.515-1.025.805-2.185.805-3.415Z" />
                                    <path d="M18 12c0-.9-.2-1.76-.565-2.545a.75.75 0 0 1 1.39-.565c.444.975.675 2.05.675 3.11s-.23 2.135-.675 3.11a.75.75 0 1 1-1.39-.565c.365-.785.565-1.645.565-2.545Z" />
                                </svg>
                            )}
                        </button>

                        {/* Mic Toggle */}
                        <button
                            onClick={handleMicToggle}
                            className={`group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-11 sm:w-11 ${mode === 'voice' && !isMuted
                                ? 'bg-zinc-900 text-white hover:bg-zinc-700'
                                : mode === 'voice' && isMuted
                                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                    : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                                }`}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                                    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.045 2.47a.75.75 0 0 1 .06 1.06l-1.06-1.06ZM12 2.25a.75.75 0 0 1 .75.75v5.69l-1.5-1.5V3a.75.75 0 0 1 .75-.75ZM4.5 12c0-1.23.29-2.39.805-3.415L3.498 6.78A7.478 7.478 0 0 0 3 12a.75.75 0 0 0 1.5 0Zm15 0a.75.75 0 0 0-1.5 0c0 .9-.2 1.76-.565 2.545l-1.12-1.12a5.975 5.975 0 0 1 1.685-1.425ZM12 15.75c-1.353 0-2.614-.367-3.692-1l-1.09 1.09a7.47 7.47 0 0 0 4.032 1.408v2.252h-2.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-2.25v-2.252a7.48 7.48 0 0 0 1.948-.48l-1.091-1.091a5.974 5.974 0 0 1-1.599.073Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                                    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                    <path d="M12 14.25a5.25 5.25 0 0 0 5.25-5.25v-1.5a.75.75 0 0 0-1.5 0v1.5a3.75 3.75 0 1 1-7.5 0v-1.5a.75.75 0 0 0-1.5 0v1.5a5.25 5.25 0 0 0 5.25 5.25Z" />
                                    <path d="M9 17.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />
                                </svg>
                            )}
                        </button>

                        {/* Input Field */}
                        <div className="relative flex min-w-0 flex-1 items-center group/input px-1 transition-all duration-300 sm:px-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => {
                                    setInputText(e.target.value);
                                    if (mode !== 'text') setInteractionMode('text');
                                }}
                                onFocus={() => {
                                    if (mode !== 'text') setInteractionMode('text');
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={"Type something..."}
                                className={`w-full min-w-0 bg-transparent px-1 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all sm:w-[180px] sm:px-2 sm:py-2 md:w-[240px] ${mode === 'voice' ? 'cursor-text' : ''
                                    }`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className="mr-0.5 shrink-0 rounded-full p-1.5 text-blue-600 transition-colors hover:bg-blue-50 disabled:text-zinc-300 disabled:hover:bg-transparent sm:mr-1 sm:p-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                </svg>
                            </button>
                        </div>

                        {/* Separator */}
                        <div className="h-5 w-px shrink-0 bg-zinc-200 mx-0.5 sm:h-6 sm:mx-1"></div>

                        {/* Stop / Disconnect */}
                        <button
                            onClick={onDisconnect}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-colors hover:bg-red-50 hover:text-red-500 sm:h-11 sm:w-11"
                            title="End Session"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};
