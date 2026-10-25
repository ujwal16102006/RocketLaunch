# RocketLaunch — System Architecture & Data Flow

RocketLaunch is an editorial-grade, real-time aerospace tracking and telemetry intelligence platform. This document outlines the system architecture, component hierarchy, data flow, caching strategies, and security design.

---

## 1. High-Level Architecture Overview

```
                      +---------------------------------------+
                      |          Browser Client (UI)          |
                      +-------------------+-------------------+
                                          |
                        HTTP / React Server Components & Hooks
                                          |
                      +-------------------v-------------------+
                      |      Next.js App Router (Port 3000)   |
                      +---------+-------------------+---------+
                                |                   |
           +--------------------+                   +--------------------+
           |                                                             |
+----------v------------------+                               +----------v------------------+
|   /api/launches Route       |                               |     /api/ai Route           |
|   (LL2 Integration Proxy)   |                               |  (DeepSeek Telemetry Agent) |
+----------+------------------+                               +----------+------------------+
           |                                                             |
    In-Memory Cache                                               Server-Side Only
     (60s TTL Store)                                              DEEPSEEK_API_KEY
           |                                                             |
+----------v------------------+                               +----------v------------------+
| Launch Library 2 Endpoints  |                               |    DeepSeek AI API Server   |
| (lldev.thespacedevs.com)    |                               |    (api.deepseek.com)       |
+-----------------------------+                               +-----------------------------+
```

---

## 2. Directory Structure Breakdown

```
RocketLaunch/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   └── route.js                  # DeepSeek server-side reasoning proxy
│   │   ├── animations/
│   │   │   └── frames/
│   │   │       └── route.js              # Dynamic frame discovery & manifest endpoint
│   │   └── launches/
│   │       └── route.js                  # LL2 upcoming/historical proxy with failover
│   ├── archive/
│   │   └── page.js                       # Mission archive & historical flights dashboard
│   ├── launches/
│   │   └── page.js                       # Comprehensive upcoming launch manifest
│   ├── missions/
│   │   └── [id]/
│   │       └── page.js                   # Standalone deep-linkable mission dossier
│   ├── layout.js                         # Root HTML, viewport & metadata configuration
│   ├── page.js                           # Primary cinematic space exploration dashboard
│   └── globals.css                       # Aerospace color tokens, glassmorphism & typography
├── components/
│   ├── layout/
│   │   ├── Navbar.js                     # Global navigation, mobile drawer & telemetry pill
│   │   └── Footer.js                     # Disclosures, data citations & team credits
│   ├── hero/
│   │   ├── CinematicHero.js              # Full-screen opening with scroll telemetry
│   │   └── RocketLaunchSequence.js       # HTML Canvas scroll-controlled animation player
│   ├── countdown/
│   │   ├── LaunchCountdown.js            # Prominent T-minus flight countdown card
│   │   └── CountdownDigits.js            # Monospace tabular digits component
│   ├── missions/
│   │   ├── MissionCard.js                # Editorial flight card with unique image & maps
│   │   ├── MissionGrid.js                # Grid layout with skeletons, errors & empty states
│   │   ├── MissionFilters.js             # Feed tabs, agency, status, search, and sorting
│   │   └── MissionDetailsModal.js        # Flight parameters dossier dialog with AI brief
│   ├── ai/
│   │   └── MissionIntelligence.js        # Multi-mode DeepSeek reasoning workbench
│   └── ui/
│       ├── Badge.js                      # Status badges and technical tag pills
│       ├── LoadingSkeleton.js            # Shimmer loading placeholders
│       ├── ErrorState.js                 # Network and API error banner with retry
│       └── EmptyState.js                 # Honest zero-records state display
├── services/
│   ├── launchApi.js                      # LL2 API client with failover & 60s in-memory TTL
│   └── deepseekApi.js                    # Server-side DeepSeek reasoning service
├── hooks/
│   ├── useCountdown.js                   # High-precision countdown hook with visibility sync
│   ├── useFavorites.js                   # Synced localStorage bookmarks via useSyncExternalStore
│   └── useFrameDiscovery.js              # Dynamic frame manifest preloader and buffer manager
├── utils/
│   ├── dateUtils.js                      # Countdown math, dual timezone (UTC & IST), spaceport maps
│   ├── launchNormalizer.js               # Sanitizes raw LL2 2.3.0/2.2.0 API responses
│   ├── nextLaunchSelector.js             # Selects earliest upcoming non-cancelled flight
│   ├── frameDiscovery.js                 # Recursive scanner, natural sorter & manifest generator
│   └── rocketImageResolver.js            # Real rocket photography resolver & de-duplication engine
├── scripts/
│   └── discover-frames.js                # Standalone frame discovery CLI tool
├── tests/
│   └── unit-and-integration.test.js      # Comprehensive automated verification suite (13 tests)
├── docs/
│   ├── architecture.md                   # System architecture and data flow
│   ├── team-responsibilities.md          # Team roles and file ownership matrix
│   ├── contribution-guide.md             # Git branch and pull request workflow
│   ├── api-integration.md                # Launch Library 2 API integration guide
│   ├── testing-guide.md                  # Testing architecture and QA runbook
│   └── deployment.md                     # Production deployment and operations guide
├── .env.example                          # Environment variable template
├── .gitignore                            # Version control exclusion rules
├── .nvmrc                                # Node.js version specification (20.18.0)
├── README.md                             # Primary project documentation
└── package.json                          # Dependencies and scripts manifest
```

