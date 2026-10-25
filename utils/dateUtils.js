/**
 * Pads numbers with leading zeros (e.g., 5 -> "05")
 */
export function padZero(num, size = 2) {
  const s = String(Math.max(0, Math.floor(num || 0)));
  return s.padStart(size, "0");
}

/**
 * Calculates countdown parameters from a target ISO/UTC timestamp.
 * Prevents negative countdown numbers and handles invalid inputs gracefully.
 *
 * @param {string|number|Date} targetTime - Scheduled launch timestamp
 * @param {number} [now=Date.now()] - Current epoch millisecond
 * @returns {object} Calculated countdown state
 */
export function calculateCountdown(targetTime, now = Date.now()) {
  if (!targetTime) {
    return {
      isValid: false,
      isPast: false,
      isImminent: false,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "-- : -- : -- : --",
      statusMessage: "Launch time unconfirmed",
    };
  }

  const targetDate = new Date(targetTime);
  const targetEpoch = targetDate.getTime();

  if (isNaN(targetEpoch)) {
    return {
      isValid: false,
      isPast: false,
      isImminent: false,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "-- : -- : -- : --",
      statusMessage: "Invalid scheduled timestamp",
    };
  }

  const diffMs = targetEpoch - now;

  if (diffMs <= 0) {
    return {
      isValid: true,
      isPast: true,
      isImminent: false,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "00 : 00 : 00 : 00",
      statusMessage: "Scheduled launch time reached • Verification in progress",
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Imminent if within 1 hour (3600s)
  const isImminent = totalSeconds <= 3600;

  return {
    isValid: true,
    isPast: false,
    isImminent,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    formatted: `T- ${padZero(days)}d : ${padZero(hours)}h : ${padZero(minutes)}m : ${padZero(seconds)}s`,
    statusMessage: isImminent ? "Launch window opening shortly" : "Countdown active",
  };
}

/**
 * Formats ISO timestamp to human-friendly UTC string.
 */
export function formatUtcDateTime(isoString) {
  if (!isoString) return "TBD";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "TBD";
    return (
      d.toLocaleString("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " UTC"
    );
  } catch {
    return "TBD";
  }
}

/**
 * Formats ISO timestamp to human-friendly Local Time string.
 */
export function formatLocalDateTime(isoString) {
  if (!isoString) return "TBD";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "TBD";
  }
}

/**
 * Calculates elapsed time from a past launch timestamp with live precision.
 */
export function calculateElapsedTime(isoString, now = Date.now()) {
  if (!isoString) return null;
  const targetEpoch = new Date(isoString).getTime();
  if (isNaN(targetEpoch)) return null;

  const diffMs = now - targetEpoch;
  if (diffMs < 0) return null;

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let friendly = "";
  if (days > 365) {
    const years = (days / 365.25).toFixed(1);
    friendly = `${years}y ago`;
  } else if (days > 0) {
    friendly = `${days}d ${hours}h ago`;
  } else if (hours > 0) {
    friendly = `${hours}h ${minutes}m ago`;
  } else {
    friendly = `${minutes}m ${seconds}s ago`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    formatted: `T+ ${padZero(days)}d : ${padZero(hours)}h : ${padZero(minutes)}m : ${padZero(seconds)}s`,
    friendly,
  };
}

/**
 * Formats ISO timestamp to human-friendly Indian Standard Time (IST - UTC+5:30) string.
 */
export function formatIstDateTime(isoString) {
  if (!isoString) return "TBD";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "TBD";
    return (
      d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " IST"
    );
  } catch {
    return "TBD";
  }
}

/**
 * Builds 1-Click Google Calendar event link for a launch.
 */
