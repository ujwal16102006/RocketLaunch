import { normalizeLaunch, normalizeLaunchList } from "../utils/launchNormalizer.js";

// In-memory cache for API responses to respect LL2 rate limits
const cacheStore = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Endpoints list for resilient failover
const BASE_ENDPOINTS = [
  "https://lldev.thespacedevs.com/2.3.0/launches/",
  "https://lldev.thespacedevs.com/2.3.0/launch/",
  "https://ll.thespacedevs.com/2.3.0/launches/",
];

/**
 * Executes a resilient fetch against Launch Library 2 endpoints with automatic failover.
 */
async function fetchWithFailover(subPath, queryParams = {}) {
  const queryString = new URLSearchParams(queryParams).toString();
  const fullSubPath = queryString ? `${subPath}?${queryString}` : subPath;

  // Check cache first
  const cacheKey = fullSubPath;
  const cached = cacheStore.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, source: "cached" };
  }

  let lastError = null;

  for (const base of BASE_ENDPOINTS) {
    const url = `${base}${fullSubPath}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "RocketLaunch-Telemetry/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const result = {
          data: json,
          source: "live",
          status: res.status,
        };
        // Cache successful response
        cacheStore.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      } else if (res.status === 429) {
        lastError = new Error(`Launch Library 2 rate limit reached (HTTP 429).`);
      } else {
        lastError = new Error(`LL2 API returned HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to contact Launch Library 2 services.");
}

const CURATED_FALLBACK_LAUNCHES = [
  {
    id: "curated-gaganyaan-1",
    name: "LVM-3 | Gaganyaan-1 Uncrewed Orbital Flight",
    net: "2026-11-30T03:30:00Z",
    status: { id: 1, name: "Go for Launch", abbrev: "Go", description: "All telemetry parameters nominal" },
    agency: { id: 1, name: "ISRO", abbrev: "ISRO", countryCode: "IND", type: "Government" },
    rocket: { id: 1, name: "LVM3 / GSLV Mk III", family: "LVM3" },
    mission: {
      id: 1,
      name: "Gaganyaan-1 Test Flight",
      description: "First uncrewed test flight of India's indigenous Gaganyaan crew module, validating automated orbital insertion, environmental control, and atmospheric re-entry splashdown in the Bay of Bengal.",
      type: "Human Exploration Test",
      orbit: { id: 1, name: "Low Earth Orbit", abbrev: "LEO" },
    },
    pad: { id: 1, name: "Second Launch Pad (SLP)", locationName: "Satish Dhawan Space Centre, Sriharikota", latitude: "13.7199", longitude: "80.2305" },
    image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "curated-starlink-15-16",
    name: "Falcon 9 Block 5 | Starlink Group 15-16",
    net: "2026-10-24T05:29:00Z",
    status: { id: 1, name: "Go for Launch", abbrev: "Go", description: "Flight operations proceeding on schedule" },
    agency: { id: 2, name: "SpaceX", abbrev: "SpaceX", countryCode: "USA", type: "Commercial" },
    rocket: { id: 2, name: "Falcon 9 Block 5", family: "Falcon" },
    mission: {
      id: 2,
      name: "Starlink V2 Mini Deployment",
      description: "Batch of next-generation Starlink V2 Mini communication satellites deployed to low Earth orbit with autonomous drone ship first-stage recovery.",
      type: "Communications",
      orbit: { id: 1, name: "Low Earth Orbit", abbrev: "LEO" },
    },
    pad: { id: 2, name: "Space Launch Complex 40", locationName: "Cape Canaveral SFS, Florida", latitude: "28.5619", longitude: "-80.5772" },
    image: "https://images.unsplash.com/photo-1517976487502-5706e3ea5e4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "curated-artemis-2",
    name: "SLS Block 1 | Artemis II Crewed Lunar Flyby",
    net: "2026-12-15T14:00:00Z",
    status: { id: 1, name: "Go for Launch", abbrev: "Go", description: "Integrated flight test sequence approved" },
    agency: { id: 3, name: "NASA", abbrev: "NASA", countryCode: "USA", type: "Government" },
    rocket: { id: 3, name: "Space Launch System (SLS)", family: "SLS" },
    mission: {
      id: 3,
      name: "Artemis II Lunar Orbital Test",
      description: "First crewed flight test of the Orion spacecraft launched by SLS, executing a free-return trajectory around the Moon to validate deep space human life support systems.",
      type: "Lunar Flyby",
      orbit: { id: 2, name: "Lunar Free-Return Trajectory", abbrev: "TLI" },
    },
    pad: { id: 3, name: "Launch Complex 39B", locationName: "Kennedy Space Center, Florida", latitude: "28.6272", longitude: "-80.6210" },
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "curated-electron-iqps",
    name: "Electron | The Sea God Surveys (iQPS Launch 9)",
    net: "2026-11-04T08:00:00Z",
    status: { id: 1, name: "Go for Launch", abbrev: "Go", description: "Flight readiness review complete" },
    agency: { id: 4, name: "Rocket Lab", abbrev: "RL", countryCode: "NZL", type: "Commercial" },
    rocket: { id: 4, name: "Electron", family: "Electron" },
    mission: {
      id: 4,
      name: "iQPS Synthetic Aperture Radar",
      description: "Dedicated orbital mission deploying high-resolution synthetic aperture radar (SAR) earth observation satellites for all-weather global imaging.",
      type: "Earth Observation",
      orbit: { id: 1, name: "Sun-Synchronous Orbit", abbrev: "SSO" },
    },
    pad: { id: 4, name: "Launch Complex 1A", locationName: "Mahia Peninsula, New Zealand", latitude: "-39.2609", longitude: "177.8659" },
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "curated-irnss-1l",
    name: "GSLV Mk II | IRNSS-1L (NVS-03 Navigation)",
    net: "2026-10-31T05:00:00Z",
    status: { id: 1, name: "Go for Launch", abbrev: "Go", description: "Cryogenic stage integration verified" },
    agency: { id: 1, name: "ISRO", abbrev: "ISRO", countryCode: "IND", type: "Government" },
    rocket: { id: 1, name: "GSLV Mk II", family: "GSLV" },
    mission: {
      id: 6,
      name: "NavIC Regional Navigation Satellite",
      description: "Next-generation navigation satellite featuring indigenous atomic rubidium clock payload expanding NavIC regional positioning accuracy across South Asia.",
      type: "Navigation",
      orbit: { id: 3, name: "Geosynchronous Transfer Orbit", abbrev: "GTO" },
    },
    pad: { id: 1, name: "First Launch Pad (FLP)", locationName: "Satish Dhawan Space Centre, Sriharikota", latitude: "13.7199", longitude: "80.2305" },
    image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80",
  },
];

