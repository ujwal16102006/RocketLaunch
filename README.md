# 🚀 RocketLaunch — Explore Beyond the Countdown

Explore upcoming space missions, track launch countdowns, discover global launch providers, and explore mission intelligence through an interactive spaceflight dashboard.

RocketLaunch is a space exploration web application designed to bring publicly available launch information, interactive mission discovery, cinematic rocket animation, and AI-assisted mission insights into one interface.

> [!NOTE]
> **Illustrative Animation Notice:** The rocket launch animation is an illustrative visualization. It is not live footage of a specific rocket launch.

---

## 🌌 Overview

Spaceflight schedules, launch providers, and mission information are published across different platforms. RocketLaunch aims to make this information easier to explore through a unified, interactive experience.

The application combines launch schedule data, countdown functionality, mission discovery, and optional AI-powered assistance in a responsive web interface.

---

## ✨ Key Features

* 🌍 **Global Launch Discovery** — Explore upcoming space missions using launch schedule data from Launch Library 2.
* ⏱️ **Live Countdown** — Track the time remaining until a scheduled launch with millisecond accuracy and zero tab-wake drift.
* 🎬 **Cinematic Rocket Animation** — Experience an interactive, scroll-driven rocket launch visualization powered by HTML5 Canvas.
* 🛰️ **Mission Exploration** — Browse launch information and inspect available mission details.
* 🔎 **Search and Filters** — Find missions using supported search fields (ISRO, SpaceX, NASA, Rocket Lab, ESA, JAXA) and filtering options.
* ⭐ **Mission Favorites** — Save favorite missions for convenient access with cross-tab local storage synchronization.
* 🕒 **UTC and IST Time Display** — Present launch schedules in both UTC and Indian Standard Time (IST, UTC+05:30).
* 📍 **Spaceport Navigation** — Access launch site locations through Google Maps satellite links where coordinates are available.
* 🖼️ **100% Unique Rocket Photography** — Intelligent image de-duplication engine ensuring distinct real launch photos for every card.
* 🤖 **AI Mission Intelligence** — Use DeepSeek-powered mission summaries, question answering, and rocket comparisons when the API is configured.
* 📱 **Responsive Interface** — Designed to support desktop and mobile screens seamlessly.

*Feature availability depends on the implementation and the data supplied by external services.*

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 15** | Application framework and App Router |
| **React 19** | Component-based user interface |
| **JavaScript** | Application logic and core algorithms |
| **Tailwind CSS v4 & CSS** | Styling, glassmorphism, and responsive layouts |
| **HTML Canvas** | Rocket animation rendering |
| **Launch Library 2 API** | Spaceflight launch schedule data |
| **DeepSeek API** | Optional AI-assisted mission intelligence |
| **Node.js** | JavaScript runtime and scripts |
| **npm** | Dependency management and project scripts |
| **Git and GitHub** | Version control and team collaboration |

---

## 🏗️ Project Structure

The project follows a modular structure to separate the application interface, API integration, business logic, reusable components, and documentation:

