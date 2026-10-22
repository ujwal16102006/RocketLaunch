# ROCKETLAUNCH — Explore Beyond the Countdown

A cinematic, production-grade space exploration platform and aerospace telemetry dashboard. RocketLaunch combines scroll-controlled rocket animation, verified real-world flight manifests from global launch operators (ISRO, NASA, SpaceX, ESA, Rocket Lab, JAXA), high-precision live countdowns, dynamic mission discovery, and grounded DeepSeek AI mission intelligence.

---

## 1. Project Overview & Problem Statement

Orbital spaceflight schedules are highly dynamic. Launch windows shift frequently due to upper-stage propellant chilling, range weather constraints, avionics checkouts, and orbital traffic.

**RocketLaunch** solves the fragmentation of public spaceflight data by delivering:
1. **Centralized Orbital Manifest:** Real-time normalized telemetry from global launch operators via Launch Library 2.
2. **Scroll-Driven Cinematic Storytelling:** Smooth HTML Canvas rocket-launch sequencing tied to scroll position, with progressive frame buffering and procedural visual fallbacks.
3. **High-Precision Live Countdown Engine:** Millisecond-accurate T-minus countdowns calculated dynamically from UTC timestamps with tab-wake drift elimination.
4. **Editorial Mission Discovery:** Full-text search, dynamic agency filters, orbit classification, and cross-tab synchronized favorites.
5. **Grounded Aerospace Intelligence:** DeepSeek AI integration delivering executive flight briefs and Q&A strictly grounded in verified manifest facts without hallucinations.

> [!NOTE]
> **Illustrative Animation Notice:** The scroll-driven rocket launch sequence provides an illustrative visualization of orbital flight staging and is not a real-time live video broadcast of any individual mission.

---

## 2. Technology Stack

- **Framework:** Next.js 15 (App Router, JavaScript)
- **Library:** React 19
- **Styling:** Vanilla CSS & Tailwind CSS v4 design tokens (Midnight Obsidian `#070910`, Electric Cyan `#65F6FF`, Solar Amber `#FFB45C`)
- **Animation:** HTML Canvas high-performance scroll-driven rendering with progressive buffering
- **Telemetry Data:** Launch Library 2 API (`lldev.thespacedevs.com/2.3.0/`) with in-memory 60s TTL cache & automatic endpoint failover
- **AI Intelligence:** DeepSeek API (`deepseek-chat`) via secure server-side route handler
- **Testing:** Custom Node.js automated unit and integration verification suite

---

## 3. Team Responsibilities & Engineering Matrix

The project is structured into one unified root application maintained by a five-member engineering team:

| Team Member | Engineering Domain | Primary Owned Files |
| :--- | :--- | :--- |
| **Gousiya M** | UI and Responsive Design | `app/layout.js`, `app/globals.css`, `components/layout/Navbar.js`, `components/layout/Footer.js`, `components/hero/CinematicHero.js`, `components/ui/*` |
| **Thirumalesh** | Launch API Integration | `services/launchApi.js`, `app/api/launches/route.js`, `utils/launchNormalizer.js` |
| **Ujwal** | Countdown and Core Logic | `utils/dateUtils.js`, `utils/nextLaunchSelector.js`, `hooks/useCountdown.js`, `components/countdown/*` |
| **V Tarunya Sree** | Mission Discovery | `components/missions/MissionFilters.js`, `components/missions/MissionCard.js`, `components/missions/MissionGrid.js`, `components/missions/MissionDetailsModal.js`, `app/missions/[id]/page.js`, `hooks/useFavorites.js` |
| **Anand** | Testing, Frame Discovery & AI Lead | `utils/frameDiscovery.js`, `scripts/discover-frames.js`, `components/hero/RocketLaunchSequence.js`, `services/deepseekApi.js`, `app/api/ai/route.js`, `components/ai/*`, `tests/*`, `docs/*`, `README.md` |

Detailed responsibility matrices and interface contracts are documented in [`docs/team-responsibilities.md`](docs/team-responsibilities.md).

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
- Node.js 18.18+ (tested on Node.js v25.7.0)
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

Run the verification test suite covering countdown math, next-launch selection, normalizer, frame discovery, and AI request security:

```bash
npm test
```

### Verification Results:
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

========================================
TEST RESULTS: 10 passed, 0 failed
========================================
```

---

## 8. Production Build

To create and run an optimized production build:

```bash
npm run build
npm run start
```

---

## 9. Documentation Directory

- [`docs/architecture.md`](docs/architecture.md) — Architecture, component hierarchy & data flow diagrams.
- [`docs/team-responsibilities.md`](docs/team-responsibilities.md) — Team allocation and file ownership matrix.
- [`docs/contribution-guide.md`](docs/contribution-guide.md) — Git branching strategy, code style, and PR checklist.
