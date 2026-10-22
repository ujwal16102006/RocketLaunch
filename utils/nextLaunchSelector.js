/**
 * Selects the earliest upcoming valid launch for the live hero countdown.
 *
 * Rules:
 * 1. Must have a valid parseable 'net' timestamp.
 * 2. Scheduled timestamp must be in the future relative to 'now' (or within an active 30min window).
 * 3. Ignores terminal non-active statuses (e.g. Failure, Cancelled, Partial Failure).
 * 4. Sorts ascending by NET timestamp to choose the earliest candidate.
 *
 * @param {Array<object>} launches - Array of normalized mission objects
 * @param {number} [now=Date.now()] - Current epoch millisecond
 * @returns {object|null} Earliest eligible launch or null
 */
export function selectNextUpcomingLaunch(launches, now = Date.now()) {
  if (!Array.isArray(launches) || launches.length === 0) {
    return null;
  }

  // Terminal status strings to exclude from "upcoming" active countdown
  const TERMINAL_STATUS_NAMES = [
    "launch failure",
    "failure",
    "cancelled",
    "partial failure",
  ];

  const eligible = launches.filter((launch) => {
    if (!launch || !launch.net) return false;
    const epoch = new Date(launch.net).getTime();
    if (isNaN(epoch)) return false;

    // Only allow flights scheduled in the future
    if (epoch < now) return false;

    // Check status
    const statusName = (launch.status?.name || "").toLowerCase();
    if (TERMINAL_STATUS_NAMES.some((term) => statusName.includes(term))) {
      return false;
    }

    return true;
  });

  if (eligible.length === 0) {
    return null;
  }

  // Sort by net timestamp ascending (earliest first)
  eligible.sort((a, b) => {
    const timeA = new Date(a.net).getTime();
    const timeB = new Date(b.net).getTime();
    return timeA - timeB;
  });

  return eligible[0];
}
