# Docker Deployment Guide

This guide explains how to deploy the AI Website Frontend using Docker and Docker Compose.

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Access to your server with SSH
- Domain configured (e.g., livekit-vyom.indusnettechnologies.com)

## 🏗️ Project Structure

```
ai_website_frontend/
├── Dockerfile                 # Multi-stage Docker build configuration
├── docker-compose.yml         # Docker Compose orchestration
├── .dockerignore             # Files to exclude from Docker build
├── .env                      # Environment variables (create locally; gitignored)
├── next.config.ts            # Next.js config with standalone output
└── types/
    └── globals.d.ts          # TypeScript declarations for non-JS imports (CSS, images)
```

## 🧭 Application Structure (`app/`)

The frontend has **two AI experiences** that share one engine. The folder layout
mirrors that: one folder per experience, plus a shared folder for everything common.

```
app/
├── dynamic/            # ① IMMERSIVE experience (full-window AI) — "Talk to our website"
│   ├── page.tsx        #    full-screen page chrome; mounts LiveKitRoom + <AgentInterface>
│   └── _components/    #    immersive-only chrome (ThreeBackground)
│
├── vani/               # ② CHAT-WINDOW experience — "Try Vani Today"
│   ├── page.tsx        #    INT hero page; drops the SAME widget.js external sites use
│   └── _components/    #    VaniWidget.tsx (loads /widget.js, manual mount/destroy)
│
├── embed/              # ③ EMBEDDABLE widget — Vani for ANY site (incl. our /vani)
│   ├── page.tsx        #    launcher orb ↔ popup card; runs inside the loader's iframe
│   ├── _components/    #    ChatWindowShell.tsx (the whole widget UI)
│   └── layout.tsx      #    forces a transparent background for the iframe
│
├── _shared/            # ④ SHARED — used by ALL of the above
│   ├── hooks/          #    the AI engine: LiveKit connection, agent messages, send
│   ├── types/          #    shared TypeScript types (agentTypes.ts)
│   ├── ui/             #    shared presentational components (CTAButton, PageBackground)
│   └── components/     #    the shared agent rendering layer:
│                       #      agent/AgentInterface  engine shell (variant: 'immersive' | 'window')
│                       #      agent/Canvas          the visual board (cards, maps, forms)
│                       #      agent/VoiceDock       the control bar (visualizer, mic, text)
│                       #      forms/ maps/ flashcard/ media/ primitives/
│
├── landing/page.tsx    # post-login page with the two CTA buttons
├── login/page.tsx
└── api/                # auth + health route handlers

public/
├── widget.js           # the embed LOADER — the one file customers reference
├── embed-demo.html     # a pretend third-party page for testing the embed locally
└── int-logo.svg        # INT Global logo asset
```

**Rules of thumb**
- UI used by only one experience → that experience's `_components/`.
- Anything used by both (logic, types, generic UI, agent rendering) → `_shared/`.
- `_shared/hooks` is the single source of AI logic and `_shared/components` the single
  source of agent UI — every experience renders the same `<AgentInterface>` (full-window
  in `/dynamic`; in a popup card in `/embed` via `variant="window"`). `/vani` doesn't
  render the agent itself: it loads `widget.js` → iframes `/embed`, exactly like an
  external site. One widget, one loader, no duplication.
- Import shared code from other folders with the `@/app/_shared/...` alias
  (configured in `tsconfig.json`). *Within* `_shared/` itself, sibling files use
  relative imports (e.g. `../types/agentTypes`).

## 🔌 Embedding Vani on another website

Vani can be dropped onto **any** website — your own marketing pages or a
customer's site — with a single line, without touching their HTML, CSS, or JS.

### For the site owner (the only thing they add)

```html
<script src="https://YOUR-VANI-HOST/widget.js" async></script>
```

That's it. A deep-navy glass launcher orb (with a living iridescent core) appears
bottom-right; a greeting card slides in on hover. Clicking it opens a chat card
with full voice + visual Vani. Optional override:

```html
<!-- serve /embed from a different host than the script itself -->
<script src="https://cdn.example.com/widget.js" data-vani-src="https://vani.example.com" async></script>
```

### How it stays isolated (and why it can't break their site)

```
 customer's page                     your Vani host
 ┌───────────────────────┐          ┌──────────────────────────────┐
 │  <script widget.js> ──────────▶  │  /widget.js  (tiny loader)    │
 │                       │          └──────────────────────────────┘
 │  ┌─────────────────┐  │  injects ONE cross-origin <iframe>
 │  │  <iframe> ───────────────────▶  /embed  (the whole widget UI)  │
 │  │  launcher/drawer │  │          render: <AgentInterface>        │
 │  └─────────────────┘  │            ├── Canvas     (visual board)  │
 └───────────────────────┘            └── VoiceDock  (control bar)   │
```

- **Everything Vani draws lives in a cross-origin `<iframe>`.** The host page's
  styles and scripts cannot reach in; Vani's cannot leak out. Zero collision.
