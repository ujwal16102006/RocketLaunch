"use client";

import { useState } from "react";
import Link from "next/link";
import { RocketLaunchSequence } from "./RocketLaunchSequence.js";
import { Compass, Sparkles, ArrowDown, Rocket } from "lucide-react";

export function CinematicHero() {
  const [telemetry, setTelemetry] = useState({ progress: 0 });
  const progress = telemetry.progress || 0;

  return (
    <section id="hero" className="relative w-full bg-[#070910]">
      {/* Full-Screen Scroll Rocket Canvas with Nested Viewport Overlay */}
      <RocketLaunchSequence onProgress={setTelemetry}>
        {/* Floating Viewport Overlay Layer (Pinned directly on top of the rocket canvas) */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 lg:p-12 pt-28 sm:pt-32">
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
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F3F7FC] leading-[1.05]">
                THE NEXT FRONTIER <br />
                <span className="bg-gradient-to-r from-[#F3F7FC] via-[#65F6FF] to-[#FFB45C] bg-clip-text text-transparent">
                  IS CLOSER THAN YOU THINK.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-black max-w-xl leading-relaxed font-semibold">
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

          {/* Right-Side Rocket Launch Badge (Positioned over bottom-right corner mark) */}
          <div
            className="pointer-events-auto absolute right-6 sm:right-10 lg:right-16 bottom-14 sm:bottom-16 z-30 w-40 sm:w-44 rounded-2xl bg-[#070910] border border-[#65F6FF]/35 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.95)] p-4 flex flex-col items-center justify-center text-center group transition-all duration-300 hover:border-[#65F6FF]/70 hover:shadow-[0_0_25px_rgba(101,246,255,0.25)]"
            style={{
              opacity: Math.max(0.6, 1 - progress * 2),
              transform: `translateY(${progress * 15}px)`,
            }}
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-[#65F6FF]/10 border border-[#65F6FF]/30 text-[#65F6FF] mb-2.5 transition-transform duration-300 group-hover:scale-110">
              <Rocket className="w-6 h-6 -rotate-45 text-[#65F6FF] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65F6FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65F6FF]"></span>
              </span>
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#F3F7FC] uppercase">
              ROCKET LAUNCH
            </span>
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
