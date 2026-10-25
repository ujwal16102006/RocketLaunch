# RocketLaunch — Team Allocation & File Ownership Matrix

This document defines the functional responsibilities, exact source file ownership, shared interfaces, cross-member dependencies, and testing expectations for all five engineering team members.

---

## Team Allocation & File Mapping

### 1. V Tarunya Sree — UI & Layout Engineer

* **Engineering Domain:** Global application layout, navigation, visual consistency, and shared presentation primitives.
* **Primary Responsibilities:**
  - Global application layout and navigation structure.
  - Cinematic hero presentation and visual layout.
  - Responsive header/navbar with live countdown badge, and responsive footer.
  - Responsive styling and shared UI components (Badge, LoadingSkeleton, ErrorState, EmptyState).
  - Visual consistency, accessibility (ARIA attributes), dark-mode color balance, and reduced-motion presentation.
* **Primary Ownership:**
  - `app/layout.js` — Global HTML document shell, typography, viewport metadata.
  - `app/globals.css` — CSS design tokens (Midnight Obsidian `#070910`, Electric Cyan `#65F6FF`, Solar Amber `#FFB45C`), glassmorphism, responsive utilities.
  - `components/layout/Navbar.js` — Navigation header with live T-minus pill and mobile navigation drawer.
  - `components/layout/Footer.js` — Telemetry source citations, engineering credits, and back-to-top interaction.
  - `components/hero/CinematicHero.js` — Headline typography, badge overlay, and call-to-action controls.
  - `components/ui/Badge.js`, `components/ui/LoadingSkeleton.js`, `components/ui/ErrorState.js`, `components/ui/EmptyState.js` — Shared UI design primitives.
* **Shared Interfaces:**
  - Provides layout containers and styled UI tokens consumed by Thirumalesh (countdown banners) and Ujwal (mission grids and AI panels).
  - Consumes `nextLaunch` object from Thirumalesh to display live status pill in `Navbar.js`.
* **Dependencies on Other Members:**
  - Depends on Thirumalesh for `selectNextUpcomingLaunch()` in the Navbar badge.
  - Depends on Anand for `RocketLaunchSequence.js` canvas canvas component placed inside the Hero.
* **Testing Expectations:**
  - Verify responsive rendering on mobile (375px), tablet (768px), and desktop (1280px+).
  - Confirm high contrast and accessibility compliance across dark surfaces.

---

### 2. Gousiya M — Launch API Integration Engineer

* **Engineering Domain:** Launch Library 2 API integration, data ingestion, flight record normalization, and request resilience.
* **Primary Responsibilities:**
  - Launch Library 2 API integration and HTTP communication.
  - Fetching and validating live launch records for upcoming and previous flights.
  - Normalizing raw LL2 2.3.0 and 2.2.0 API responses into clean, predictable mission schemas.
  - Handling API rate limits, HTTP status codes, network errors, and empty results honestly without fabricated data.
  - In-memory 60s TTL caching, automatic endpoint failovers, and retry management.
* **Primary Ownership:**
  - `services/launchApi.js` — Fetch client with multi-endpoint failover (`lldev` and `ll`), 60s in-memory caching, and error resilience.
  - `app/api/launches/route.js` — Next.js API route handler supporting `type=upcoming`, `type=previous`, and `id` lookups.
  - `utils/launchNormalizer.js` — Data sanitizer mapping raw payloads into unified flight objects (`id`, `name`, `net`, `rocket`, `agency`, `pad`, `status`, `mission`, `image`, `padImage`, `configImage`).
  - `docs/api-integration.md` — Complete specification of LL2 endpoints, request parameters, caching, and failover behavior.
* **Shared Interfaces:**
  - Exposes `normalizeLaunch()` and `normalizeLaunchList()` returning clean mission models.
  - Supplies normalized flight records to Thirumalesh (countdown selection) and Ujwal (mission discovery and cards).
* **Dependencies on Other Members:**
  - Works with Ujwal to guarantee normalized flight objects contain all required pad, agency, and image fields needed for cards.
  - Works with Anand to provide mock payloads for normalizer unit tests.
* **Testing Expectations:**
  - Validate that missing, null, or unexpected API fields do not throw unhandled exceptions.
  - Verify that 429 and 500 API responses return structured, user-friendly JSON error objects.

