"use client";

import { useState, useEffect, useCallback } from "react";
import { calculateCountdown } from "@/utils/dateUtils.js";

/**
 * Custom React hook for live mission countdown with zero-drift tab wake synchronization.
 *
 * @param {string|Date|null} targetTime - Scheduled launch timestamp (ISO or Date)
 * @returns {object} Live countdown status
 */
export function useCountdown(targetTime) {
  const [countdown, setCountdown] = useState(() => calculateCountdown(targetTime));

  const update = useCallback(() => {
    setCountdown(calculateCountdown(targetTime));
  }, [targetTime]);

  useEffect(() => {
    update();

    if (!targetTime) return;

    // Recalculate every second
    const interval = setInterval(update, 1000);

    // Synchronize immediately when tab regains visibility
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        update();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [targetTime, update]);

  return countdown;
}
