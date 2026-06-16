// ─── Color System ──────────────────────────────────────────────────────────
// Derived purely from visual_intent — never sent by backend

// ─── Chip icon mapping ───────────────────────────────────────────────────────
// Derive a Lucide icon for a footer chip from its label keywords (realtime, no
// backend hint). First keyword hit wins; falls back to a neutral tag.
const CHIP_ICON_RULES: [RegExp, string][] = [
    [/bank|financ|fintech|invest|insur|capital|wealth/, 'landmark'],
    [/retail|commerce|shop|store|ecommerce|consumer/, 'shopping-cart'],
    [/health|medical|pharma|clinic|hospital|care|wellness/, 'heart-pulse'],
    [/tech|software|saas|it|cloud|data|ai|ml|cyber/, 'cpu'],
    [/edu|learn|school|academ|student|training/, 'graduation-cap'],
    [/travel|airline|aviation|tourism|hospitality|hotel/, 'plane'],
    [/real.?estate|property|construction|housing|realty/, 'building-2'],
    [/manufactur|industr|factory|automotive|logistic|supply/, 'factory'],
    [/media|entertain|gaming|content|stream|publish/, 'clapperboard'],
    [/energy|oil|gas|power|util|solar|renewable/, 'zap'],
    [/telecom|network|mobile|communicat/, 'radio-tower'],
    [/gov|public|legal|law|compliance/, 'scale'],
    [/food|restaurant|grocery|agri|farm/, 'utensils'],
    [/sport|fitness|gym/, 'dumbbell'],
];

export function chipIcon(label: string): string {
    const l = label.toLowerCase();
    for (const [re, icon] of CHIP_ICON_RULES) {
        if (re.test(l)) return icon;
    }
    return 'tag';
}

export type CardColors = {
    bg: string; text: string; ring: string; glow: string;
};

// ─── Color System ──────────────────────────────────────────────────────────
// Keyed directly on visual_intent — never sent by backend.
export const INTENT_COLORS: Record<string, CardColors> = {
    urgent:     { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100',    glow: 'bg-rose-500/10'    },
    warning:    { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100',   glow: 'bg-amber-500/10'   },
    success:    { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10' },
    processing: { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-100',    glow: 'bg-blue-500/10'    },
    neutral:    { bg: 'bg-zinc-50',    text: 'text-zinc-600',    ring: 'ring-zinc-100',    glow: 'bg-zinc-500/10'    },
};
