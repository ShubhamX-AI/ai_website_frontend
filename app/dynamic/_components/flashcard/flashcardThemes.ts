// ─── Color System ──────────────────────────────────────────────────────────
// Derived purely from visual_intent — never sent by backend

export const INTENT_COLOR_MAP: Record<string, string> = {
    urgent:     'rose',
    warning:    'amber',
    success:    'emerald',
    processing: 'blue',
    cyberpunk:  'violet',
    neutral:    'zinc',
};

export type CardColors = {
    bg: string; text: string; ring: string; glow: string; gradient: string;
};

export const COLOR_PALETTE: Record<string, CardColors> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10', gradient: 'from-emerald-500 to-emerald-600' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-100',    glow: 'bg-blue-500/10',    gradient: 'from-blue-500 to-blue-600'    },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100',   glow: 'bg-amber-500/10',   gradient: 'from-amber-500 to-amber-600'   },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100',    glow: 'bg-rose-500/10',    gradient: 'from-rose-500 to-rose-600'    },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100',  glow: 'bg-violet-500/10',  gradient: 'from-violet-500 to-violet-600'  },
    zinc:    { bg: 'bg-zinc-50',    text: 'text-zinc-600',    ring: 'ring-zinc-100',    glow: 'bg-zinc-500/10',    gradient: 'from-zinc-500 to-zinc-600'    },
};
