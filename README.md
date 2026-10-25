# ROCKETLAUNCH — Explore Beyond the Countdown

A cinematic, production-grade space exploration platform and aerospace telemetry dashboard. RocketLaunch combines scroll-controlled rocket animation, verified real-world flight manifests from global launch operators (ISRO, NASA, SpaceX, ESA, Rocket Lab, JAXA), high-precision live countdowns, dynamic mission discovery, and grounded DeepSeek AI mission intelligence.

---

## 1. Project Overview & Problem Statement

Orbital spaceflight schedules are highly dynamic. Launch windows shift frequently due to upper-stage propellant chilling, range weather constraints, avionics checkouts, and orbital traffic.

**RocketLaunch** solves the fragmentation of public spaceflight data by delivering:
1. **Centralized Orbital Manifest:** Real-time normalized telemetry from global launch operators via Launch Library 2.
2. **Scroll-Driven Cinematic Storytelling:** Smooth HTML Canvas rocket-launch sequencing tied to scroll position, with progressive frame buffering and procedural visual fallbacks.
3. **High-Precision Live Countdown Engine:** Millisecond-accurate T-minus countdowns calculated dynamically from UTC timestamps with tab-wake drift elimination.
4. **Master Dual Timezone Display:** UTC and Indian Standard Time (IST, UTC+05:30) calculated across all mission cards, countdown banners, modals, and dossiers.
5. **Interactive Spaceport Satellite Maps:** Direct one-click Google Maps satellite navigation to exact spaceport coordinates (e.g. Sriharikota, Cape Canaveral, Mahia Peninsula, Kourou, Baikonur).
6. **Unique Real Rocket Photography:** Intelligent de-duplication engine ensuring that every card in any manifest displays a distinct, high-resolution authentic photograph with zero duplicate images.
7. **Editorial Mission Discovery:** Full-text search, dynamic agency filters, orbit classification, and cross-tab synchronized favorites.
8. **Grounded Aerospace Intelligence:** DeepSeek AI integration delivering executive flight briefs and Q&A strictly grounded in verified manifest facts without hallucinations.

> [!NOTE]
> **Illustrative Animation Notice:** The scroll-driven rocket launch sequence provides an illustrative visualization of orbital flight staging and is not a real-time live video broadcast of any individual mission.

---

## 2. Technology Stack

- **Framework:** Next.js 15 (App Router, JavaScript)
- **Library:** React 19
- **Styling:** Vanilla CSS & Tailwind CSS v4 design tokens (Midnight Obsidian `#070910`, Electric Cyan `#65F6FF`, Solar Amber `#FFB45C`)
- **Animation:** HTML Canvas high-performance scroll-driven rendering with progressive buffering
- **Telemetry Data:** Launch Library 2 API (`lldev.thespacedevs.com/2.3.0/` and `ll.thespacedevs.com/2.3.0/`) with in-memory 60s TTL cache & automatic endpoint failover
- **AI Intelligence:** DeepSeek API (`deepseek-chat`) via secure server-side route handler
- **Testing:** Custom Node.js automated unit and integration verification suite

---

## 3. Team Responsibilities & Engineering Matrix

The project is structured into one unified root application maintained by a five-member engineering team:

| Team Member | Engineering Domain | Primary Responsibilities | Primary Owned Files |
| :--- | :--- | :--- | :--- |
| **V Tarunya Sree** | UI & Layout Engineer | Global application layout, navigation, cinematic hero presentation, navbar, footer, responsive styling, shared UI primitives. | `app/layout.js`, `app/globals.css`, `components/layout/Navbar.js`, `components/layout/Footer.js`, `components/hero/CinematicHero.js`, `components/ui/*` |
| **Gousiya M** | Launch API Integration Engineer | Launch Library 2 API integration, fetching/validating launch records, response normalization, API error/empty states, caching and retries. | `services/launchApi.js`, `app/api/launches/route.js`, `utils/launchNormalizer.js`, `docs/api-integration.md` |
| **Thirumalesh** | Countdown & Core Logic Engineer | Earliest next launch selection, countdown calculations, UTC/IST timezone handling, timer updates, expired launch handling, countdown unit tests. | `utils/dateUtils.js`, `utils/nextLaunchSelector.js`, `hooks/useCountdown.js`, `components/countdown/*` |
| **Ujwal** | Mission Discovery & AI Intelligence Lead | Mission cards, search, multi-faceted filtering, unique rocket imagery, dossiers, favorites, DeepSeek AI briefs/Q&A, integration coordination. | `components/missions/MissionFilters.js`, `components/missions/MissionCard.js`, `components/missions/MissionGrid.js`, `components/missions/MissionDetailsModal.js`, `app/missions/[id]/page.js`, `hooks/useFavorites.js`, `utils/rocketImageResolver.js`, `services/deepseekApi.js`, `app/api/ai/route.js`, `components/ai/*` |
| **Anand** | Testing & Quality Assurance Engineer | Unit and integration testing, edge cases, regression checks, frame discovery verification, test documentation, build verification, deployment guide. | `tests/*`, `utils/frameDiscovery.js`, `scripts/discover-frames.js`, `components/hero/RocketLaunchSequence.js`, `docs/testing-guide.md`, `docs/deployment.md` |

Detailed responsibility matrices, shared interfaces, and dependency agreements are documented in [`docs/team-responsibilities.md`](docs/team-responsibilities.md).

---

## 4. Automatic Rocket Frame Discovery

The application automatically discovers sequential launch video frames placed anywhere inside the project workspace:

