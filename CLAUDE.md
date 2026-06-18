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
     (topics like `ui.flashcard`, `ui.infographic`, `ui.contact_form`, `ui.meeting_form`,
     `map.polyline`, `ui.global_presence`, `ui.nearby_offices`, `ui.office_details`,
     `ui.job_application`, `ui.location_request`).
   - `useInteractionControl` — voice/text mode, mic toggle, `sendText` (topic `lk.chat`).
   - `useContextSync` — pushes UI/user context snapshots back to the agent
     (topics `ui.context`, `user.context`).

Message/UI shapes live in `app/_shared/types/agentTypes.ts` (`ChatMessage` and the
per-feature data types). Import types from there, not through the hooks.

**Two card types — routed by `payload.type`, not topic.** The agent sends two visual
cards over the data channel: `flashcard` (image-led) and `infographic` (composed,
text-led — replaces the old `rich_card`). `ui.flashcard` is the deck stream
(`publish_ui_stream`; each packet is one card of either type + `stream_id`/`card_index`,
closed by an `end_of_stream` marker); `ui.infographic` is a single agent-authored
infographic (`publish_infographic`, instant). `useAgentMessages` routes by
`data.type` (topic is a fallback) and treats flashcard + infographic as one deck for
grouping/clearing. `CardDisplay` renders both per-card: flashcards via `Flashcard`,
infographics via `InfographicRenderer`. (`rich_card` is gone; kept only as a defensive
alias → infographic.)

**Flashcard** (`_shared/components/flashcard/`) — the classic look: renders flat
(`chromeless`) directly on the widget glass in the **window** variant (no white panel),
on a soft scrim in **immersive**. Body markdown goes through shared `MD_COMPONENTS`
(`flashcard/markdownComponents.tsx` — blue check-circle bullets, accent-barred headings,
gradient dividers); `bullets`→check list, `chips`→footer pills (`chipIcon`).

**Infographic** (`_shared/components/infographic/`) — its OWN polished elevated card
(top blue→emerald accent rail, ring + shadow). `InfographicRenderer` renders a header
(icon + title), optional `hero` (description + `PresetGraphic`), ordered `sections[]`
(`markdown` | `bullet_list` | `icon_bullets` | `stats` | `cta_banner` via `blocks.tsx`),
and `chips`. `PresetGraphic` maps a key (`devops_loop`, `cicd_pipeline`, `cloud_stack`,
`ai_workflow`, `security_shield`, `growth_chart`, `web_development`, `data_analytics`,
`team_collaboration`, `digital_marketing`) → a bundled animated SVG illustration, and
renders nothing on an unknown key; keep the key list in sync with the backend prompt. Unknown section types
degrade to a markdown block. `visual_intent` (`neutral|urgent|success|warning|processing`)
picks the accent via `INTENT_COLORS`. Entrance is Apple-style: `.md-stagger` cascade +
`cardVariants` spring. The backend payload shape + canonical preset-key list live in
`docs/INFOGRAPHIC_BACKEND_SPEC.md` — the source of truth when adding section types or
preset keys.

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
        ├── forms/ maps/ flashcard/ infographic/ media/
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
- `docs/` — backend contract specs (e.g. `INFOGRAPHIC_BACKEND_SPEC.md`).
- Styling is Tailwind v4 (no config file; theme vars in `app/globals.css`),
  inline classNames only, framer-motion for animation. Light theme (`slate`/`blue`).

## Deployment

Dockerized (multi-stage, standalone output). See `README.md` for docker-compose,
reverse-proxy (Caddy/Nginx), and the full env-var reference. Health check: `/api/health`.
Key env vars: `NEXT_PUBLIC_LIVEKIT_URL`, `NEXT_PUBLIC_BACKEND_URL`, `BACKEND_URL`,
`GOOGLE_CLIENT_ID/SECRET`, `NEXT_PUBLIC_PIXABAY_API_KEY`.