export function getGoogleCalendarUrl(launch) {
  if (!launch || !launch.net) return "#";
  try {
    const startDate = new Date(launch.net);
    if (isNaN(startDate.getTime())) return "#";
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const toIsoClean = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(`🚀 Rocket Launch: ${launch.name}`);
    const details = encodeURIComponent(
      `Vehicle: ${launch.rocket?.name || "Rocket"}\nAgency: ${launch.agency?.name || "Space Operator"}\nPad: ${launch.pad?.name || "Spaceport"}\nMission: ${launch.mission?.description || "Orbital Flight"}`
    );
    const location = encodeURIComponent(`${launch.pad?.name || ""}, ${launch.pad?.locationName || ""}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${toIsoClean(startDate)}/${toIsoClean(endDate)}&details=${details}&location=${location}`;
  } catch {
    return "#";
  }
}

/**
 * Dictionary explaining aerospace orbit designations and destinations.
 */
export const ORBIT_DESCRIPTIONS = {
  LEO: {
    badge: "LEO",
    name: "Low Earth Orbit",
    altitude: "160 – 2,000 km",
    desc: "Closest orbit to Earth. Used by the ISS, Starlink, Earth observation satellites, and human spaceflight missions.",
  },
  SSO: {
    badge: "SSO",
    name: "Sun-Synchronous Orbit",
    altitude: "600 – 800 km",
    desc: "Passes over any given Earth point at the exact same local solar time. Preferred for weather, climate, and reconnaissance imaging satellites.",
  },
  GTO: {
    badge: "GTO",
    name: "Geostationary Transfer Orbit",
    altitude: "250 – 35,786 km",
    desc: "Highly elliptical transitional trajectory used by rockets to deliver heavy communications satellites to high Earth orbit.",
  },
  GEO: {
    badge: "GEO",
    name: "Geostationary Earth Orbit",
    altitude: "35,786 km",
    desc: "Orbital speed perfectly matches Earth's 24h rotation, keeping satellites permanently locked over the same spot on Earth.",
  },
  MEO: {
    badge: "MEO",
    name: "Medium Earth Orbit",
    altitude: "2,000 – 35,786 km",
    desc: "Standard realm for global satellite navigation constellations such as GPS (US), GLONASS (Russia), and Galileo (EU).",
  },
  PO: {
    badge: "Polar",
    name: "Polar Orbit",
    altitude: "200 – 1,000 km",
    desc: "Travels north-to-south over Earth's poles, providing complete planetary surface coverage over multiple orbits.",
  },
  VLEO: {
    badge: "VLEO",
    name: "Very Low Earth Orbit",
    altitude: "150 – 350 km",
    desc: "Ultra-low atmosphere edge for highest-resolution synthetic aperture radar and low-latency military constellations.",
  },
  TLI: {
    badge: "Lunar",
    name: "Trans-Lunar Injection",
    altitude: "Earth to Moon",
    desc: "Propulsive trajectory burn sending spacecraft out of Earth orbit toward lunar orbital insertion.",
  },
  MARS: {
    badge: "Mars",
    name: "Trans-Mars Injection",
    altitude: "Interplanetary (~225M km)",
    desc: "High-energy interplanetary cruise trajectory targeting orbital capture or landing on Mars.",
  },
  HEO: {
    badge: "HEO",
    name: "Highly Elliptical Orbit",
    altitude: "1,000 – 40,000 km",
    desc: "Molniya or Tundra orbits providing extended satellite dwell times over extreme high northern/southern latitudes.",
  },
};

/**
 * Returns user-friendly orbit details, converting raw 'N/A' into informative telemetry.
 */
export function getOrbitInfo(orbitRaw) {
  const abbrev = (orbitRaw?.abbrev || orbitRaw || "").toString().trim();
  const name = orbitRaw?.name || "";

  if (!abbrev || abbrev === "N/A" || abbrev === "None" || abbrev === "null") {
    return {
      badge: "Orbit: TBD",
      name: "Target Orbit Classified / Pending",
      altitude: "Classified by Operator",
      desc: "Specific orbital trajectory will be confirmed by mission control during final pre-launch countdown briefings.",
      isPending: true,
    };
  }

  const clean = abbrev.toUpperCase();
  if (ORBIT_DESCRIPTIONS[clean]) {
    return {
      ...ORBIT_DESCRIPTIONS[clean],
      isPending: false,
    };
  }

  const combined = (clean + " " + name).toUpperCase();
  if (combined.includes("MARS")) {
    return {
      badge: "Mars",
      name: name || "Interplanetary Mars Trajectory",
      altitude: "Interplanetary (~225M km)",
      desc: "Deep-space exploration mission directed toward the Martian gravitational system.",
      isPending: false,
    };
  }
  if (combined.includes("LUNAR") || combined.includes("MOON")) {
    return {
      badge: "Moon",
      name: name || "Lunar Trajectory",
      altitude: "~384,400 km",
      desc: "Lunar orbital reconnaissance, lander deployment, or sample return mission.",
      isPending: false,
    };
  }

  return {
    badge: clean,
    name: name || clean,
    altitude: "Orbital Trajectory",
    desc: "Specialized orbital path allocated according to payload operational mission requirements.",
    isPending: false,
  };
}

