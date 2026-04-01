import { useMemo } from 'react';
import { ChatMessage } from '../../../hooks/useAgentInteraction';

export function useVisualMessageFilters(messages: ChatMessage[]) {
    const latestVisualMessage = useMemo(() => {
        // location_request is intentionally excluded — it's handled silently via useEffect
        const visualMsgs = messages.filter(m =>
            m.type === 'flashcard' ||
            m.type === 'contact_form' ||
            m.type === 'contact_form_submit' ||
            m.type === 'meeting_form' ||
            m.type === 'meeting_form_submit' ||
            m.type === 'map_polyline' ||
            m.type === 'global_presence' ||
            m.type === 'nearby_offices' ||
            m.type === 'job_application_preview' ||
            m.type === 'job_application_submit'
        );
        return visualMsgs.length > 0 ? visualMsgs[visualMsgs.length - 1] : null;
    }, [messages]);

    const locationRequestMessage = useMemo(() => {
        const req = messages.filter(m => m.type === 'location_request');
        return req.length > 0 ? req[req.length - 1] : null;
    }, [messages]);

    const contactFormMessage = useMemo(() => {
        return latestVisualMessage?.type === 'contact_form' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    const contactFormSubmitMessage = useMemo(() => {
        return latestVisualMessage?.type === 'contact_form_submit' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    const meetingFormMessage = useMemo(() => {
        return latestVisualMessage?.type === 'meeting_form' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    const meetingFormSubmitMessage = useMemo(() => {
        return latestVisualMessage?.type === 'meeting_form_submit' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    const mapPolylineMessage = useMemo(() => {
        return latestVisualMessage?.type === 'map_polyline' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    const globalPresenceMessage = useMemo(() => {
        return latestVisualMessage?.type === 'global_presence' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    const nearbyOfficesMessage = useMemo(() => {
        return latestVisualMessage?.type === 'nearby_offices' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    const jobApplicationPreviewMessage = useMemo(() => {
        return latestVisualMessage?.type === 'job_application_preview' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    const jobApplicationSubmitMessage = useMemo(() => {
        return latestVisualMessage?.type === 'job_application_submit' ? latestVisualMessage : null;
    }, [latestVisualMessage]);

    return {
        latestVisualMessage,
        locationRequestMessage,
        contactFormMessage,
        contactFormSubmitMessage,
        meetingFormMessage,
        meetingFormSubmitMessage,
        mapPolylineMessage,
        globalPresenceMessage,
        nearbyOfficesMessage,
        jobApplicationPreviewMessage,
        jobApplicationSubmitMessage,
    };
}