---

### 3. Thirumalesh — Countdown & Core Logic Engineer

* **Engineering Domain:** High-precision countdown calculation, master launch scheduling, and timezone synchronization.
* **Primary Responsibilities:**
  - Selecting the single earliest eligible upcoming spaceflight while filtering past, cancelled, or hold flights.
  - High-precision countdown arithmetic (Days, Hours, Minutes, Seconds).
  - Zero-drift 1000ms timer ticking with automatic tab-wake recalibration (`visibilitychange`).
  - Dual timezone formatting (UTC & Indian Standard Time - IST) and spaceport satellite map coordinate resolution.
  - Countdown error handling for invalid timestamps, missing dates, and expired T-0 flights.
* **Primary Ownership:**
  - `utils/dateUtils.js` — `calculateCountdown()`, `padZero()`, `formatUtcDateTime()`, `formatIstDateTime()`, `getSpaceportMapUrl()`.
  - `utils/nextLaunchSelector.js` — Earliest future launch selection algorithm.
  - `hooks/useCountdown.js` — React countdown hook with drift-free interval and visibility synchronization.
  - `components/countdown/LaunchCountdown.js` — Featured live countdown banner with status badges and action links.
  - `components/countdown/CountdownDigits.js` — Monospace tabular digits display for Days, Hours, Minutes, Seconds.
* **Shared Interfaces:**
  - Exposes `selectNextUpcomingLaunch(launches)` used by `app/page.js`, `app/launches/page.js`, and `components/layout/Navbar.js`.
  - Exposes `useCountdown(net)` consumed by both `LaunchCountdown.js` and `MissionCard.js`.
* **Dependencies on Other Members:**
  - Consumes normalized launch manifests from Gousiya (`utils/launchNormalizer.js`).
  - Delivers countdown state and next-flight context to Tarunya Sree (`Navbar.js`) and Ujwal (`MissionCard.js`).
* **Testing Expectations:**
  - Unit test future timestamp positive formatting, expired timestamp fallback, and zero padding.
  - Verify that next-launch selector correctly ignores cancelled/failed operations and selects the earliest future timestamp.

---

### 4. Ujwal — Mission Discovery & AI Intelligence Lead

* **Engineering Domain:** Mission discovery, search & filtering, cards, dossiers, bookmarks, and DeepSeek AI mission intelligence.
* **Primary Responsibilities:**
  - Mission cards, grid discovery, real-time search, multi-faceted filtering, and sorting.
  - Guaranteeing unique, authentic spaceflight photography across all cards with zero duplicates.
  - Flight dossier modal dialog and standalone deep-linkable mission dossier route (`/missions/[id]`).
  - Persistent user bookmarks (favorites) with cross-tab synchronization via `useSyncExternalStore`.
  - DeepSeek AI server-side integration (`/api/ai`), structured prompt engineering, and grounded mission briefings/Q&A.
  - Overall coordination of component contracts and feature integration.
* **Primary Ownership:**
  - `components/missions/MissionFilters.js` — Filter controls (agency pills, flight status, sorting, favorites toggle).
  - `components/missions/MissionCard.js` — Interactive flight card featuring distinct rocket photography, live T-0, dual timezone, and spaceport map button.
  - `components/missions/MissionGrid.js` — Responsive layout managing skeletons, empty states, and error retries.
  - `components/missions/MissionDetailsModal.js` — In-depth mission telemetry modal with rocket photo banner, orbit info, and AI brief generator.
  - `app/missions/[id]/page.js` — Standalone deep-linkable mission dossier page.
  - `hooks/useFavorites.js` — Reactive localStorage bookmarks hook with storage event sync.
  - `utils/rocketImageResolver.js` — Intelligent rocket photograph de-duplication engine ensuring distinct real imagery for every card.
  - `services/deepseekApi.js` — DeepSeek API client with strict grounding prompts, payload validation, and anti-hallucination rules.
  - `app/api/ai/route.js` — Server-side AI route handler for briefs, Q&A, and mission comparisons.
  - `components/ai/MissionIntelligence.js` — Interactive AI terminal supporting executive briefs, launch Q&A, and mission comparisons.