```
RocketLaunch/
├── app/
│   ├── api/
│   │   ├── launches/
│   │   │   └── route.js                  # Launch Library 2 proxy with 60s cache
│   │   ├── ai/
│   │   │   └── route.js                  # DeepSeek server-side reasoning proxy
│   │   └── animations/frames/
│   │       └── route.js                  # Dynamic frame manifest endpoint
│   ├── archive/
│   │   └── page.js                       # Mission archive & historical flights
│   ├── launches/
│   │   └── page.js                       # Comprehensive upcoming launches manifest
│   ├── missions/[id]/
│   │   └── page.js                       # Standalone deep-linkable mission dossier
│   ├── layout.js                         # Root layout and metadata
│   ├── page.js                           # Telemetry dashboard & cinematic hero
│   └── globals.css                       # Aerospace color tokens & typography
├── components/
│   ├── layout/
│   │   ├── Navbar.js                     # Navigation with live countdown pill
│   │   └── Footer.js                     # Telemetry citations & team credits
│   ├── hero/
│   │   ├── CinematicHero.js              # Opening typography & telemetry badge
│   │   └── RocketLaunchSequence.js       # HTML Canvas scroll animation player
│   ├── countdown/
│   │   ├── LaunchCountdown.js            # Featured T-minus countdown banner
│   │   └── CountdownDigits.js            # Monospace tabular digits display
│   ├── missions/
│   │   ├── MissionCard.js                # Flight card with unique photo & maps
│   │   ├── MissionGrid.js                # Skeletons, empty states, and errors
│   │   ├── MissionFilters.js             # Agency pills, status, and search
│   │   └── MissionDetailsModal.js        # Detailed mission dossier dialog
│   ├── ai/
│   │   └── MissionIntelligence.js        # Interactive AI brief & Q&A workbench
│   └── ui/
│       ├── Badge.js                      # Status badges & technical pills
│       ├── LoadingSkeleton.js            # Shimmer loading placeholders
│       ├── ErrorState.js                 # Error banner with retry button
│       └── EmptyState.js                 # Zero-records state display
├── services/
│   ├── launchApi.js                      # LL2 client with automatic failover
│   └── deepseekApi.js                    # DeepSeek API client with grounding
├── hooks/
│   ├── useCountdown.js                   # High-precision countdown hook
│   ├── useFavorites.js                   # Cross-tab synchronized bookmarks
│   └── useFrameDiscovery.js              # Frame manifest preloader & buffer
├── utils/
│   ├── dateUtils.js                      # Countdown math, UTC/IST, spaceport maps
│   ├── launchNormalizer.js               # LL2 data sanitizer & pad image extractor
│   ├── nextLaunchSelector.js             # Earliest upcoming flight selector
│   ├── frameDiscovery.js                 # Recursive scanner, natural sorter & manifest
│   └── rocketImageResolver.js            # Real rocket photo resolver & de-duplicator
├── scripts/
│   └── discover-frames.js                # Standalone frame discovery CLI tool
├── public/
│   └── animations/rocket-launch/
│       ├── manifest.json                 # Pre-indexed 300 sequential frame metadata
│       └── ezgif-frame-001.png ...       # 300 sequential high-res ascent frames
├── tests/
│   └── unit-and-integration.test.js      # Automated verification suite (13 tests)
├── docs/
│   ├── architecture.md                   # System architecture and data flow
│   ├── team-responsibilities.md          # Team roles and file ownership
│   ├── contribution-guide.md             # Branching and contribution workflow
│   ├── api-integration.md                # Launch Library 2 data integration & caching
│   ├── testing-guide.md                  # Testing strategy and verification
│   └── deployment.md                     # Production build and deployment
├── .env.example                          # Environment variable template
├── .gitignore                            # Version control exclusion rules
├── .nvmrc                                # Node.js LTS version specification (20.18.0)
├── package.json                          # Dependencies and scripts manifest
└── README.md                             # This documentation file
```

---

## ⚙️ Getting Started

### Prerequisites

Install the following tools before running the application:
* **Node.js** — use a version supported by the project (tested on Node.js v25.7.0; `.nvmrc` configured for `20.18.0`).
* **npm** — normally included with Node.js.
* **Git** — for version control.

Verify your installation:
```bash
node --version
npm --version
git --version
```

### 1. Clone the Repository
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd RocketLaunch
```
*(Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual URL of your GitHub repository).*

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a local environment file from the example:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**
```bash
cp .env.example .env.local
```

Open `.env.local` and configure the variables:
```env
DEEPSEEK_API_KEY=your_actual_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat
```
*(Replace the placeholder with your own API key).*

> [!SECURITY]
> **Security:** Never commit `.env.local` or any file containing real credentials to GitHub. Keep secrets on the server side and use `.env.example` only for documenting the required variable names.
>
> The application supports full non-AI launch tracking and countdown functionality without a DeepSeek API key. AI features require valid configuration and a reachable API.

### 4. Discover Rocket Animation Frames
Run the automated frame discovery script to scan and index the animation sequence:
```bash
npm run discover-frames
```

### 5. Run the Development Server
```bash
npm run dev
```

Open the application in your browser:  
[http://localhost:3000](http://localhost:3000/)

### 6. Run Tests
Execute the automated test suite:
```bash
npm test
```

### 7. Create a Production Build
```bash
npm run build
npm run start
```

---

## 🔌 External Services

### Launch Library 2
RocketLaunch uses the Launch Library 2 API as its source for launch schedule information.
* **Development endpoint:** `https://lldev.thespacedevs.com/2.3.0/`
* **Production endpoint:** `https://ll.thespacedevs.com/2.3.0/`

Launch schedules and mission details depend on the availability, completeness, and freshness of upstream data.
External API rate limits and service interruptions may affect the availability of launch information. The application communicates loading, empty, and error states clearly.

