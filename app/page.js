"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar.js";
import { Footer } from "@/components/layout/Footer.js";
import { CinematicHero } from "@/components/hero/CinematicHero.js";
import { LaunchCountdown } from "@/components/countdown/LaunchCountdown.js";
import { MissionCard } from "@/components/missions/MissionCard.js";
import { MissionDetailsModal } from "@/components/missions/MissionDetailsModal.js";
import { selectNextUpcomingLaunch } from "@/utils/nextLaunchSelector.js";
import { resolveUniqueLaunchImages } from "@/utils/rocketImageResolver.js";
import {
  Compass,
  Radio,
  Sparkles,
  ArrowRight,
  Database,
  Rocket,
  Clock,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

export default function HomePage() {
  const router = useRouter();
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalLaunch, setActiveModalLaunch] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Fetch upcoming launches for countdown and spotlight
  const fetchLaunches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/launches?type=upcoming&limit=30");
      if (!res.ok) {
        throw new Error(`Aerospace telemetry server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setLaunches(data.launches || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("[HOME LAUNCH FETCH ERROR]", err);
      setError(err.message || "Failed to load live flight manifest.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaunches();
  }, [fetchLaunches]);

  const nextLaunch = useMemo(() => {
    return selectNextUpcomingLaunch(launches);
  }, [launches]);

  // Next 6 flights for spotlight (each with guaranteed unique real launch image)
  const spotlightLaunches = useMemo(() => {
    return resolveUniqueLaunchImages(launches.slice(0, 6));
  }, [launches]);

  return (
    <div className="min-h-screen bg-[#060812] text-[#F3F7FC] flex flex-col">
      <Navbar nextLaunch={nextLaunch} />

      <main id="main-content" className="flex-1">
        {/* 1. Full Cinematic Rocket Ascent Scroll Hero */}
        <CinematicHero />

        {/* 2. Next Immediate Launch Live Countdown Banner */}
        <section id="countdown" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#65F6FF]/10 border border-[#65F6FF]/30 text-xs font-mono text-[#65F6FF] mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#65F6FF]" />
              <span>LIVE ORBITAL TELEMETRY • IMMEDIATE LAUNCH</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F3F7FC] tracking-tight mb-3">
              Next Upcoming Spaceflight
            </h2>
            <p className="text-sm sm:text-base text-[#9AA9BD] leading-relaxed font-light">
              High-precision T-0 countdown synchronized with spaceport master clocks worldwide.
            </p>
          </div>

          <LaunchCountdown
            launch={nextLaunch}
            loading={loading}
            onSelectLaunch={(l) => setActiveModalLaunch(l)}
            onAskAi={(l) => {
              router.push(`/ai?missionId=${encodeURIComponent(l.id)}&missionName=${encodeURIComponent(l.name)}`);
            }}
          />
        </section>

        {/* 3. Space Exploration Separate Pages Portal Showcase */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#65F6FF] block mb-2 font-semibold">
              Mission Control Centers
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
              Explore Dedicated Spaceflight Portals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Portal 1: Upcoming Launches */}
            <Link
              href="/launches"
              className="group glass-panel rounded-3xl p-6 sm:p-8 border border-[rgba(101,246,255,0.18)] hover:border-[#65F6FF]/50 transition-all duration-300 hover:shadow-[0_12px_35px_rgba(101,246,255,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#65F6FF]/10 border border-[#65F6FF]/30 flex items-center justify-center text-[#65F6FF] mb-6 group-hover:scale-110 transition-transform">
                  <Rocket className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#65F6FF]/15 text-[#65F6FF] text-[10px] font-mono font-semibold mb-3">
                  LIVE TICKERS ON EVERY LAUNCH
                </div>
                <h3 className="text-xl font-bold text-[#F3F7FC] mb-2 group-hover:text-[#65F6FF] transition-colors">
                  Upcoming Launches
                </h3>
                <p className="text-sm text-[#9AA9BD] leading-relaxed">
                  Every scheduled flight with real-time ticking second countdowns, auto-refresh telemetry, and filters for ISRO, SpaceX, NASA, and global spaceports.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono text-[#65F6FF] font-semibold mt-4 border-t border-[rgba(180,210,235,0.1)]">
                <span>OPEN LAUNCH SCHEDULE</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Portal 2: Mission Archive */}
            <Link
              href="/archive"
              className="group glass-panel rounded-3xl p-6 sm:p-8 border border-[rgba(255,180,92,0.18)] hover:border-[#FFB45C]/50 transition-all duration-300 hover:shadow-[0_12px_35px_rgba(255,180,92,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFB45C]/10 border border-[#FFB45C]/30 flex items-center justify-center text-[#FFB45C] mb-6 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFB45C]/15 text-[#FFB45C] text-[10px] font-mono font-semibold mb-3">
                  HISTORICAL TELEMETRY ARCHIVE
                </div>
                <h3 className="text-xl font-bold text-[#F3F7FC] mb-2 group-hover:text-[#FFB45C] transition-colors">
                  Mission Archive
                </h3>
                <p className="text-sm text-[#9AA9BD] leading-relaxed">
                  Historical flight records, success rates, elapsed flight timers, and complete orbital dossiers across decades of human space exploration.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono text-[#FFB45C] font-semibold mt-4 border-t border-[rgba(180,210,235,0.1)]">
                <span>VIEW MISSION ARCHIVES</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Portal 3: AI Intelligence */}
            <Link
              href="/ai"
              className="group glass-panel rounded-3xl p-6 sm:p-8 border border-[rgba(167,139,250,0.25)] hover:border-[#A78BFA]/50 transition-all duration-300 hover:shadow-[0_12px_35px_rgba(167,139,250,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/10 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#A78BFA]/15 text-[#A78BFA] text-[10px] font-mono font-semibold mb-3">
                  DEEPSEEK AEROSPACE AI
                </div>
                <h3 className="text-xl font-bold text-[#F3F7FC] mb-2 group-hover:text-[#A78BFA] transition-colors">
                  AI Mission Intelligence
                </h3>
                <p className="text-sm text-[#9AA9BD] leading-relaxed">
                  Interactive AI reasoning engine for executive briefings, vehicle capability comparisons, and technical aerospace terminology explanations.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs font-mono text-[#A78BFA] font-semibold mt-4 border-t border-[rgba(180,210,235,0.1)]">
                <span>ENTER AI COMMAND CENTER</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* 4. Upcoming Missions Spotlight Grid (With Live Countdown on EVERY card) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101C2D] border border-[rgba(101,246,255,0.2)] text-xs font-mono text-[#65F6FF] mb-2">
                <Clock className="w-3.5 h-3.5 text-[#65F6FF]" />
                <span>FLIGHT COUNTDOWNS ACTIVE</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
                Immediate Launch Spotlight
              </h2>
            </div>

            <Link
              href="/launches"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101C2D] border border-[#65F6FF]/35 text-xs text-[#65F6FF] font-mono font-semibold hover:bg-[#162438] transition-colors"
            >
              <span>View All 30+ Upcoming Launches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#101C2D] border border-[#65F6FF]/35 flex items-center justify-center animate-pulse">
                <Rocket className="w-6 h-6 text-[#65F6FF]" />
              </div>
              <p className="text-sm text-[#9AA9BD] font-mono">Loading immediate launch manifests...</p>
            </div>
          ) : error ? (
            <div className="glass-panel p-6 rounded-2xl text-center border border-rose-500/30 max-w-md mx-auto">
              <p className="text-sm text-rose-400 mb-3">{error}</p>
              <button
                onClick={fetchLaunches}
                className="px-4 py-2 rounded-lg bg-[#65F6FF] text-[#060812] text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spotlightLaunches.map((launch) => (
                <MissionCard
                  key={launch.id}
                  launch={launch}
                  onSelectLaunch={(l) => setActiveModalLaunch(l)}
                  onAskAi={() => {
                    router.push(`/ai?missionId=${encodeURIComponent(launch.id)}&missionName=${encodeURIComponent(launch.name)}`);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Flight Dossier Modal */}
      {activeModalLaunch && (
        <MissionDetailsModal
          launch={activeModalLaunch}
          onClose={() => setActiveModalLaunch(null)}
          onAskAi={() => {
            router.push(`/ai?missionId=${encodeURIComponent(activeModalLaunch.id)}&missionName=${encodeURIComponent(activeModalLaunch.name)}`);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
