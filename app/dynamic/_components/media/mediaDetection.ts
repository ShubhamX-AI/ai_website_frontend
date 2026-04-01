// ─── Type Detection ───────────────────────────────────────────────────────────
// YouTube/Vimeo always wins first. Then video file extensions. Else image.

export type MediaType = 'image' | 'video' | 'youtube' | 'vimeo' | 'unknown';

export const detectMediaType = (url: string): MediaType => {
    if (!url) return 'unknown';
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be') || u.includes('youtube-nocookie.com')) return 'youtube';
    if (u.includes('vimeo.com')) return 'vimeo';
    if (u.match(/\.(mp4|webm|ogg|mov|m4v)$/) || u.includes('cloudinary.com/video/upload')) return 'video';
    return 'image';
};

export const isVideoType = (t: MediaType) => t === 'video' || t === 'youtube' || t === 'vimeo';

// Derive aspect ratio: perfect 16:9 for everything to guarantee grid symmetry
export const getAspectClass    = (_t: MediaType) => 'aspect-video';
export const getMinHeightClass = (_t: MediaType) => '';

// ─── YouTube / Vimeo ID extraction ────────────────────────────────────────────

export const getYoutubeId = (url: string) => {
    const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
    return m && m[2].length === 11 ? m[2] : null;
};

export const getVimeoId = (url: string) => {
    const m = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
    return m ? m[1] : null;
};
