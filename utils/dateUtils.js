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
