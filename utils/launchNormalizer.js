/**
 * Normalizes raw Launch Library 2 flight record into standardized application schema.
 * Handles both LL2 2.3.0 and 2.2.0 payload variants gracefully.
 *
 * @param {object} raw - Raw launch record from Launch Library 2
 * @returns {object} Clean, consistent mission object
 */
export function normalizeLaunch(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  // 1. Basic identifiers
  const id = raw.id || raw.slug || `launch-${Math.random().toString(36).substring(2, 9)}`;
  const name = raw.name || "Orbital Flight Operation";

  // 2. Dates & Launch Windows
  const net = raw.net || raw.window_start || raw.window_end || null;
  const windowStart = raw.window_start || net;
  const windowEnd = raw.window_end || net;
  const probability = typeof raw.probability === "number" && raw.probability >= 0 ? raw.probability : null;
  const holdreason = raw.holdreason || null;
  const failreason = raw.failreason || null;

  // 3. Status
  const rawStatus = raw.status || {};
  const status = {
    id: rawStatus.id || 1,
    name: rawStatus.name || "Go for Launch",
    abbrev: rawStatus.abbrev || "Go",
    description: rawStatus.description || "The flight is scheduled and confirmed on the launch manifest.",
  };

  // 4. Launch Service Provider / Agency
  const lsp = raw.launch_service_provider || raw.provider || {};
  const agency = {
    id: lsp.id || null,
    name: lsp.name || "Commercial Aerospace Operator",
    type: lsp.type?.name || lsp.type || "Aerospace Provider",
    countryCode: lsp.country_code || lsp.country?.alpha_2_code || "INTL",
    logoUrl: lsp.logo_url || null,
    description: lsp.description || null,
  };

  // 5. Rocket & Launch Vehicle
  const rocketConfig = raw.rocket?.configuration || raw.rocket || {};
  const rocket = {
    id: rocketConfig.id || null,
    name: rocketConfig.name || rocketConfig.full_name || raw.rocket?.name || "Orbital Launch Vehicle",
    family: rocketConfig.family || "Space Launch System",
    variant: rocketConfig.variant || "",
    description: rocketConfig.description || null,
  };

  // 6. Spaceport Pad & Location
  const rawPad = raw.pad || {};
  const rawLocation = rawPad.location || {};
  const pad = {
    id: rawPad.id || null,
    name: rawPad.name || "Launch Complex",
    locationName: rawLocation.name || rawPad.location_name || "Spaceport",
    countryCode: rawLocation.country_code || rawLocation.country?.alpha_2_code || "INTL",
    latitude: rawPad.latitude ? parseFloat(rawPad.latitude) : null,
    longitude: rawPad.longitude ? parseFloat(rawPad.longitude) : null,
    mapUrl: rawPad.map_url || null,
  };

  // 7. Mission & Orbit Profile
  const rawMission = raw.mission || {};
  const rawOrbit = rawMission.orbit || {};
  const mission = {
    id: rawMission.id || null,
    name: rawMission.name || name,
    description: rawMission.description || "Payload deployment mission delivering telemetry and orbital capabilities.",
    type: rawMission.type || "Communications & Science",
    orbit: {
      name: rawOrbit.name || "Low Earth Orbit",
      abbrev: rawOrbit.abbrev || "LEO",
    },
  };

  // 8. Media & Webcast Links
  const image = raw.image?.image_url || (typeof raw.image === "string" ? raw.image : null);
  const padImage = raw.pad?.image?.image_url || (typeof raw.pad?.image === "string" ? raw.pad.image : null) || null;
  const configImage = raw.rocket?.configuration?.image?.image_url || null;
  const webcastLive = Boolean(raw.webcast_live);
  const vidURLs = Array.isArray(raw.vidURLs) ? raw.vidURLs.map((v) => (typeof v === "string" ? v : v.url)).filter(Boolean) : [];
  const infoURLs = Array.isArray(raw.infoURLs) ? raw.infoURLs.map((u) => (typeof u === "string" ? u : u.url)).filter(Boolean) : [];

  return {
    id,
    name,
    net,
    windowStart,
    windowEnd,
    probability,
    holdreason,
    failreason,
    status,
    agency,
    rocket,
    pad,
    mission,
    image,
    padImage,
    configImage,
    webcastLive,
    vidURLs,
    infoURLs,
    lastUpdated: raw.last_updated || new Date().toISOString(),
  };
}

/**
 * Normalizes an array of launch records.
 */
export function normalizeLaunchList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeLaunch).filter(Boolean);
}
