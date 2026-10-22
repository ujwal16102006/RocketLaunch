"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useFrameDiscovery } from "@/hooks/useFrameDiscovery.js";
import { Sparkles } from "lucide-react";

export function RocketLaunchSequence({ onProgress = null, children }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageCacheRef = useRef(new Map());
  const rafIdRef = useRef(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);

  const { frames, count, available, loading } = useFrameDiscovery();
  const [canvasReady, setCanvasReady] = useState(false);

  // High-performance canvas draw with smooth cover aspect ratio
  const drawFrame = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Cover aspect-fill calculation for full-screen immersive visuals
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const scale = Math.max(cw / imgW, ch / imgH);
    const renderW = imgW * scale;
    const renderH = imgH * scale;
    const offsetX = (cw - renderW) / 2;
    const offsetY = (ch - renderH) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }, []);

  // Preload and cache frames progressively in batches
  useEffect(() => {
    if (!frames || frames.length === 0) return;

    let isCancelled = false;

    // Load first frame immediately
    const img0 = new Image();
    img0.src = frames[0];
    img0.onload = () => {
      if (!isCancelled) {
        imageCacheRef.current.set(0, img0);
        drawFrame(img0);
        setCanvasReady(true);
      }
    };

    // Load nearby and remaining frames in non-blocking batches
    const loadBatch = (startIndex, batchSize) => {
      if (isCancelled || startIndex >= frames.length) return;

      const endIndex = Math.min(startIndex + batchSize, frames.length);

      for (let i = startIndex; i < endIndex; i++) {
        if (imageCacheRef.current.has(i)) continue;

        const img = new Image();
        img.src = frames[i];
        img.onload = () => {
          if (!isCancelled) {
            imageCacheRef.current.set(i, img);
          }
        };
      }

      setTimeout(() => {
        loadBatch(endIndex, batchSize);
      }, 40);
    };

    loadBatch(1, 15);

    return () => {
      isCancelled = true;
    };
  }, [frames, drawFrame]);

  // Handle canvas sizing with high-DPI sharpness
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        const img = imageCacheRef.current.get(Math.round(currentFrameRef.current));
        if (img) drawFrame(img);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Smooth frame interpolation loop (Lerp for buttery fluid motion)
  useEffect(() => {
    let animId;

    const renderLoop = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.05) {
        // Smooth lerp interpolation factor 0.18
        currentFrameRef.current = current + diff * 0.18;
        const frameIdx = Math.min(
          Math.max(Math.round(currentFrameRef.current), 0),
          (frames?.length || 1) - 1
        );

        // Find nearest loaded cached image
        let img = imageCacheRef.current.get(frameIdx);
        if (!img) {
          for (let offset = 1; offset < 25; offset++) {
            if (imageCacheRef.current.has(frameIdx - offset)) {
              img = imageCacheRef.current.get(frameIdx - offset);
              break;
            }
            if (imageCacheRef.current.has(frameIdx + offset)) {
              img = imageCacheRef.current.get(frameIdx + offset);
              break;
            }
          }
        }

        if (img) drawFrame(img);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [frames, drawFrame]);

  // Map scroll position smoothly to target frame index & flight telemetry
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !frames || frames.length === 0) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);

      const totalFrames = frames.length;
      targetFrameRef.current = Math.min(progress * (totalFrames - 1), totalFrames - 1);

      // Notify parent of flight telemetry (without technical frame debug words)
      if (onProgress) {
        const totalSecs = Math.floor(progress * 168);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const missionClock = `T+ 0${mins}:${secs < 10 ? "0" : ""}${secs}`;

        const altitudeKm = (Math.pow(progress, 1.8) * 168.4).toFixed(1);
        const velocityKmh = Math.round(Math.pow(progress, 1.5) * 27450);

        let phase = "PAD LIFTOFF & TOWER CLEARANCE";
        if (progress > 0.12 && progress <= 0.35) phase = "TRANSONIC ACCELERATION";
        else if (progress > 0.35 && progress <= 0.6) phase = "MAX-Q (MAX DYNAMIC PRESSURE)";
        else if (progress > 0.6 && progress <= 0.85) phase = "STAGE 1 MAIN ENGINE PROPULSION";
        else if (progress > 0.85 && progress <= 0.95) phase = "MECO (MAIN ENGINE CUTOFF)";
        else if (progress > 0.95) phase = "STAGE SEPARATION & ORBIT INSERTION";

        onProgress({
          progress,
          missionClock,
          altitudeKm,
          velocityKmh,
          phase,
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [frames, onProgress]);

  return (
    <div ref={containerRef} className="relative w-full h-[320vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#070910]">
        {/* Full-screen Canvas with enhanced visual brightness & contrast */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{
            opacity: canvasReady ? 1 : 0,
            filter: "brightness(1.22) contrast(1.06) saturate(1.05)",
          }}
        />

        {/* Soft bottom edge transition to next dark section */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#070910] to-transparent pointer-events-none" />

        {/* Floating Viewport Content (Overlay UI) */}
        {children}

        {/* Procedural Fallback if assets missing */}
        {!available && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-24 h-24 rounded-full bg-[#65F6FF]/10 border border-[#65F6FF]/30 flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-[#65F6FF]" />
            </div>
            <h3 className="text-2xl font-bold text-[#F3F7FC] mb-2">Orbital Telemetry Stream Active</h3>
            <p className="text-sm text-[#9AA9BD] max-w-md">
              Synchronizing launch ascent vector with live aerospace tracking systems.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
