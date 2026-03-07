export type AgentState = 'listening' | 'speaking' | 'thinking' | 'idle';
export type InteractionMode = 'voice' | 'text';

export interface FlashcardMedia {
    urls?: string[];
    query?: string;
    source?: string;
}

export interface FlashcardStyle {
    icon?: { type: 'static'; ref: string; fallback?: string };
    visual_intent?: 'neutral' | 'urgent' | 'success' | 'warning' | 'processing' | 'cyberpunk';
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

export interface MeetingFormData {
    recipient_email: string;
    subject: string;
    description: string;
    location: string;
    start_time: string;
    duration_hours: number;
}

export interface MeetingInviteSubmitData {
    recipient_email: string;
    subject: string;
    start_time: string;
    status: string;
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
    type: 'text' | 'flashcard' | 'contact_form' | 'contact_form_submit' | 'location_request' | 'map_polyline' | 'global_presence' | 'nearby_offices' | 'job_application_preview' | 'job_application_submit' | 'meeting_form' | 'meeting_form_submit';
    text?: string;
    cardData?: {
        title: string;
        value: string;
        stream_id?: string;
        card_index?: number;
        media?: FlashcardMedia;
    } & FlashcardStyle;
    contactFormData?: ContactFormData;
    locationRequestData?: LocationRequestData;
    mapPolylineData?: MapPolylineData;
    globalPresenceData?: GlobalPresenceData;
    nearbyOfficesData?: NearbyOfficesData;
    jobApplicationData?: JobApplicationData;
    meetingFormData?: MeetingFormData;
    meetingInviteSubmitData?: MeetingInviteSubmitData;
    isInterim?: boolean;
    timestamp: number;
}
