"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useFrameDiscovery } from "@/hooks/useFrameDiscovery.js";
import { Sparkles, ArrowDown } from "lucide-react";

export function RocketLaunchSequence({ onScrollProgress = null }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageCacheRef = useRef(new Map());
  const rafIdRef = useRef(null);
  const currentFrameIndexRef = useRef(0);

  const { frames, count, available, loading, firstFrame } = useFrameDiscovery();
  const [loadedFrameCount, setLoadedFrameCount] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  // Draw a specific frame to canvas
  const drawFrame = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // Compute aspect-fit dimensions (contain)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderH = ch;
      renderW = ch * imgRatio;
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = cw;
      renderH = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }, []);

  // Preload and cache frames progressively
  useEffect(() => {
    if (!frames || frames.length === 0) return;

    let isCancelled = false;

    // Load first frame immediately
    const img0 = new Image();
    img0.src = frames[0];
    img0.onload = () => {
      if (!isCancelled) {
        imageCacheRef.current.set(0, img0);
        setLoadedFrameCount((prev) => Math.max(prev, 1));
        drawFrame(img0);
        setCanvasReady(true);
      }
    };

    // Load remaining frames in batches
    const loadBatch = (startIndex, batchSize) => {
      if (isCancelled || startIndex >= frames.length) return;

      const endIndex = Math.min(startIndex + batchSize, frames.length);
      let batchLoaded = 0;

      for (let i = startIndex; i < endIndex; i++) {
        if (imageCacheRef.current.has(i)) continue;

        const img = new Image();
        img.src = frames[i];
        img.onload = () => {
          if (!isCancelled) {
            imageCacheRef.current.set(i, img);
            batchLoaded++;
            if (batchLoaded % 10 === 0 || i === frames.length - 1) {
              setLoadedFrameCount(imageCacheRef.current.size);
            }
          }
        };
      }

      // Schedule next batch
      setTimeout(() => {
        loadBatch(endIndex, batchSize);
      }, 50);
    };

    loadBatch(1, 15);

    return () => {
      isCancelled = true;
    };
  }, [frames, drawFrame]);

  // Handle high-DPI canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.floor(rect.width * dpr);
      const targetH = Math.floor(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        // Redraw current frame
        const currentImg = imageCacheRef.current.get(currentFrameIndexRef.current);
        if (currentImg) drawFrame(currentImg);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Scroll position to frame mapping
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !frames || frames.length === 0) return;

    const handleScroll = () => {
      if (rafIdRef.current) return;

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;

        if (totalScrollable <= 0) return;

        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);

        if (onScrollProgress) onScrollProgress(progress);

        const totalFrames = frames.length;
        const frameIndex = Math.min(Math.floor(progress * totalFrames), totalFrames - 1);

        if (frameIndex !== currentFrameIndexRef.current) {
          currentFrameIndexRef.current = frameIndex;

          // Find the closest available cached frame if target frame is still loading
          let renderImg = imageCacheRef.current.get(frameIndex);
          if (!renderImg) {
            for (let offset = 1; offset < 20; offset++) {
              if (imageCacheRef.current.has(frameIndex - offset)) {
                renderImg = imageCacheRef.current.get(frameIndex - offset);
                break;
              }
              if (imageCacheRef.current.has(frameIndex + offset)) {
                renderImg = imageCacheRef.current.get(frameIndex + offset);
                break;
              }
            }
          }

          if (renderImg) {
            drawFrame(renderImg);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [frames, onScrollProgress, drawFrame]);

  return (
    <div ref={containerRef} className="relative w-full h-[220vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#070910]">
        {/* Background cosmic illumination */}
        <div className="absolute inset-0 bg-radial-gradient from-[#101C2D]/40 via-transparent to-[#070910] pointer-events-none" />

        {/* Cinematic Canvas */}
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full max-h-[92vh] max-w-[1400px] object-contain transition-opacity duration-700"
          style={{ opacity: canvasReady ? 1 : 0 }}
        />

        {/* Procedural Visual Fallback (if no frames discovered) */}
        {!available && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-24 h-24 rounded-full bg-[#65F6FF]/10 border border-[#65F6FF]/30 flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-[#65F6FF]" />
            </div>
            <h3 className="text-2xl font-bold text-[#F3F7FC] mb-2">Flight Trajectory Vector</h3>
            <p className="text-sm text-[#9AA9BD] max-w-md">
              Orbital launch simulation sequence active. Discovered frame manifest is synchronizing with aerospace data.
            </p>
          </div>
        )}

        {/* Subtle Frame Sequence Progress Indicator */}
        {available && count > 0 && (
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#101C2D]/80 border border-[rgba(180,210,235,0.15)] backdrop-blur-md text-[11px] font-mono text-[#9AA9BD]">
            <span className="w-2 h-2 rounded-full bg-[#65F6FF] animate-pulse"></span>
            <span>
              SEQUENCE: {currentFrameIndexRef.current + 1} / {count} FRAMES
            </span>
            {loadedFrameCount < count && (
              <span className="text-[#FFB45C]">({Math.round((loadedFrameCount / count) * 100)}% buffered)</span>
            )}
          </div>
        )}

        {/* Scroll Prompt */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-xs font-mono tracking-widest text-[#9AA9BD] animate-bounce pointer-events-none">
          <span>SCROLL TO LAUNCH</span>
          <ArrowDown className="w-4 h-4 text-[#65F6FF]" />
        </div>
      </div>
    </div>
  );
}