- **Recursive Scanning:** Scans for `.webp`, `.png`, `.jpg`, `.jpeg`, and `.avif` sequences.
- **Natural Numeric Sorting:** Handles natural sorting (`ezgif-frame-2.png` appears before `ezgif-frame-10.png`).
- **Discovered Source:** Detected candidate folder `ezgif-31c5ab6cc892acf5-png-split` containing **300 valid sequential PNG frames**.
- **Zero Asset Modification:** Copies frames safely into `public/animations/rocket-launch/` without modifying or deleting original source files.
- **Manifest Generation:** Creates `public/animations/rocket-launch/manifest.json` recording total valid frame count (`300`), first frame, last frame, and candidate scores.
- **CLI Command:** Run anytime via:
  ```bash
  npm run discover-frames
  ```

---

## 5. Quick Start & Installation

### Prerequisites
- Node.js 18.18+ or 20+ LTS (verified on Node.js v25.7.0; `.nvmrc` configured for `20.18.0`)
- npm 9+ (tested on npm 11.10.1)

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Run automatic rocket frame discovery
npm run discover-frames

# 3. Run automated tests
npm test

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Environment Variables Configuration

Copy `.env.example` to `.env.local` to configure optional server-side AI features:

```bash
# In .env.local
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-chat
```

*Note: If `DEEPSEEK_API_KEY` is not set, the entire website remains 100% operational, and the AI panel gracefully displays setup instructions.*

---

## 7. Automated Testing & Verification

Run the verification test suite covering countdown math, next-launch selection, normalizer, frame discovery, image de-duplication, and AI request security:

```bash
npm test
```

### Verified Test Results (All 13 Tests Passing):
```
=== STARTING ROCKETLAUNCH VERIFICATION SUITE ===
✓ PASS: Countdown: Future timestamp calculates positive days, hours, mins, secs
✓ PASS: Countdown: Expired timestamp handles gracefully without negative numbers
✓ PASS: Countdown: Invalid timestamp handled without throwing
✓ PASS: Countdown: Zero padding formats correctly
✓ PASS: NextLaunch: Correctly selects earliest future launch and ignores past & cancelled
✓ PASS: Normalizer: Raw LL2 records properly mapped into normalized flight profile
✓ PASS: Normalizer: Handles null, empty, or missing fields without crashing
✓ PASS: FrameDiscovery: Natural sort orders frame-2 before frame-10
✓ PASS: FrameDiscovery: Discovers sequential frames and produces manifest
✓ PASS: DeepSeek AI: Gracefully reports setupRequired when API key is unconfigured
✓ PASS: RocketImageResolver: De-duplicates identical images across consecutive launches
✓ PASS: RocketImageResolver: Guarantees 100% unique images across a large list
✓ PASS: RocketImageResolver: Resolves single launch fallback photo for modals and dossiers

========================================
TEST RESULTS: 13 passed, 0 failed
========================================
```

---

## 8. API Dependencies & Rate Limits

- **Launch Library 2 (The Space Devs):**
  - Public unauthenticated tier allows approximately 15 requests per hour.
  - To prevent hitting limits, RocketLaunch enforces a **60-second in-memory server-side cache**.
  - If the primary endpoint `lldev.thespacedevs.com` returns a 429 status code or times out, the service automatically fails over to `ll.thespacedevs.com`.
  - Detailed API documentation: [`docs/api-integration.md`](docs/api-integration.md).

- **DeepSeek API:**
  - Used for executive flight briefs and Q&A on `/ai`.
  - Server-side only; `DEEPSEEK_API_KEY` is never leaked to client bundles.

---

## 9. GitHub Contribution Workflow

The engineering team adheres to a strict feature-branch and pull request workflow:
1. Clone the repository and checkout a descriptive feature branch (`feat/ui-...`, `feat/api-...`, `feat/countdown-...`, `feat/discovery-...`, `feat/test-...`).
2. Make changes strictly within assigned file boundaries.
3. Run `npm test` and `npm run build` locally.
4. Submit a Pull Request targeting `main`.
5. Obtain code review approval and ensure all checks pass before merging.

Detailed guide: [`docs/contribution-guide.md`](docs/contribution-guide.md).

---

## 10. Known Limitations

1. **Spaceport Weather Data:** Ground weather conditions at launch complexes are currently inferred from Launch Library 2 status descriptions rather than a dedicated meteorology API.
2. **Launch Time Changes:** When an operator enters an indefinite hold, LL2 may keep the existing T-0 timestamp until an official range reset is published.
3. **Illustrative Animation Sequence:** The 300-frame scroll animation represents a multi-stage orbital ascent and is illustrative rather than live closed-circuit broadcast video of the current mission.

---

## 11. Security & License Information

- **Security:** API keys and credentials are never checked into version control. Server-side inputs are validated and length-limited.
- **License:** License decision remains pending by project leadership. All rights reserved.

---

## 12. Documentation Directory

- [`docs/architecture.md`](docs/architecture.md) — System architecture, component hierarchy & data flow diagrams.
- [`docs/team-responsibilities.md`](docs/team-responsibilities.md) — Team allocation and file ownership matrix.
- [`docs/contribution-guide.md`](docs/contribution-guide.md) — Git branching strategy, code style, and PR checklist.
- [`docs/api-integration.md`](docs/api-integration.md) — Launch Library 2 API endpoint specification and caching.
- [`docs/testing-guide.md`](docs/testing-guide.md) — Test architecture, test cases, and quality runbook.
- [`docs/deployment.md`](docs/deployment.md) — Production build guidelines and deployment checklist.