* **Shared Interfaces:**
  - Consumes normalized launch records from Gousiya (`services/launchApi.js`).
  - Consumes countdown calculations and dual timezone formatting from Thirumalesh (`utils/dateUtils.js`).
  - Utilizes Tarunya Sree's design tokens and UI components (`components/ui/*`).
* **Dependencies on Other Members:**
  - Works with Anand for test coverage on unique image de-duplication and AI security error states.
  - Coordinates integration but adheres strictly to peer review standards without overwriting team members' assigned files.
* **Testing Expectations:**
  - Verify that search, agency filters, and status filters update the card grid reactively without full page reloads.
  - Confirm that AI endpoints return structured `setupRequired` warnings when `DEEPSEEK_API_KEY` is not present, without crashing.
  - Ensure 100% unique images across all rendered cards in any manifest view.

---

### 5. Anand — Testing & Quality Assurance Engineer

* **Engineering Domain:** Test architecture, automated verification, frame discovery, build stability, and quality documentation.
* **Primary Responsibilities:**
  - Automated unit and integration testing suite covering all functional modules.
  - Verifying edge cases, API failure modes, missing fields, and AI security scenarios.
  - Rocket animation frame discovery engine, natural numeric sorting, asset verification, and manifest generation.
  - HTML Canvas scroll-controlled rocket animation component (`RocketLaunchSequence.js`).
  - Regression checking, build verification (`npm run build`), and GitHub readiness audit.
  - Authoring and maintaining test guides, deployment specifications, and release documentation.
* **Primary Ownership:**
  - `tests/unit-and-integration.test.js` — Comprehensive automated test suite executed via `npm test`.
  - `utils/frameDiscovery.js` — Recursive image scanner, natural numeric sorter, asset copier, and manifest generator.
  - `scripts/discover-frames.js` — Standalone CLI script executed via `npm run discover-frames`.
  - `components/hero/RocketLaunchSequence.js` — HTML Canvas scroll-driven animation player with progressive buffering and procedural fallback.
  - `hooks/useFrameDiscovery.js` — Client-side hook for preloading and caching frame manifests.
  - `docs/testing-guide.md` — Detailed test suite structure, test cases, and pass/fail criteria.
  - `docs/deployment.md` — Production build procedures, environment variable security, and hosting requirements.
* **Shared Interfaces:**
  - Runs automated assertions on modules authored by all four developers (Gousiya, Thirumalesh, Ujwal, Tarunya Sree).
  - Provides frame manifest data to Tarunya Sree's `CinematicHero.js` component.
* **Dependencies on Other Members:**
  - Coordinates with Thirumalesh on countdown edge-case test fixtures.
  - Coordinates with Gousiya on LL2 API schema validation and error mock fixtures.
  - Coordinates with Ujwal on AI security test cases and unique image resolution tests.
* **Testing Expectations:**
  - Ensure zero test failures across countdown logic, next-launch selector, normalizer, frame discovery, and AI security.
  - Validate clean production builds (`npm run build`) without Next.js or React hydration warnings.

---

## Shared Documentation Ownership

The following documents are collaboratively maintained by all five engineers:
* [`README.md`](../README.md) — Primary project entry point and GitHub overview.
* [`docs/architecture.md`](architecture.md) — System architecture, component hierarchy, and data flow diagrams.
* [`docs/team-responsibilities.md`](team-responsibilities.md) — This team allocation and file ownership matrix.
* [`docs/contribution-guide.md`](contribution-guide.md) — GitHub collaboration workflow, branch rules, and PR checklist.

---

## Engineering Collaboration Principles

1. **Strict File Ownership:** Developers maintain primary responsibility over their designated files. Cross-boundary changes must be coordinated via GitHub Pull Requests.
2. **Interface Stability:** Exported functions in `utils/` and `services/` represent binding contracts. Changes to signatures require mutual agreement.
3. **No Fabricated Data:** The platform strictly displays verified API information from Launch Library 2. When data is unavailable, honest empty and error states are shown.
4. **Environment Isolation:** Secrets and real API keys (`DEEPSEEK_API_KEY`) must never be committed to Git. Only `.env.example` is committed.
5. **Quality Gate:** Every Pull Request must pass `npm test` and `npm run build` prior to merging into `main`.