---

## 3. Core Subsystems

### A. Automatic Rocket Frame Discovery & Scroll Player
* **Engine:** `utils/frameDiscovery.js` recursively scans the project workspace for image sequence candidate folders.
* **Natural Numeric Sorting:** Uses `localeCompare(..., { numeric: true })` ensuring `ezgif-frame-2.png` appears before `ezgif-frame-10.png`.
* **Zero Modification Policy:** Discovered source images (e.g. in `ezgif-31c5ab6cc892acf5-png-split`) are copied safely into `public/animations/rocket-launch/` without modifying or deleting originals.
* **Manifest Creation:** Generates `manifest.json` recording total valid frame count (`300`), first frame, last frame, and source directory.
* **Scroll-Controlled Canvas:** `RocketLaunchSequence.js` binds scroll progress directly to frame indices. Progressively buffers frames in batches using `requestAnimationFrame`. Automatically handles window resize, device pixel ratio scaling, and reduced motion preferences.

### B. High-Precision Live Countdown Engine
* **Engine:** `hooks/useCountdown.js` and `utils/dateUtils.js`.
* **Drift Elimination:** Computes remaining milliseconds dynamically from UTC target timestamp rather than decrementing counters.
* **Tab Backgrounding:** Attaches `visibilitychange` listeners to recalculate the exact countdown immediately upon tab focus.
* **Integrity Guarantee:** Never displays negative numbers; cleanly transitions to *"Scheduled launch time reached • Verification in progress"* without prematurely claiming launch success.

### C. Launch Library 2 Telemetry & Resilient Caching
* **API Endpoints:** Primary `https://lldev.thespacedevs.com/2.3.0/launches/` with failover to `/launch/` and `/launches/`.
* **Rate-Limit Shield:** 60-second in-memory cache TTL prevents redundant upstream requests.
* **Normalizer:** Extracts flight parameters into a robust, type-consistent object, handling null/omitted fields safely.

### D. Grounded DeepSeek AI Intelligence
* **Security:** `DEEPSEEK_API_KEY` is strictly server-side in `process.env`.
* **Strict Anti-Hallucination Prompting:** The system prompt constrains the model to the verified telemetry fields provided.
* **Degradation:** If credentials are unconfigured, displays setup guidance without disabling or breaking the rest of the application.

### E. Rocket Image Resolution & De-duplication Engine
* **Engine:** `utils/rocketImageResolver.js`.
* **Problem Solved:** Launch Library 2 returns the exact same vehicle configuration picture for consecutive launches of the same rocket (e.g., Falcon 9 or Electron).
* **Curated Photography Registry:** Curated pools of verified real spaceflight photography for SpaceX (Falcon 9, Falcon Heavy, Starship), ISRO (LVM-3, PSLV, GSLV, SSLV), Rocket Lab (Electron), Arianespace (Ariane 6, Ariane 5), Roscosmos (Soyuz), ULA/NASA (Vulcan Centaur, Atlas V), and CNSA (Long March).
* **Guaranteed 100% Uniqueness:** `resolveUniqueLaunchImages(launches)` tracks used images and de-duplicates them so that no two cards in any view display identical photos.

### F. Master Dual Timezone & Spaceport Satellite Maps
* **Engine:** `utils/dateUtils.js`.
* **Dual Timezone:** Every mission displays both Coordinated Universal Time (UTC) and Indian Standard Time (IST, UTC+05:30) with explicit timezone identifiers.
* **Spaceport Satellite Maps:** Directly resolves pad GPS coordinates (`latitude`, `longitude`) to open real-time satellite imagery on Google Maps.
