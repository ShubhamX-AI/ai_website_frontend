export type AgentState = 'listening' | 'speaking' | 'thinking' | 'idle';
export type InteractionMode = 'voice' | 'text';

export interface FlashcardStyle {
    accentColor?: string;
    icon?: string | { type: 'static'; ref: string; fallback?: string };
    theme?: 'glass' | 'solid' | 'gradient' | 'neon' | 'highlight' | 'info' | 'light';
    size?: 'tiny' | 'extra-small' | 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg' | 'bento';
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
        mediaType?: 'image' | 'video';
    };
}



export interface UserInfo {
    user_name: string;
    user_email: string;
    user_phone: string;
    user_id: string;
}

export interface ContactFormData {
    user_name?: string;
    user_email?: string;
    user_phone?: string;
    contact_details?: string;
}

export interface JobApplicationData {
    user_name?: string;
    user_email?: string;
    user_phone?: string;
    job_details?: string;
    resume?: string; // Base64 or URL
    github?: string;
    linkedin?: string;
    portfolio?: string;
}

export interface LocationRequestData {
    reason?: string; // e.g. "finding nearby offices" — shown to the user
}

export interface MapPolylineData {
    polyline: string;
    origin?: string;
    destination?: string;
    travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
    distance?: string;
    duration?: string;
}

export interface GlobalPresenceData {
    regions: Record<string, string>;
    headquarters: Record<string, string>;
}

export interface NearbyOffice {
    id: string;
    name: string;
    address: string;
    image_url: string;
}

export interface NearbyOfficesData {
    offices: NearbyOffice[];
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    type: 'text' | 'flashcard' | 'contact_form' | 'contact_form_submit' | 'location_request' | 'map_polyline' | 'global_presence' | 'nearby_offices' | 'job_application_preview' | 'job_application_submit';
    text?: string;
    cardData?: {
        title: string;
        value: string;
        stream_id?: string;
        card_index?: number;
    } & FlashcardStyle;
    contactFormData?: ContactFormData;
    locationRequestData?: LocationRequestData;
    mapPolylineData?: MapPolylineData;
    globalPresenceData?: GlobalPresenceData;
    nearbyOfficesData?: NearbyOfficesData;
    jobApplicationData?: JobApplicationData;
    isInterim?: boolean;
    timestamp: number;
}
