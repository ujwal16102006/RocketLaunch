"use client";

import { useState } from "react";
import { RocketLaunchSequence } from "./RocketLaunchSequence.js";
import { Sparkles, Compass, ShieldCheck, Activity } from "lucide-react";

export function CinematicHero() {
  const [scrollProgress, setScrollProgress] = useState(0);

  return (
    <section id="hero" className="relative w-full bg-[#070910] overflow-hidden">
      {/* Top Hero Text Overlays (fading out smoothly as launch progresses) */}
      <div
        className="relative z-30 pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center transition-opacity duration-500"
        style={{
          opacity: Math.max(1 - scrollProgress * 2.5, 0),
          pointerEvents: scrollProgress > 0.35 ? "none" : "auto",
        }}
      >
        {/* Top Operational Telemetry Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#101C2D]/80 border border-[#65F6FF]/30 backdrop-blur-md text-xs font-mono text-[#F3F7FC] mb-8">
          <Activity className="w-3.5 h-3.5 text-[#65F6FF] animate-pulse" />
          <span className="text-[#65F6FF]">TELEMETRY FEED:</span>
          <span>ORBITAL MANIFEST SYNCHRONIZED</span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F3F7FC] max-w-4xl mx-auto leading-[1.08] mb-6">
          THE NEXT FRONTIER <br />
          <span className="bg-gradient-to-r from-[#F3F7FC] via-[#65F6FF] to-[#FFB45C] bg-clip-text text-transparent">
            IS CLOSER THAN YOU THINK.
          </span>
        </h1>

        {/* Editorial Subtitle */}
        <p className="text-base sm:text-lg text-[#9AA9BD] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Discover upcoming orbital launches worldwide, explore historic milestones across space agencies, and monitor high-precision live countdowns to ignition.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#upcoming"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#65F6FF] text-[#070910] font-bold text-sm tracking-wide hover:bg-[#65F6FF]/90 transition-all duration-300 shadow-[0_0_25px_rgba(101,246,255,0.4)] hover:shadow-[0_0_35px_rgba(101,246,255,0.6)]"
          >
            <Compass className="w-4 h-4" />
            EXPLORE MISSIONS
          </a>
          <a
            href="#ai"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#101C2D] text-[#FFB45C] font-semibold text-sm tracking-wide border border-[#FFB45C]/40 hover:bg-[#162438] hover:border-[#FFB45C] transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-[#FFB45C]" />
            MISSION INTELLIGENCE
          </a>
        </div>
      </div>

      {/* Embedded Scroll-Controlled Rocket Canvas */}
      <RocketLaunchSequence onScrollProgress={setScrollProgress} />
    </section>
  );
}
