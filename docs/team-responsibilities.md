# RocketLaunch — Team Allocation & File Ownership Matrix

This document defines the functional responsibilities, exact source file ownership, and integration interfaces for all five engineering team members.

---

## Team Allocation & File Mapping

### 1. Gousiya M — UI and Responsive Design
* **Primary Scope:** Global styling, navigation, page layout, cinematic hero presentation, and responsive design systems.
* **Owned Files:**
  - `app/layout.js` — Global document root, fonts, meta tags, accessibility landmarks.
  - `app/globals.css` — CSS design tokens (Midnight Obsidian `#070910`, Electric Cyan `#65F6FF`, Solar Amber `#FFB45C`), glassmorphism, responsive utilities.
  - `components/layout/Navbar.js` — Responsive navigation bar, mobile menu drawer, live status pill.
  - `components/layout/Footer.js` — Data disclosures, flight telemetry citations, team credits.
  - `components/hero/CinematicHero.js` — Editorial opening typography, CTAs, telemetry badges.
  - `components/ui/Badge.js`, `LoadingSkeleton.js`, `ErrorState.js`, `EmptyState.js` — Shared design system primitives.
* **Integration Interfaces:** Provides consistent styling tokens and layout wrappers consumed by all feature components.

---

### 2. Thirumalesh — Launch API Integration
* **Primary Scope:** Launch Library 2 API integration, server-side data fetching, normalization, error handling, and caching.
* **Owned Files:**
  - `services/launchApi.js` — Resilient fetch client with automatic failover across LL2 endpoints, in-memory 60s TTL cache, rate-limit protection.
  - `app/api/launches/route.js` — Next.js API Route handler for upcoming launches, historical flights, and ID lookups.
  - `utils/launchNormalizer.js` — Data sanitizer converting raw LL2 2.3.0/2.2.0 responses into clean, guaranteed flight objects.
* **Integration Interfaces:** Exposes `normalizeLaunch` and `fetchUpcomingLaunches` / `fetchHistoricalLaunches` returning typed payloads with `{ id, name, net, rocket, agency, pad, status, mission, image }`.

---

### 3. Ujwal — Countdown and Core Logic
* **Primary Scope:** Real-time countdown engine, next upcoming launch selection algorithm, date/time calculations, and tab-wake synchronization.
* **Owned Files:**
  - `utils/dateUtils.js` — `calculateCountdown()`, `padZero()`, `formatUtcDateTime()`, `formatLocalDateTime()`.
  - `utils/nextLaunchSelector.js` — `selectNextUpcomingLaunch()` prioritizing the earliest future flight and filtering cancelled/failed operations.
  - `hooks/useCountdown.js` — Zero-drift 1000ms countdown hook with `visibilitychange` listener for instant tab wake recalibration.
  - `components/countdown/LaunchCountdown.js` — Prominent next-launch telemetry card with status message.
  - `components/countdown/CountdownDigits.js` — Monospace tabular digits display for Days, Hours, Minutes, Seconds.
* **Integration Interfaces:** Consumes normalized launches from Thirumalesh and delivers live countdown states to Gousiya's layout and Tarunya Sree's mission views.

---

### 4. V Tarunya Sree — Mission Discovery
* **Primary Scope:** Mission discovery grid, search, dynamic filtering, flight dossier modal, standalone dossier route, and user bookmarks.
* **Owned Files:**
  - `components/missions/MissionFilters.js` — Multi-faceted filter bar (feed tabs, dynamic agency dropdown, status dropdown, sorting, bookmarks toggle).
  - `components/missions/MissionCard.js` — Visual flight card with image fallbacks and bookmark toggle.
  - `components/missions/MissionGrid.js` — Responsive grid layout handling skeletons, empty states, and errors.
  - `components/missions/MissionDetailsModal.js` — Modal dialog with comprehensive flight telemetry, orbit parameters, and webcast links.
  - `app/missions/[id]/page.js` — Standalone deep-linkable mission dossier page.
  - `hooks/useFavorites.js` — LocalStorage persistent bookmarks synchronized across browser tabs via `useSyncExternalStore`.
* **Integration Interfaces:** Feeds selected mission context to Anand's AI Mission Intelligence and renders Thirumalesh's flight records.

---

### 5. Anand — Integration, Testing and Documentation
* **Primary Scope:** System integration, automated testing suite, frame discovery engine, DeepSeek AI intelligence service, and documentation.
* **Owned Files:**
  - `tests/unit-and-integration.test.js` — Automated verification suite covering countdown math, next-launch selector, normalizer, frame discovery, and AI security.
  - `utils/frameDiscovery.js` — Recursive image scanner, natural numeric sorter, safe asset copier, and manifest generator.
  - `scripts/discover-frames.js` — Standalone CLI runner for automated frame discovery (`npm run discover-frames`).
  - `app/api/animations/frames/route.js` — Dynamic frame discovery API endpoint.
  - `components/hero/RocketLaunchSequence.js` — High-performance HTML Canvas scroll-controlled animation player with progressive loading.
  - `hooks/useFrameDiscovery.js` — Hook for preloading and caching frame manifests.
  - `services/deepseekApi.js` & `app/api/ai/route.js` — Grounded AI reasoning engine with strict anti-hallucination prompts.
  - `components/ai/MissionIntelligence.js` — AI workbench for briefs, Q&A, mission comparison, and concept explanation.
  - `docs/architecture.md`, `docs/team-responsibilities.md`, `docs/contribution-guide.md`, `README.md`.
* **Integration Interfaces:** Verifies end-to-end compatibility across all modules, runs production builds, and guarantees release stability.

---

## File Modification Rules

1. **Strict File Ownership:** Each developer has primary authority over their assigned files.
2. **Interface Contracts:** Modifying function signatures in `utils/` or `services/` requires coordination with dependent components.
3. **No Duplicate Implementations:** All shared logic resides in `utils/`, `services/`, and `hooks/`.
4. **Environment Safety:** Never commit `.env.local` or hardcode API credentials. Only update `.env.example`.
