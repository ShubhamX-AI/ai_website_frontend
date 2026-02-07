export type AgentState = 'listening' | 'speaking' | 'thinking' | 'idle';
export type InteractionMode = 'voice' | 'text';

export interface FlashcardStyle {
    accentColor?: string;
    icon?: string;
    theme?: 'glass' | 'solid' | 'gradient' | 'neon' | 'highlight' | 'info' | 'light';
    size?: 'tiny' | 'extra-small' | 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
    layout?: 'default' | 'horizontal' | 'centered' | 'media-top';
    image?: {
        url: string;
        alt: string;
        aspectRatio?: string;
    };
    // [NEW] Dynamic UI Extensions
    visual_intent?: 'neutral' | 'urgent' | 'success' | 'warning' | 'processing' | 'cyberpunk';
    animation_style?: 'slide' | 'pop' | 'fade' | 'flip' | 'scale';
    smartIcon?: {
        type: 'animated' | 'static';
        ref: string; // e.g. "shield-check" (Lucide) or "lottie-shield" (slug)
        fallback?: string;
    };
    dynamicMedia?: {
        urls?: string[];
        query?: string;
        source?: 'unsplash' | 'pexels';
        aspectRatio?: 'auto' | 'video' | 'square' | 'portrait';
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
        stream_id?: string;
        card_index?: number;
    } & FlashcardStyle;
    isInterim?: boolean;
    timestamp: number;
}
