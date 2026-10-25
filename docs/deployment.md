# RocketLaunch — Production Deployment & Operations Guide

**Owner:** Anand — Testing & Quality Assurance Engineer  
**Related Components:** `package.json`, `next.config.mjs`, `.env.example`, `.env.local`

---

## 1. Overview & Deployment Status

> [!IMPORTANT]
> **Deployment Status Notice:** RocketLaunch is currently operating and fully validated in local development and production-build testing mode (`localhost:3000`). Public cloud deployment to production infrastructure has **not yet been executed** and remains pending explicit user authorization.

This document outlines the hosting prerequisites, production build procedure, environment variable security, and post-deployment verification checklist for deploying RocketLaunch to cloud environments (e.g., Vercel, Node.js Container, AWS ECS, or DigitalOcean App Platform).

---

## 2. Hosting Requirements & Runtime

* **Runtime:** Node.js 18.18+ or Node.js 20+ LTS (verified on Node.js v25.7.0 and LTS v20.18.0 via `.nvmrc`).
* **Framework:** Next.js 15 App Router with React 19.
* **Server Architecture:** Must support Next.js Route Handlers (`/api/launches`, `/api/ai`, `/api/animations/frames`). Static export (`output: 'export'`) is *not* used because server-side API proxying and secure AI secret isolation require a Node.js server runtime.
* **Static Assets:** The `public/animations/rocket-launch/` directory contains 300 sequential PNG frames (~20 MB total) which should be cached aggressively with HTTP `Cache-Control: public, max-age=31536000, immutable`.

---

## 3. Production Build Procedure

Execute the following commands to create and start a production build locally or in a CI/CD container:

```bash
# 1. Install production dependencies
npm ci --only=production

# 2. Run sequential rocket frame discovery & generate manifest
npm run discover-frames

# 3. Run automated verification suite
npm test

# 4. Generate optimized Next.js production build
npm run build

# 5. Start the production server
npm run start
```

### Build Artifacts:
* `.next/standalone` or `.next/`: Optimized production bundle with tree-shaken server routes and minified client assets.
* `public/animations/rocket-launch/manifest.json`: Pre-indexed frame registry for canvas sequencing.

---

## 4. Environment Variables Configuration

All secrets must be injected through hosting environment settings (e.g., Vercel Project Settings, Docker secrets, or Kubernetes Secret Manager). **Never commit real keys to Git.**

| Variable | Required? | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DEEPSEEK_API_KEY` | Optional | `sk-fc44...` | Authenticates server-side requests to DeepSeek AI API. If omitted, the platform remains 100% functional, and the AI panel gracefully displays setup instructions. |
| `DEEPSEEK_MODEL` | Optional | `deepseek-chat` | Specifies the DeepSeek LLM model identifier. |
| `NODE_ENV` | Automatic | `production` | Enables production optimizations, minification, and telemetry stripping. |
| `PORT` | Optional | `3000` | Port for the production Node.js HTTP server. |

---

## 5. Security & Secret Isolation

1. **Server-Side API Proxying:**
   The `DEEPSEEK_API_KEY` is referenced *strictly* inside server route handlers (`app/api/ai/route.js`). It is never prefixed with `NEXT_PUBLIC_` and is never bundled into client JavaScript.
2. **Input Sanitization & Rate Limiting:**
   User questions to the AI route are capped at 500 characters and sanitized to prevent prompt injection or denial-of-service via oversized payloads.
3. **Upstream Rate Limit Protection:**
   The launch telemetry route (`app/api/launches/route.js`) enforces a 60-second in-memory cache to prevent abuse of the public Launch Library 2 API tier.
4. **Content Security Policy & CORS:**
   Next.js API routes restrict allowed HTTP methods (`GET` for launches, `POST` for AI briefs) and validate Content-Type headers.

---

## 6. Production Verification Checklist

Run through this verification checklist once the application is running in the staging/production environment:

- [ ] **Home Page (`/`):** Canvas animation smoothly renders rocket ascent on scroll.
- [ ] **Next-Launch Countdown:** Accurately displays days, hours, minutes, seconds synchronized with UTC spaceport clocks.
- [ ] **Dual Timezone:** Both UTC and Indian Standard Time (IST) render properly with correct hour/minute conversions.
- [ ] **Unique Rocket Images:** Consecutive flight cards display distinct real spaceflight photography without duplicate images.
- [ ] **Spaceport Maps:** Clicking "Spaceport Map" opens Google Maps centered on the pad coordinates.
- [ ] **Mission Archive (`/archive`):** Historical flights load, filter by outcome (Success/Failure), and sort accurately.
- [ ] **AI Intelligence (`/ai`):** When `DEEPSEEK_API_KEY` is present, executive briefs generate successfully. When missing, the setup guidance notice is displayed without errors.
- [ ] **Bookmarks (Favorites):** Clicking the heart bookmark persists in LocalStorage and syncs across browser tabs.
- [ ] **Error Handling:** If network connectivity is cut, an honest `ErrorState` with retry button is displayed.
