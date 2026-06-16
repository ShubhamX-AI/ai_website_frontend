# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`).

```bash
pnpm install          # install deps
pnpm dev              # run dev server (Next.js 16, Turbopack) on :3000
pnpm build            # production build
pnpm start            # serve the production build
pnpm lint             # eslint (eslint-config-next)
```

There is no test suite. After non-trivial changes, verify with `npx tsc --noEmit`
and `pnpm build` — both must pass.

## Big picture

A Next.js 16 (app router, React 19, Tailwind v4, TypeScript) frontend for an
AI website. The product has **two AI experiences that share one engine**:

- **`/dynamic`** — the *immersive* full-window experience ("Talk to our website").
- **`/vani`** — the *chat-window* experience ("Try Vani Today"). An INT hero page
  that drops the **same `public/widget.js`** external sites embed (it iframes
  `/embed`) — so `/vani` and customers' sites show the identical widget.
- **`/embed`** — the single widget surface the loader iframes; renders the chat-window
  UI (`ChatWindowShell` → `AgentInterface variant="window"`).

`/dynamic` renders the agent directly; `/vani` and external sites reach it through
the widget. The real-time agent logic lives in `app/_shared/` — do not duplicate it.

### Real-time agent (LiveKit)

The AI is a LiveKit voice/text agent, not a request/response API:

1. `useLiveKitConnection` fetches a room token from `NEXT_PUBLIC_BACKEND_URL/api/getToken`.
2. The page mounts `<LiveKitRoom>` and renders the experience view inside it.
3. `useAgentInteraction` composes three hooks:
   - `useAgentMessages` — parses inbound LiveKit **data-channel** messages and
     transcriptions into a `Map<id, ChatMessage>`. UI is message-type driven
     (topics like `ui.flashcard`, `ui.rich_card`, `ui.contact_form`, `ui.meeting_form`,
     `map.polyline`, `ui.global_presence`, `ui.nearby_offices`, `ui.office_details`,
     `ui.job_application`, `ui.location_request`).
   - `useInteractionControl` — voice/text mode, mic toggle, `sendText` (topic `lk.chat`).
   - `useContextSync` — pushes UI/user context snapshots back to the agent
     (topics `ui.context`, `user.context`).

Message/UI shapes live in `app/_shared/types/agentTypes.ts` (`ChatMessage` and the
per-feature data types). Import types from there, not through the hooks.

**Flashcard / rich text card.** `ui.flashcard` and `ui.rich_card` both parse into the
same `flashcard` `ChatMessage` and render through `Flashcard` (`_shared/components/flashcard/`).
The agent's `publish_rich_card` tool sends `{title, content (markdown), bullets[], chips[],
visual_intent, icon}`; `content` maps to `cardData.value`. `Flashcard` renders markdown via
custom `ReactMarkdown` `MD_COMPONENTS` (blue check-circle bullets, accent-barred headings,
gradient dividers), then the structured `bullets` as a check list and `chips` as footer
pills with icons auto-derived from the label (`chipIcon` in `flashcardThemes.ts`).
`visual_intent` (`neutral|urgent|success|warning|processing`) picks the accent via
`INTENT_COLORS`. Entrance is Apple-style: the `.md-stagger` CSS cascade (`globals.css`) +
`cardVariants` spring. In the **window** variant the card renders `chromeless` inside a
white elevated panel — the panel (rounded, ring, shadow, symmetric padding) is applied to
the `CardCarousel` root in `CardDisplay`, not per-card, so the carousel's `overflow-hidden`
slide-clip doesn't clip the shadow.

### Auth

Split between Next.js (UI + cookie) and a FastAPI backend (credential check + JWT):

- `proxy.ts` is the route gate (Next.js middleware). It allows `/login` and
  `/api/auth/*`, otherwise requires the `auth_session` cookie and enforces its
  `expiresAt`. Edit `proxy.ts` to change which routes are public.
- `app/api/auth/*` route handlers proxy to FastAPI and set the httpOnly cookie.
  Google SSO flows through `/api/auth/google` → callback. See README "Authentication".

## Directory model (`app/`)

```
app/
├── dynamic/   route  — immersive page chrome; mounts LiveKitRoom + <AgentInterface>.
│                       _components/ holds only dynamic-specific chrome (ThreeBackground).
├── vani/      route  — INT hero page; drops the same widget external sites use via
│                       vani/_components/VaniWidget (loads /widget.js → iframes /embed).
├── embed/     route  — the single widget surface the loader iframes. page.tsx owns the
│                       LiveKit lifecycle + iframe postMessage; _components/ChatWindowShell
│                       is the chat-window UI (mounts <AgentInterface variant="window">).
│                       layout.tsx forces a transparent background.
├── landing/   route  — post-login page with the two CTA buttons
├── login/     route
├── api/       route handlers (auth, health)
└── _shared/   NOT a route — code used by more than one route
    ├── hooks/       the AI engine (LiveKit connection, messages, interaction, context sync)
    ├── types/       agentTypes.ts
    ├── ui/          CTAButton, PageBackground
    └── components/  the shared agent rendering layer:
        ├── agent/        AgentInterface (prop `variant: 'immersive' | 'window'`), CardDisplay, …
        ├── forms/ maps/ flashcard/ media/
        └── primitives/   SmartIcon, StarterScreen, BarVisualizer, useAudioFFT, DynamicImage
```

`public/widget.js` is the loader — the one file external sites (and `/vani`) reference;
it iframes `/embed`. See README "Embedding Vani".

Conventions:
- **Routes stay flat under `app/`** — Next.js maps folder → URL. Never move
  `login`/`landing`/`api` into `_shared`.
- UI used by **one** route → that route's `_components/` (e.g. `ChatWindowShell` is
  embed-only). Used by **more than one** → `_shared/`. The agent rendering layer
  (`AgentInterface` and its tree) lives in `_shared/components/` because both `/dynamic`
  and `/embed` render it; `/embed` passes `variant="window"` to tighten spacing.
- The `_` prefix marks a folder as non-route (Next.js ignores it for routing).
- Import shared code from other folders via the `@/*` alias (maps to repo root,
  so `@/app/_shared/...`, `@/lib/...`). *Within* `_shared/`, siblings use relative
  imports (e.g. `../types/agentTypes`).

## Other top-level code

- `lib/` — Pixabay image helpers (`@/lib/pixabay`), used for rich media in flashcards.
- `livekit_modular/` — a self-contained LiveKit assistant module
  (`LiveKitAssistantProvider`, `SimpleVoiceAssistant`, transcription hooks),
  separate from the `app/dynamic` implementation.
- `types/globals.d.ts` — declares non-JS imports (e.g. `*.css`) for TypeScript.
- Styling is Tailwind v4 (no config file; theme vars in `app/globals.css`),
  inline classNames only, framer-motion for animation. Light theme (`slate`/`blue`).

## Deployment

Dockerized (multi-stage, standalone output). See `README.md` for docker-compose,
reverse-proxy (Caddy/Nginx), and the full env-var reference. Health check: `/api/health`.
Key env vars: `NEXT_PUBLIC_LIVEKIT_URL`, `NEXT_PUBLIC_BACKEND_URL`, `BACKEND_URL`,
`GOOGLE_CLIENT_ID/SECRET`, `NEXT_PUBLIC_PIXABAY_API_KEY`.
