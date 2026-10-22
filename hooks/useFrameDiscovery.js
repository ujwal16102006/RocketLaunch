"use client";

import { useState, useEffect } from "react";

export function useFrameDiscovery() {
  const [data, setData] = useState({
    available: false,
    count: 0,
    frames: [],
    firstFrame: null,
    lastFrame: null,
    sourceDirectory: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadFrames() {
      try {
        const res = await fetch("/api/animations/frames");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (isMounted) {
          setData({
            available: Boolean(json.available && json.count > 0),
            count: json.count || 0,
            frames: json.frames || [],
            firstFrame: json.firstFrame || null,
            lastFrame: json.lastFrame || null,
            sourceDirectory: json.sourceDirectory || "",
            loading: false,
            error: null,
          });

          // Preload first frame immediately
          if (json.firstFrame) {
            const img = new Image();
            img.src = json.firstFrame;
          }
        }
      } catch (err) {
        if (isMounted) {
          setData((prev) => ({
            ...prev,
            loading: false,
            error: err.message,
          }));
        }
      }
    }

    loadFrames();

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