/**
 * Fetches upcoming launches from Launch Library 2 with automatic fallback failover.
 */
export async function fetchUpcomingLaunches({ limit = 30, offset = 0, search = "" } = {}) {
  try {
    const params = { limit: String(limit), offset: String(offset) };
    if (search && search.trim()) {
      params.search = search.trim();
    }

    const response = await fetchWithFailover("upcoming/", params);
    const rawResults = response.data?.results || [];
    const normalized = normalizeLaunchList(rawResults);

    if (normalized.length === 0) {
      return {
        launches: CURATED_FALLBACK_LAUNCHES,
        total: CURATED_FALLBACK_LAUNCHES.length,
        next: null,
        previous: null,
        source: "curated-fallback",
        fetchedAt: new Date().toISOString(),
      };
    }

    return {
      launches: normalized,
      total: response.data?.count || normalized.length,
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      source: response.source,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[LL2 API FAILOVER ACTIVATED]:", err.message);
    return {
      launches: CURATED_FALLBACK_LAUNCHES,
      total: CURATED_FALLBACK_LAUNCHES.length,
      next: null,
      previous: null,
      source: "curated-fallback",
      error: err.message,
      fetchedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetches historical launches from Launch Library 2.
 */
export async function fetchHistoricalLaunches({ limit = 20, offset = 0, search = "" } = {}) {
  const params = { limit: String(limit), offset: String(offset) };
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const response = await fetchWithFailover("previous/", params);
  const rawResults = response.data?.results || [];
  const normalized = normalizeLaunchList(rawResults);

  return {
    launches: normalized,
    total: response.data?.count || normalized.length,
    next: response.data?.next || null,
    previous: response.data?.previous || null,
    source: response.source,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetches a single launch dossier by ID or slug.
 */
export async function fetchLaunchById(id) {
  if (!id) throw new Error("Launch ID is required.");
  const response = await fetchWithFailover(`${encodeURIComponent(id)}/`);
  const normalized = normalizeLaunch(response.data);
  return {
    launch: normalized,
    source: response.source,
  };
}
