"use client";

import { useState } from "react";
import { RocketLaunchSequence } from "./RocketLaunchSequence.js";
import {
  Compass,
  Sparkles,
  Radio,
  Gauge,
  Activity,
  ArrowDown,
  Shield,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

export function CinematicHero() {
  const [telemetry, setTelemetry] = useState({
    progress: 0,
    missionClock: "T+ 00:00",
    altitudeKm: "0.0",
    velocityKmh: 0,
    phase: "PAD PRE-IGNITION & LIFTOFF",
  });

  const progress = telemetry.progress || 0;

  return (
    <section id="hero" className="relative w-full bg-[#070910]">
      {/* Full-Screen Scroll Rocket Canvas with Nested Viewport Overlay */}
      <RocketLaunchSequence onProgress={setTelemetry}>
        {/* Floating Viewport Overlay Layer (Pinned directly on top of the rocket canvas) */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 lg:p-12 pt-28 sm:pt-32">
        {/* Top Telemetry Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#070910]/85 border border-[#65F6FF]/30 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65F6FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65F6FF]"></span>
            </span>
            <span className="text-[11px] font-mono tracking-widest text-[#F3F7FC] font-semibold">
              ISRO • SPACEX • NASA • GLOBAL LAUNCH TELEMETRY
            </span>
          </div>

          <div className="pointer-events-auto hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#070910]/85 border border-[rgba(180,210,235,0.15)] backdrop-blur-md text-[11px] font-mono text-[#9AA9BD]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>DOWNLINK FREQ: 2240.5 MHz (S-BAND)</span>
          </div>
        </div>

        {/* Center Grid: Left Editorial Typography & Right Live Aerospace HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto w-full max-w-7xl mx-auto">
          {/* Left Side: Editorial Headline (fades smoothly as rocket ascends past 30%) */}
          <div
            className="lg:col-span-7 space-y-6 text-left transition-all duration-500"
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
              <a
                href="#upcoming"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#65F6FF] text-[#070910] font-bold text-xs sm:text-sm tracking-wider hover:bg-[#65F6FF]/90 transition-all duration-300 shadow-[0_0_25px_rgba(101,246,255,0.4)] hover:shadow-[0_0_35px_rgba(101,246,255,0.6)]"
              >
                <Compass className="w-4 h-4" />
                EXPLORE MISSIONS
              </a>
              <a
                href="#ai"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#101C2D]/90 text-[#FFB45C] font-semibold text-xs sm:text-sm tracking-wider border border-[#FFB45C]/40 hover:bg-[#162438] hover:border-[#FFB45C] transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 text-[#FFB45C]" />
                MISSION INTELLIGENCE
              </a>
            </div>
          </div>

          {/* Right Side: Aerospace Telemetry HUD (Live Ascent Cockpit Dashboard) */}
          <div
            className="lg:col-span-5 pointer-events-auto transition-all duration-500 lg:ml-auto w-full max-w-md"
            style={{
              opacity: Math.min(progress * 2.5 + 0.35, 1),
            }}
          >
            <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 border border-[#65F6FF]/25 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              {/* Top Accent */}
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(180,210,235,0.12)] mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#65F6FF] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#F3F7FC] tracking-wider uppercase">
                    FLIGHT TELEMETRY HUD
                  </span>
                </div>
                <Badge variant="success" className="text-[10px]">
                  PROPULSION NOMINAL
                </Badge>
              </div>

              {/* Vehicle & Operator */}
              <div className="mb-4">
                <span className="text-[10px] font-mono text-[#9AA9BD] block">MISSION PROFILE</span>
                <span className="text-sm font-bold text-[#65F6FF] tracking-wide">
                  LVM3-M4 / FALCON 9 HEAVY
                </span>
                <span className="text-[11px] text-[#9AA9BD] block">ISRO / SpaceX Launch Control</span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass-panel p-3 rounded-xl border border-[rgba(180,210,235,0.1)]">
                  <span className="text-[10px] font-mono text-[#9AA9BD] block">MISSION CLOCK</span>
                  <span className="font-mono-numbers text-xl sm:text-2xl font-bold text-[#FFB45C] amber-glow">
                    {telemetry.missionClock}
                  </span>
                </div>

                <div className="glass-panel p-3 rounded-xl border border-[rgba(180,210,235,0.1)]">
                  <span className="text-[10px] font-mono text-[#9AA9BD] block">ALTITUDE</span>
                  <span className="font-mono-numbers text-xl sm:text-2xl font-bold text-[#65F6FF] cyan-glow">
                    {telemetry.altitudeKm} <span className="text-xs font-normal text-[#9AA9BD]">km</span>
                  </span>
                </div>
              </div>

              {/* Velocity */}
              <div className="glass-panel p-3 rounded-xl border border-[rgba(180,210,235,0.1)] mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#9AA9BD] block">ASCENT VELOCITY</span>
                  <span className="font-mono-numbers text-xl sm:text-2xl font-bold text-[#F3F7FC]">
                    {telemetry.velocityKmh.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-[#9AA9BD]">km/h</span>
                  </span>
                </div>
                <Gauge className="w-7 h-7 text-[#65F6FF]/50" />
              </div>

              {/* Flight Phase */}
              <div className="p-3 rounded-xl bg-[#070910]/70 border border-[rgba(180,210,235,0.1)]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA9BD] mb-1">
                  <span>TRAJECTORY PHASE</span>
                  <span className="text-[#FFB45C]">{Math.round(progress * 100)}%</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#65F6FF] block truncate">
                  {telemetry.phase}
                </span>

                {/* Trajectory Progress Bar */}
                <div className="w-full h-1.5 bg-[#101C2D] rounded-full mt-2 overflow-hidden border border-[rgba(180,210,235,0.1)]">
                  <div
                    className="h-full bg-gradient-to-r from-[#65F6FF] to-[#FFB45C] transition-all duration-150"
                    style={{ width: `${Math.max(progress * 100, 3)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Prompt */}
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
