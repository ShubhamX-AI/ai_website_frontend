export type AgentState = 'listening' | 'speaking' | 'thinking' | 'idle';
export type InteractionMode = 'voice' | 'text';

export interface FlashcardMedia {
    urls?: string[];
    query?: string;
    source?: string;
    // Optional aspect hints — let the frame reserve correct space before load
    // (avoids a first-frame 16:9 flash). All detected client-side if absent.
    orientation?: 'portrait' | 'landscape' | 'square';
    width?: number;
    height?: number;
    /** Video thumbnail shown while the clip buffers. */
    poster?: string;
}

// Shared accent enum — maps to a theme color (see flashcardThemes INTENT_COLORS).
export type VisualIntent = 'neutral' | 'urgent' | 'success' | 'warning' | 'processing';

export interface FlashcardStyle {
    icon?: { type: 'static'; ref: string; fallback?: string };
    visual_intent?: VisualIntent;
}

// ─── Rich flashcard body ────────────────────────────────────────────────────
// Backend may send a structured `content` instead of plain markdown `value`.
// `content_kind` selects the renderer; missing/unknown → falls back to markdown.

export type FlashcardContentKind = 'markdown' | 'stat' | 'steps' | 'logo';

export interface StatContent {
    items: { value: string; label: string; trend?: 'up' | 'down' }[];
}

export interface StepsContent {
    steps: { title: string; detail?: string; icon?: string }[];
}

export interface LogoContent {
    name: string;
    icon?: string;
    image_url?: string;
    caption?: string;
}

export type FlashcardContent = StatContent | StepsContent | LogoContent;


// ─── Infographic card ───────────────────────────────────────────────────────
// Composed, text-led card (replaces the old rich_card). Arrives on topic
// `ui.infographic` (single) or inside a `ui.flashcard` deck. Routed by payload
// `type === 'infographic'`. Renders hero + ordered section blocks + chips.

// Bundled vector graphic keys — `<PresetGraphic>` maps key → component, renders
// nothing on an unknown key. Keep in sync with the backend prompt's preset list.
export type PresetGraphicKey =
    | 'devops_loop'
    | 'cicd_pipeline'
    | 'cloud_stack'
    | 'ai_workflow'
    | 'security_shield'
    | 'growth_chart'
    | 'web_development'
    | 'data_analytics'
    | 'team_collaboration'
    | 'digital_marketing';

export interface InfographicHero {
    icon?: string;
    title?: string;
    description?: string;
    graphic?: string; // PresetGraphicKey, may be absent / unknown
}

// Closed set of section blocks — only these five `type` values appear.
export type InfographicSection =
    | { type: 'markdown'; title?: string; content: string }
    | { type: 'bullet_list'; title?: string; items: string[] }
    | { type: 'icon_bullets'; title?: string; graphic?: string; items: { icon?: string; title: string; text?: string }[] }
    | { type: 'stats'; title?: string; items: { icon?: string; value: string; label: string; intent?: VisualIntent }[] }
    | { type: 'cta_banner'; icon?: string; title: string; text?: string };

export interface InfographicData {
    title?: string;
    visual_intent?: VisualIntent;
    icon?: string;
    hero?: InfographicHero;
    sections?: InfographicSection[];
    chips?: string[];
    // deck metadata (mirrors flashcard cardData)
    stream_id?: string;
    card_index?: number;
    recalled?: boolean;
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
    travelMode?: 'DRIVE' | 'WALK' | 'BICYCLE' | 'TRANSIT' | 'TWO_WHEELER';
    distance?: string;
    duration?: string;
    mode_label?: string;
    destination_image_url?: string;
}

export interface GlobalPresenceData {
    regions: Record<string, string>;
    headquarters: Record<string, string>;
}

export interface NearbyOffice {
    id: string;
    name: string;
    address: string;
    image_url?: string;
    map_url?: string;
    lat?: number;
    lng?: number;
}


export interface NearbyOfficesData {
    offices: NearbyOffice[];
}

export interface OfficeDetailsData {
    office: NearbyOffice;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    type: 'text' | 'flashcard' | 'infographic' | 'contact_form' | 'contact_form_submit' | 'location_request' | 'map_polyline' | 'global_presence' | 'nearby_offices' | 'office_details' | 'job_application_preview' | 'job_application_submit' | 'meeting_form' | 'meeting_form_submit';
    text?: string;
    cardData?: {
        title: string;
        value: string;
        stream_id?: string;
        card_index?: number;
        media?: FlashcardMedia;
        // Rich body: when content_kind is set (and != 'markdown'), `content`
        // drives a structured renderer; otherwise `value` markdown is used.
        content_kind?: FlashcardContentKind;
        content?: FlashcardContent;
        // rich_card extras: checklist rows + footer tag pills
        bullets?: string[];
        chips?: string[];
        // Rich flashcard: the same typed blocks an infographic renders, shown
        // below the image/value. Reuses the infographic Section union (one source).
        sections?: InfographicSection[];
    } & FlashcardStyle;
    infographicData?: InfographicData;
    contactFormData?: ContactFormData;
    locationRequestData?: LocationRequestData;
    mapPolylineData?: MapPolylineData;
    globalPresenceData?: GlobalPresenceData;
    nearbyOfficesData?: NearbyOfficesData;
    officeDetailsData?: OfficeDetailsData;
    jobApplicationData?: JobApplicationData;
    meetingFormData?: MeetingFormData;
    meetingInviteSubmitData?: MeetingInviteSubmitData;
    isInterim?: boolean;
    timestamp: number;
}