- **`widget.js` adds exactly one DOM node** (the iframe) and no global CSS.
- The iframe **resizes itself** by posting `{ type: 'vani:resize', mode, width }`
  to the loader: a small bottom-right box when collapsed, a bottom-right popup card
  (400px, or 720px expanded) on desktop, full-screen on mobile. The loader also
  posts `{ type: 'vani:host', isMobile }` back so the iframe picks card-vs-fullscreen
  off the real host viewport (its own CSS `sm:` breakpoint can't see past the iframe).
  On desktop the rest of the host page stays clickable — only the corner is covered.
- **Mic** works because the iframe is granted `allow="microphone"`. The host page
  must be served over **HTTPS** for the browser to honor it.

### One engine, two views

The widget is not a separate AI — it renders the same shared engine as `/dynamic`.
(`/vani` shows this very widget, loaded through `widget.js`.) `<AgentInterface>` owns
the LiveKit room and composes two views that **always travel together**:

- **`Canvas`** — the visual board: flashcards, maps, forms, the idle starter screen.
- **`VoiceDock`** — the control bar: voice visualizer, mic toggle, text input.

Both read the same message stream; neither works alone. The split is for clarity
and reuse, not for shipping one without the other.

**Window-only open state (`variant="window"`).** The embed/`/vani` chat card tightens
the layout into one continuous surface (no header seam) and adds three behaviors the
immersive `/dynamic` view does not use:

- **Live transcript** — the welcome greeting is swapped for Vani's speech, typed out
  with a streaming caret as she talks.
- **Swipeable starter strip** — starter questions move to the bottom as a swipe strip
  (click to send) instead of a centered list.
- **Card carousel** — agent flashcards render ONE at a time in a sliding filmstrip
  (`CardCarousel`): the active card is centered, the rest are clipped off-screen (no
  peeking). It plays one slow auto-advance (first → last) then rests; drag / arrows /
  dots navigate manually. (The immersive `/dynamic` view keeps the vertical grid.)
- **White elevated card** — the carousel sits in a crisp white rounded panel (ring +
  soft shadow + symmetric padding) floating on the blue-glass window, so the text card
  reads cleanly like a standalone card. The surface is applied to the `CardCarousel`
  root, not per-card, so the carousel's `overflow-hidden` slide-clip never clips the
  shadow; cards render `chromeless` (flat) inside it.

`CardCarousel` and `SwipeDeck` both live in `_shared/components/primitives/` (the
starter strip uses `SwipeDeck`; flashcards use `CardCarousel`). All of this is gated on
`variant === 'window'`, so `/dynamic` is unchanged.

**Rich text cards.** The agent's `publish_rich_card` tool (`ui.rich_card`) sends a
text-only card — `{title, content (markdown), bullets[], chips[], visual_intent, icon}` —
for answers with no image/map/form. It renders through the same `Flashcard`: markdown body
(blue check bullets, accent headings, dividers), a structured `bullets` checklist, and
`chips` footer pills whose icons are auto-derived from each label. Images stay on
`publish_ui_stream`; rich cards are text-only.

### Test it locally

```bash
pnpm dev
# open the pretend third-party page:
#   http://localhost:3000/embed-demo.html
# or the widget surface on its own:
#   http://localhost:3000/embed
```

`/widget.js` and `/embed` are public (whitelisted in `proxy.ts`) so they load
without an `auth_session` cookie. To restrict which domains may embed Vani, add a
`Content-Security-Policy: frame-ancestors ...` header in front of `/embed`.

## 🚀 Quick Start

### 1. Configure Environment Variables

Create a `.env` file in the project root (it's the only env file; gitignored).
Add your values — see the full reference table at the bottom:

```env
# Real-time agent (client-side)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
NEXT_PUBLIC_BACKEND_URL=https://your-backend-host
NEXT_PUBLIC_PIXABAY_API_KEY=your_pixabay_api_key

# Auth (server-side only)
BACKEND_URL=https://your-backend-host
APP_URL=https://your-frontend-host          # this app's public origin (Google SSO redirect)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Build and Run with Docker Compose

```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f frontend
```

### 3. Verify Deployment

Check if the container is running:
```bash
docker-compose ps
```

Test the application:
```bash
curl http://localhost:3000
```

## 🔧 Docker Commands Reference

### Building

```bash
# Build the image
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build with specific tag
docker build -t ai-website-frontend:v1.0.0 .
```

### Running

```bash
# Start in detached mode
docker-compose up -d

# Start and view logs
docker-compose up

# Start specific service
docker-compose up frontend
```

### Managing Containers

```bash
# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart containers
docker-compose restart

# View running containers
docker-compose ps

# View logs
docker-compose logs -f frontend
```

### Debugging

```bash
# Execute shell in running container
docker-compose exec frontend sh

# View container resource usage
docker stats ai_website_frontend

# Inspect container
docker inspect ai_website_frontend
```

## 🌐 Production Deployment

### Option 1: Using Docker Compose (Recommended)

1. **Transfer files to server:**
```bash
# From your local machine
scp -r . user@your-server:/path/to/deployment/
```

2. **On the server:**
```bash
cd /path/to/deployment/
# Create .env with production values (the only env file)
nano .env

# Build and start
docker-compose up -d
```

### Option 2: Using Docker Registry

1. **Build and tag the image:**
```bash
docker build -t your-registry/ai-website-frontend:latest .
```

2. **Push to registry:**
```bash
docker push your-registry/ai-website-frontend:latest
```

3. **Pull and run on server:**
```bash
docker pull your-registry/ai-website-frontend:latest
docker-compose up -d
```

## 🔒 Reverse Proxy Configuration

### Using Caddy (Recommended)

Add to your `Caddyfile`:

```caddy
your-domain.com {
    reverse_proxy localhost:3000
    
    # Optional: Enable compression
    encode gzip
    
    # Optional: Add security headers
    header {
        Strict-Transport-Security "max-age=31536000;"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "no-referrer-when-downgrade"
    }
}
```

### Using Nginx

Add to your nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 Health Checks

The Docker Compose configuration includes a health check that pings `/api/health`. 

To create this endpoint, add `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 });
}
```

## 📊 Monitoring

### View Container Logs
```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 frontend

