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

          {/* Elevated Right-Side Aerospace Telemetry & Vehicle Profile Rectangle Box */}
          <div
            className="pointer-events-auto absolute right-4 sm:right-8 lg:right-12 bottom-24 sm:bottom-28 z-30 w-[300px] sm:w-[340px] rounded-2xl bg-[#070910]/90 border border-[#65F6FF]/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 hover:border-[#65F6FF]/70"
            style={{
              opacity: Math.max(0.4, 1 - progress * 1.5),
              transform: `translateY(${progress * 15}px)`,
            }}
          >
            {/* Box Header Strip */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#101C2D]/90 border-b border-[#65F6FF]/20">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65F6FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65F6FF]"></span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#65F6FF] font-bold uppercase">
                  VEHICLE TELEMETRY • HUD
                </span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#65F6FF]/10 text-[#65F6FF] border border-[#65F6FF]/30 font-semibold">
                LIVE
              </span>
            </div>

            {/* Rocket Schematic & Profile Matter */}
            <div className="p-3.5 space-y-3">
              {/* Visual Rocket & Trajectory Row */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B1322]/80 border border-[rgba(101,246,255,0.12)]">
                {/* Rocket Graphic with Thruster Flame */}
                <div className="relative w-12 h-16 rounded-lg bg-[#070910] border border-[#65F6FF]/25 flex flex-col items-center justify-center overflow-hidden shrink-0">
                  <Rocket className="w-7 h-7 text-[#65F6FF] -rotate-45" />
                  {/* Dynamic Thruster Plume */}
                  <div
                    className="absolute bottom-0 w-3 rounded-full bg-gradient-to-t from-[#FF7900] via-[#FFB45C] to-transparent animate-pulse"
                    style={{
                      height: `${Math.max(10, Math.min(28, (progress || 0.1) * 35))}px`,
                      opacity: progress > 0 ? 1 : 0.6,
                    }}
                  />
                </div>

                {/* Trajectory Phase & Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-[#9AA9BD] uppercase tracking-wider">
                    FLIGHT PHASE
                  </div>
                  <div className="text-xs font-mono font-bold text-[#F3F7FC] truncate mt-0.5">
                    {telemetry.phase || "PAD T-0 STANDBY"}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono text-[#65F6FF] bg-[#65F6FF]/10 px-1.5 py-0.5 rounded border border-[#65F6FF]/20">
                      ORBITAL CLASS
                    </span>
                    <span className="text-[9px] font-mono text-[#FFB45C] flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFB45C] animate-ping"></span>
                      PROPULSION 100%
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Telemetry Metrics Grid (Altitude, Velocity) */}
              <div className="grid grid-cols-2 gap-2 text-left font-mono">
                <div className="p-2 rounded-lg bg-[#101C2D]/60 border border-[rgba(101,246,255,0.1)]">
                  <div className="text-[9px] text-[#9AA9BD] uppercase">ALTITUDE (AGL)</div>
                  <div className="text-xs font-bold text-[#65F6FF] mt-0.5">
                    {telemetry.altitudeKm ? `${telemetry.altitudeKm} km` : "0.0 km"}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#101C2D]/60 border border-[rgba(101,246,255,0.1)]">
                  <div className="text-[9px] text-[#9AA9BD] uppercase">VELOCITY</div>
                  <div className="text-xs font-bold text-[#F3F7FC] mt-0.5">
                    {telemetry.velocityKmh ? `${telemetry.velocityKmh} km/h` : "0 km/h"}
                  </div>
                </div>
              </div>

              {/* Trajectory Thrust Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-[#9AA9BD]">
                  <span>ASCENT TRAJECTORY</span>
                  <span className="text-[#65F6FF] font-semibold">{Math.round((progress || 0) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#101C2D] overflow-hidden border border-[rgba(101,246,255,0.15)]">
                  <div
                    className="h-full bg-gradient-to-r from-[#65F6FF] via-[#FFB45C] to-[#FF7900] transition-all duration-300"
                    style={{ width: `${Math.max(5, Math.min(100, (progress || 0.05) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Bottom Dual Time Reference Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-[rgba(180,210,235,0.08)] text-[9px] font-mono text-[#9AA9BD]">
                <span className="text-[#65F6FF]/80">🌐 UTC SYNC</span>
                <span className="text-[#FFB45C]/90 font-semibold">🇮🇳 IST (+5:30)</span>
                <span className="text-[#2EE59D] font-semibold">● NOMINAL</span>
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
