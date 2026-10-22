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

/**
 * Fetches upcoming launches from Launch Library 2.
 */
export async function fetchUpcomingLaunches({ limit = 20, offset = 0, search = "" } = {}) {
  const params = { limit: String(limit), offset: String(offset) };
  if (search && search.trim()) {
    params.search = search.trim();
  }

  const response = await fetchWithFailover("upcoming/", params);
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
