"use client";

import { useState } from "react";
import Link from "next/link";
import { RocketLaunchSequence } from "./RocketLaunchSequence.js";
import { Compass, Sparkles, ArrowDown } from "lucide-react";

export function CinematicHero() {
  const [telemetry, setTelemetry] = useState({ progress: 0 });
  const progress = telemetry.progress || 0;

  return (
    <section id="hero" className="relative w-full bg-[#070910]">
      {/* Full-Screen Scroll Rocket Canvas with Nested Viewport Overlay */}
      <RocketLaunchSequence onProgress={setTelemetry}>
        {/* Floating Viewport Overlay Layer (Pinned directly on top of the rocket canvas) */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 lg:p-12 pt-28 sm:pt-32">
          {/* Top Aerospace Branding Pill */}
          <div className="flex items-center">
            <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#070910]/85 border border-[#65F6FF]/30 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65F6FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65F6FF]"></span>
              </span>
              <span className="text-[11px] font-mono tracking-widest text-[#F3F7FC] font-semibold">
                ISRO • SPACEX • NASA • GLOBAL LAUNCH TELEMETRY
              </span>
            </div>
          </div>

          {/* Left Side: Clean Editorial Headline (Fades smoothly as rocket lifts off) */}
          <div className="my-auto w-full max-w-7xl mx-auto">
            <div
              className="space-y-6 text-left max-w-2xl transition-all duration-500"
              style={{
                opacity: Math.max(1 - progress * 2.8, 0),
                transform: `translateY(-${progress * 40}px)`,
                pointerEvents: progress > 0.35 ? "none" : "auto",
              }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101C2D]/80 border border-[#65F6FF]/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#65F6FF]" />
                <span className="text-xs font-mono text-[#65F6FF] tracking-wider uppercase font-semibold">
                  Explore Beyond The Countdown
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F3F7FC] leading-[1.05]">
                THE NEXT FRONTIER <br />
                <span className="bg-gradient-to-r from-[#F3F7FC] via-[#65F6FF] to-[#FFB45C] bg-clip-text text-transparent">
                  IS CLOSER THAN YOU THINK.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#9AA9BD] max-w-xl leading-relaxed font-light">
                Witness real-time orbital launches from ISRO, SpaceX, NASA, and global spaceports. Track live T-0 ignition countdowns and access deep aerospace flight intelligence.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/launches"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#65F6FF] text-[#070910] font-bold text-xs sm:text-sm tracking-wider hover:bg-[#65F6FF]/90 transition-all duration-300 shadow-[0_0_25px_rgba(101,246,255,0.4)] hover:shadow-[0_0_35px_rgba(101,246,255,0.6)]"
                >
                  <Compass className="w-4 h-4" />
                  EXPLORE MISSIONS
                </Link>
                <Link
                  href="/ai"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#101C2D]/90 text-[#FFB45C] font-semibold text-xs sm:text-sm tracking-wider border border-[#FFB45C]/40 hover:bg-[#162438] hover:border-[#FFB45C] transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 text-[#FFB45C]" />
                  MISSION INTELLIGENCE
                </Link>
              </div>
            </div>
          </div>

          {/* Centered Scroll Prompt */}
          <div
            className="flex flex-col items-center justify-center gap-1.5 text-xs font-mono tracking-widest text-[#9AA9BD] transition-opacity duration-300 pointer-events-none"
            style={{
              opacity: Math.max(1 - progress * 4, 0),
            }}
          >
            <span className="text-[11px] text-[#65F6FF]">SCROLL TO INITIATE ASCENT</span>
            <ArrowDown className="w-4 h-4 text-[#65F6FF] animate-bounce" />
          </div>
        </div>
      </RocketLaunchSequence>
    </section>
  );
}