### DeepSeek AI
DeepSeek provides optional AI-assisted mission summaries, technical Q&A, and vehicle comparisons.
* **Model configuration:** `DEEPSEEK_MODEL=deepseek-chat`
* The API key must be configured through a server-side environment variable.
* AI-generated information should be treated as assistance rather than an authoritative source of launch status. Responses are grounded in available mission data, and users should verify critical information with official launch providers.

---

## 👥 Engineering Team

RocketLaunch is developed collaboratively by a five-member engineering team:

| Team Member | Role | Primary Responsibilities |
| :--- | :--- | :--- |
| **V Tarunya Sree** | UI & Layout Engineer | Application layout, navigation, responsive styling, shared UI components |
| **Gousiya M** | Launch API Integration Engineer | Launch data integration, response normalization, API error handling |
| **Thirumalesh** | Countdown & Core Logic Engineer | Countdown calculations, next-launch selection, time-zone handling |
| **Ujwal** | Mission Discovery & AI Intelligence Lead | Mission cards, search, filters, favorites, AI integration, feature coordination |
| **Anand** | Testing & Quality Assurance Engineer | Automated testing, frame discovery verification, regression checks, documentation |

Detailed responsibilities and file ownership are documented in [`docs/team-responsibilities.md`](docs/team-responsibilities.md).

---

## 🧪 Testing and Quality Assurance

Testing covers the application's core behavior and important edge cases:
* Countdown calculations for future, expired, and invalid timestamps.
* Correct selection of the next eligible launch (filtering past/cancelled flights).
* Normalization of launch API responses (supporting LL2 2.3.0 and 2.2.0 schemas).
* Handling of missing or incomplete mission information.
* Rocket animation frame discovery and natural numeric ordering (`frame-2` before `frame-10`).
* De-duplication of rocket photos ensuring 100% unique images across cards.
* AI endpoint validation and missing-key behavior.
* Loading, empty, and API error states.
* Production build compatibility.

Run the project's configured test suite:
```bash
npm test
```
*Current test status: 13 passed, 0 failed.*

Create and verify a production build:
```bash
npm run build
```

---

## 🔐 Security

RocketLaunch follows these security principles:
* Keep API credentials out of source control.
* Store local secrets in `.env.local`.
* Include `.env.example` without real credentials.
* Keep private API keys out of client-side bundles.
* Validate user input in server-side API routes.
* Avoid exposing sensitive error details to users.
* Review staged files before committing changes.
* Before pushing to GitHub, verify that secret files are excluded by `.gitignore`.

---

## 🤝 Contributing

Contributions should follow the team's agreed development workflow:
1. Clone the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Work within the assigned responsibility area.
4. Test the changes locally (`npm test` and `npm run build`).
5. Review the changes before committing.
6. Open a pull request targeting `main`.
7. Address review feedback before merging.

Use descriptive commit messages and avoid committing generated files, local credentials, or unrelated changes. Refer to [`docs/contribution-guide.md`](docs/contribution-guide.md) for the team's detailed workflow.

---

## ⚠️ Limitations

* Launch schedules may change as launch providers update their plans.
* External API availability and rate limits may affect mission data.
* Some mission fields may be missing or incomplete from upstream telemetry.
* AI-generated summaries may contain inaccuracies and should be verified against reliable sources.
* The rocket animation is illustrative and does not represent live telemetry or live footage of a particular launch.
* AI functionality depends on valid API configuration and service availability.

---

## 📚 Documentation

The following documents provide additional technical information:

| Document | Description |
| :--- | :--- |
| [`docs/architecture.md`](docs/architecture.md) | Application architecture and data flow |
| [`docs/team-responsibilities.md`](docs/team-responsibilities.md) | Team roles and file ownership |
| [`docs/contribution-guide.md`](docs/contribution-guide.md) | Branching and contribution workflow |
| [`docs/api-integration.md`](docs/api-integration.md) | Launch data integration and caching |
| [`docs/testing-guide.md`](docs/testing-guide.md) | Testing strategy and verification |
| [`docs/deployment.md`](docs/deployment.md) | Production build and deployment |

---

## 📄 License

The project's license has not yet been finalized. Until a license is selected and added to the repository, usage and redistribution permissions should not be assumed.

---

**RocketLaunch — Explore Beyond the Countdown**  
*Bringing spaceflight discovery and mission intelligence into one experience.*