# Logs since specific time
docker-compose logs --since 30m frontend
```

### Resource Monitoring
```bash
# Real-time stats
docker stats ai_website_frontend

# Container processes
docker-compose top
```

## 🛠️ Troubleshooting

### TypeScript: "Cannot find module" for CSS imports

If you see `Cannot find module or type declarations for side-effect import of './globals.css'`, it means TypeScript doesn't recognize `.css` imports. The fix is already in `types/globals.d.ts`:

```typescript
declare module "*.css";
```

This tells TypeScript that CSS imports are valid (handled by Next.js/webpack at build time). If you add new non-JS file types (images, SVGs, etc.), add similar declarations:

```typescript
declare module "*.svg";
declare module "*.png";
```

### Container won't start
```bash
# Check logs
docker-compose logs frontend

# Check if port is already in use
sudo lsof -i :3000

# Rebuild without cache
docker-compose build --no-cache
```

### Environment variables not working
```bash
# Verify env vars in container
docker-compose exec frontend env | grep NEXT_PUBLIC

# Check .env file
cat .env
```

### Image too large
```bash
# Check image size
docker images | grep ai-website-frontend

# The multi-stage build should keep it under 200MB
# If larger, check .dockerignore is working
```

## 🔄 Updates and Rollbacks

### Deploy New Version
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Rollback
```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose build
docker-compose up -d
```

## 🔐 Authentication

Auth is split between Next.js (UI + cookie) and FastAPI (credential verification + JWT issuance).

### How it works

- **Username/Password:** Login form → Next.js `/api/auth` → FastAPI `POST /auth/login` → signed JWT → httpOnly cookie
- **Google SSO:** Google button → Next.js `/api/auth/google` → FastAPI OAuth flow → signed JWT → httpOnly cookie → `/landing`
- **Session gate:** `proxy.ts` checks the `auth_session` cookie on every request and enforces its `expiresAt`. Cookie lifetime is set in `app/api/auth/google/callback/route.ts`: admins get 30-day sessions; clients use the backend's `expires_at`, falling back to 4h.

### Auth flow diagram

```
Username/Password:
  Browser → POST /api/auth → FastAPI /auth/login → JWT → cookie set by Next.js

Google SSO:
  Browser → /api/auth/google → FastAPI /auth/google → Google consent
  → FastAPI /auth/google/callback → JWT → Next.js /api/auth/google/callback → cookie → /landing
```

### Backend setup

The FastAPI backend must expose `POST /auth/login` (username/password → JWT) and the
Google OAuth flow (`/auth/google` → consent → `/auth/google/callback`). The Next.js
route handlers in `app/api/auth/*` proxy to it and set the httpOnly `auth_session` cookie.

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit WebSocket URL | `wss://livekit-vyom.indusnettechnologies.com` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL (public, used client-side) | `https://api.indusnettechnologies.com` |
| `NEXT_PUBLIC_PIXABAY_API_KEY` | Pixabay API key for images | `your_api_key_here` |
| `BACKEND_URL` | Backend API URL (server-side only, for auth proxy; falls back to `NEXT_PUBLIC_BACKEND_URL`) | `https://api.indusnettechnologies.com` |
| `APP_URL` | This frontend's public origin — builds the Google SSO redirect (defaults to `http://localhost:3000`) | `https://vani.indusnettechnologies.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | from Google Cloud Console |
| `NODE_ENV` | Node environment | `production` |

## 🎯 Best Practices

1. **Always use `.env` file** - Never hardcode secrets in docker-compose.yml
2. **Use specific image tags** - Avoid `latest` in production
3. **Enable health checks** - Monitor container health
4. **Set resource limits** - Prevent container from consuming all resources
5. **Use volumes for logs** - Persist logs outside container
6. **Regular backups** - Backup your `.env` and configuration files
7. **Monitor logs** - Set up log aggregation (ELK, Loki, etc.)
8. **Security scanning** - Scan images for vulnerabilities

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose exec frontend env`
3. Check container status: `docker-compose ps`
4. Review this guide's troubleshooting section
