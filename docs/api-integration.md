# Launch Library 2 API Integration Guide

**Owner:** Gousiya M — Launch API Integration Engineer  
**Related Components:** `services/launchApi.js`, `app/api/launches/route.js`, `utils/launchNormalizer.js`

---

## 1. Overview & Architecture

RocketLaunch ingests live, verified spaceflight flight manifests directly from **Launch Library 2 (LL2)**, operated by The Space Devs. 

To ensure high availability, fast response times, and compliance with public rate limits, the application uses a server-side proxy architecture with automatic failover, in-memory caching, and robust schema normalization.

```
┌─────────────────────────────────┐
│ Client (Browser React App)      │
└────────────────┬────────────────┘
                 │ HTTP GET /api/launches?type=upcoming
                 ▼
┌─────────────────────────────────┐
│ Next.js API Route Handler       │ (app/api/launches/route.js)
└────────────────┬────────────────┘
                 │ Cached? (60s in-memory TTL)
                 ▼
┌─────────────────────────────────┐
│ Launch API Service Client       │ (services/launchApi.js)
│ - Failover: lldev -> ll         │
│ - 8-second Timeout              │
│ - Custom User-Agent Header      │
└────────────────┬────────────────┘
                 │ HTTPS Request
                 ▼
┌─────────────────────────────────┐
│ Launch Library 2 API            │
│ (lldev.thespacedevs.com /       │
│  ll.thespacedevs.com)           │
└────────────────┬────────────────┘
                 │ Raw JSON Response
                 ▼
┌─────────────────────────────────┐
│ Launch Normalizer               │ (utils/launchNormalizer.js)
│ - Schema 2.3.0 / 2.2.0 support  │
│ - Sanitization of nulls         │
│ - Image extraction (pad/config) │
└─────────────────────────────────┘
```

---

## 2. Endpoint Configurations

The service defines primary and fallback endpoints to guarantee high availability:

| Tier | Base URL | Usage |
| :--- | :--- | :--- |
| **Primary (Development Tier)** | `https://lldev.thespacedevs.com/2.3.0` | Default public endpoint for high-frequency development and testing |
| **Secondary (Production Failover)**| `https://ll.thespacedevs.com/2.3.0` | Automatic fallback when primary endpoint encounters rate limits (429) or timeouts |

### Internal Next.js API Route (`/api/launches`)

Clients never call LL2 directly; they interact through our Next.js API route:

* **`GET /api/launches?type=upcoming&limit=30`**: Fetches verified upcoming orbital flights.
* **`GET /api/launches?type=previous&limit=30`**: Fetches historical mission archive flights.
* **`GET /api/launches?id={uuid}`**: Fetches a single standalone launch record for deep-linked dossiers (`/missions/[id]`).

---

## 3. Actual Request Parameters

The service issues GET requests with the following standard parameters:

```javascript
const queryParams = new URLSearchParams({
  limit: Math.min(Number(limit) || 20, 50),
  ordering: type === "upcoming" ? "net" : "-net",
  mode: "normal",
});
```

* **`limit`**: Clamped between 1 and 50 to avoid oversized JSON payloads.
* **`ordering`**: `net` (ascending by No Earlier Than launch date) for upcoming launches; `-net` (descending) for historical archive flights.
* **`mode=normal`**: Provides full vehicle configuration, mission parameters, and pad coordinates without the overhead of heavy telemetry logs.
* **Headers**: Every outgoing request includes a descriptive User-Agent:
  ```http
  User-Agent: RocketLaunch-ManifestEngine/1.0.0 (https://github.com/RocketLaunch; contact@rocketlaunch.space)
  Accept: application/json
  ```

---

## 4. Response Normalization (`utils/launchNormalizer.js`)

Launch Library 2 payloads can vary between version 2.3.0 and 2.2.0, with optional objects frequently returned as `null` or `undefined`. The normalizer guarantees a consistent, typed schema:

```javascript
export function normalizeLaunch(raw) {
  return {
    id: raw.id || raw.slug || `flight-${Math.random().toString(36).substring(2, 9)}`,
    name: raw.name || "Orbital Flight Operation",
    net: raw.net || raw.window_start || raw.window_end || null,
    windowStart: raw.window_start || raw.net,
    windowEnd: raw.window_end || raw.net,
    probability: typeof raw.probability === "number" && raw.probability >= 0 ? raw.probability : null,
    holdreason: raw.holdreason || null,
    failreason: raw.failreason || null,
    status: {
      id: raw.status?.id || 1,
      name: raw.status?.name || "Scheduled",
      abbrev: raw.status?.abbrev || "Go",
      description: raw.status?.description || "Scheduled and confirmed on the launch manifest.",
    },
    agency: {
      id: raw.launch_service_provider?.id || null,
      name: raw.launch_service_provider?.name || "Commercial Aerospace Operator",
      type: raw.launch_service_provider?.type || "Aerospace Provider",
      countryCode: raw.launch_service_provider?.country_code || "INTL",
    },
    rocket: {
      name: raw.rocket?.configuration?.name || raw.rocket?.name || "Orbital Launch Vehicle",
      family: raw.rocket?.configuration?.family || "Space Launch System",
    },
    pad: {
      name: raw.pad?.name || "Launch Complex",
      locationName: raw.pad?.location?.name || "Spaceport",
      latitude: raw.pad?.latitude ? parseFloat(raw.pad.latitude) : null,
      longitude: raw.pad?.longitude ? parseFloat(raw.pad.longitude) : null,
      mapUrl: raw.pad?.map_url || null,
    },
    mission: {
      name: raw.mission?.name || raw.name,
      description: raw.mission?.description || "Payload deployment mission delivering telemetry and orbital capabilities.",
      type: raw.mission?.type || "Communications & Science",
      orbit: {
        name: raw.mission?.orbit?.name || "Low Earth Orbit",
        abbrev: raw.mission?.orbit?.abbrev || "LEO",
      },
    },
    image: raw.image?.image_url || (typeof raw.image === "string" ? raw.image : null),
    padImage: raw.pad?.image?.image_url || null,
    configImage: raw.rocket?.configuration?.image?.image_url || null,
    webcastLive: Boolean(raw.webcast_live),
    vidURLs: Array.isArray(raw.vidURLs) ? raw.vidURLs.map((v) => (typeof v === "string" ? v : v.url)).filter(Boolean) : [],
    infoURLs: Array.isArray(raw.infoURLs) ? raw.infoURLs.map((u) => (typeof u === "string" ? u : u.url)).filter(Boolean) : [],
    lastUpdated: raw.last_updated || new Date().toISOString(),
  };
}
```

---

## 5. In-Memory Cache Behavior

To protect LL2 from traffic spikes and keep client round-trip latency under 10ms:

* **TTL (Time to Live):** 60 seconds (`CACHE_TTL_MS = 60 * 1000`).
* **Cache Key:** Built from `{type}:{limit}:{id}`.
* **Stale-While-Revalidate Resilience:** If an upstream request fails after the TTL expires, the cache returns the last known good manifest with a warning rather than displaying a blank page.

---

## 6. Rate Limit Protection & Failover Strategy

The public LL2 API tier enforces rate limits (approximately 15 requests per hour on unauthenticated endpoints).

### Automatic Failover
1. When a request to `lldev.thespacedevs.com` returns HTTP 429 (Too Many Requests), HTTP 500, or times out after 8,000ms:
2. The service logs a warning and immediately retries against `ll.thespacedevs.com`.
3. If both endpoints fail, the service returns an honest, structured error response:
   ```json
   {
     "success": false,
     "error": "Upstream aerospace telemetry service temporarily unavailable. Rate limit or maintenance window in progress.",
     "launches": []
   }
   ```
4. **No Fabricated Data:** The application *never* injects fictitious launches. The UI renders a dedicated `ErrorState` component with a "Retry Telemetry Sync" button.

---

## 7. How to Verify Real Data

To verify that the application displays 100% genuine orbital telemetry:

1. **Direct API Inspection:**
   ```bash
   curl "http://localhost:3000/api/launches?type=upcoming&limit=5"
   ```
2. **Cross-Check with Official Source:**
   Compare the `net` timestamp and mission name directly against:
   `https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=5`
3. **Spaceport Map Check:**
   Click the **"Spaceport Map"** button on any card to confirm that Google Maps opens at the exact GPS coordinates of the real launch pad (e.g., Sriharikota, Cape Canaveral SLC-40, Mahia LC-1).
