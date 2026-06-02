import React from 'react';
import dynamic from 'next/dynamic';
import type { ChatMessage } from '../../types/agentTypes';
import type { VisualMessageFilters } from './useVisualMessageFilters';
import { ContactForm } from '../forms/ContactForm';
import { ContactFormSubmit } from '../forms/ContactFormSubmit';
import { JobApplicationForm } from '../forms/JobApplicationForm';
import { JobApplicationSubmit } from '../forms/JobApplicationSubmit';
import { MeetingForm } from '../forms/MeetingForm';
import { MeetingFormSubmit } from '../forms/MeetingFormSubmit';
import { StarterScreen } from '../primitives/StarterScreen';
import { CardDisplay } from './CardDisplay';

const MapDisplay = dynamic<any>(() => import('../maps/MapDisplay').then(mod => mod.MapDisplay), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full animate-pulse rounded-[32px] bg-zinc-100/50 backdrop-blur-md md:h-[450px]" />
});

const GlobalPresenceMap = dynamic<any>(() => import('../maps/GlobalPresenceMap').then(mod => mod.GlobalPresenceMap), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full animate-pulse rounded-[32px] bg-zinc-900/50 backdrop-blur-md md:h-[450px]" />
});

const NearbyOffices = dynamic<any>(() => import('../maps/NearbyOffices').then(mod => mod.NearbyOffices), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full animate-pulse rounded-[32px] bg-zinc-100/50 backdrop-blur-md md:h-[450px]" />
});

interface CanvasProps {
    /** Output of useVisualMessageFilters(messages) — the single visual the agent wants shown. */
    visuals: VisualMessageFilters;
    /** Flashcards collected from the message stream. */
    flashcards: ChatMessage[];
    /** Agent lifecycle — drives the "thinking" blur. */
    agentState: string;
    /** 'window' tightens padding for the chat-window / embed drawer. */
    variant: 'immersive' | 'window';
    /** Lets interactive cards (job form) write back into the message map. */
    updateMessages: (updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => void;
    /** Send a starter question to the agent (wired to the idle StarterScreen). */
    sendText: (text: string) => void;
    /** Latest agent spoken text — shown centered on the welcome screen as Vani speaks. */
    agentText?: string | null;
    isAgentInterim?: boolean;
}

/**
 * Canvas — the visual board.
 *
 * The scrolling area that renders whatever the agent sends: flashcards, maps,
 * forms, or the idle StarterScreen. Purely presentational — it owns no engine
 * state, it just renders the messages handed to it. Pairs with <VoiceDock>; the
 * two are always mounted together (see AgentInterface).
 */
export const Canvas: React.FC<CanvasProps> = ({
    visuals,
    flashcards,
    agentState,
    variant,
    updateMessages,
    sendText,
    agentText,
    isAgentInterim,
}) => {
    const isWindow = variant === 'window';

    const {
        latestVisualMessage,
        contactFormMessage,
        contactFormSubmitMessage,
        meetingFormMessage,
        meetingFormSubmitMessage,
        mapPolylineMessage,
        globalPresenceMessage,
        nearbyOfficesMessage,
        jobApplicationPreviewMessage,
        jobApplicationSubmitMessage,
    } = visuals;

    const className = [
        'absolute inset-0 flex flex-col items-center overflow-y-auto overflow-x-hidden z-0 scrollbar-hide transition-all duration-500',
        isWindow ? 'p-4 pt-14 pb-28' : 'p-4 pt-20 pb-40 md:p-12 md:pb-32',
        agentState === 'thinking' ? 'blur-sm scale-95 opacity-50' : 'blur-0 scale-100 opacity-100',
    ].join(' ');

    // The agent shows ONE visual at a time — whichever message is latest. Each
    // case renders its component in a centered wrapper (maps get wider max-widths).
    // Falls through to flashcards, then the idle StarterScreen.
    const renderVisual = (): React.ReactNode => {
        switch (latestVisualMessage?.type) {
            case 'contact_form_submit':
                return contactFormSubmitMessage?.contactFormData && (
                    <div className="flex w-full justify-center">
                        <ContactFormSubmit key={contactFormSubmitMessage.id} data={contactFormSubmitMessage.contactFormData} />
                    </div>
                );
            case 'contact_form':
                return contactFormMessage?.contactFormData && (
                    <div className="flex w-full justify-center">
                        <ContactForm key={contactFormMessage.id} data={contactFormMessage.contactFormData} />
                    </div>
                );
            case 'meeting_form_submit':
                return meetingFormSubmitMessage?.meetingInviteSubmitData && (
                    <div className="flex w-full justify-center">
                        <MeetingFormSubmit key={meetingFormSubmitMessage.id} data={meetingFormSubmitMessage.meetingInviteSubmitData} />
                    </div>
                );
            case 'meeting_form':
                return meetingFormMessage?.meetingFormData && (
                    <div className="flex w-full justify-center">
                        <MeetingForm key={meetingFormMessage.id} data={meetingFormMessage.meetingFormData} />
                    </div>
                );
            case 'map_polyline':
                return mapPolylineMessage?.mapPolylineData && (
                    <div className="flex w-full max-w-4xl justify-center">
                        <MapDisplay
                            key={mapPolylineMessage.id}
                            polyline={mapPolylineMessage.mapPolylineData.polyline}
                            origin={mapPolylineMessage.mapPolylineData.origin}
                            destination={mapPolylineMessage.mapPolylineData.destination}
                            travelMode={mapPolylineMessage.mapPolylineData.travelMode}
                            distance={mapPolylineMessage.mapPolylineData.distance}
                            duration={mapPolylineMessage.mapPolylineData.duration}
                            mode_label={mapPolylineMessage.mapPolylineData.mode_label}
                            destination_image_url={mapPolylineMessage.mapPolylineData.destination_image_url}
                        />
                    </div>
                );
            case 'global_presence':
                return globalPresenceMessage?.globalPresenceData && (
                    <div className="flex w-full max-w-5xl justify-center">
                        <GlobalPresenceMap key={globalPresenceMessage.id} data={globalPresenceMessage.globalPresenceData} />
                    </div>
                );
            case 'nearby_offices':
                return nearbyOfficesMessage?.nearbyOfficesData && (
                    <div className="flex w-full max-w-7xl justify-center">
                        <NearbyOffices key={nearbyOfficesMessage.id} data={nearbyOfficesMessage.nearbyOfficesData} />
                    </div>
                );
            case 'job_application_submit':
                return jobApplicationSubmitMessage?.jobApplicationData && (
                    <div className="flex w-full justify-center">
                        <JobApplicationSubmit key={jobApplicationSubmitMessage.id} data={jobApplicationSubmitMessage.jobApplicationData} />
                    </div>
                );
            case 'job_application_preview':
                return jobApplicationPreviewMessage?.jobApplicationData && (
                    <div className="flex w-full justify-center">
                        <JobApplicationForm
                            key={jobApplicationPreviewMessage.id}
                            data={jobApplicationPreviewMessage.jobApplicationData}
                            updateMessages={updateMessages}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const visual = renderVisual();
    const content = visual ?? (flashcards.length > 0 ? (
        <CardDisplay cards={flashcards} variant={variant} />
    ) : null);

    return (
        <div className={className}>
            {content ? (
                <div className="m-auto flex w-full flex-col items-center">
                    {content}
                </div>
            ) : (
                <StarterScreen
                    variant={variant}
                    onQuestionClick={sendText}
                    agentText={agentText}
                    isAgentInterim={isAgentInterim}
                />
            )}
        </div>
    );
};
