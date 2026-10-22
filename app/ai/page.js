"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar.js";
import { Footer } from "@/components/layout/Footer.js";
import { MissionIntelligence } from "@/components/ai/MissionIntelligence.js";
import { selectNextUpcomingLaunch } from "@/utils/nextLaunchSelector.js";
import { Sparkles, Key, ShieldCheck, Cpu, Terminal, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

export default function AiIntelligencePage() {
  const [launches, setLaunches] = useState([]);
  const [loadingLaunches, setLoadingLaunches] = useState(true);
  const [initialMission, setInitialMission] = useState(null);

  // Fetch upcoming launches so user can select real missions
  useEffect(() => {
    fetch("/api/launches?type=upcoming&limit=25")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.launches) {
          setLaunches(data.launches);

          // Check if URL query has a missionId
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const missionId = params.get("missionId");
            if (missionId) {
              const found = data.launches.find((l) => l.id === missionId);
              if (found) setInitialMission(found);
            }
          }
        }
      })
      .catch((err) => console.error("Error loading launches for AI page:", err))
      .finally(() => setLoadingLaunches(false));
  }, []);

  const nextLaunch = useMemo(() => {
    return selectNextUpcomingLaunch(launches);
  }, [launches]);

  return (
    <div className="min-h-screen bg-[#060812] text-[#F3F7FC] flex flex-col space-grid-bg">
      <Navbar nextLaunch={nextLaunch} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Page Top Banner */}
        <div className="max-w-4xl mx-auto mb-8 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB45C]/15 border border-[#FFB45C]/40 text-xs font-mono text-[#FFB45C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DEEPSEEK AEROSPACE REASONING ENGINE ACTIVE</span>
            </div>

            {/* API Key Status Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101C2D] border border-emerald-500/35 text-xs font-mono text-[#F3F7FC]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-semibold">DeepSeek Key Configured</span>
              <span className="text-[#9AA9BD] text-[11px]">(ends in ...5812)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F3F7FC] mb-3">
            AI Mission <span className="bg-gradient-to-r from-[#FFB45C] via-[#F3F7FC] to-[#65F6FF] bg-clip-text text-transparent">Intelligence</span>
          </h1>
          <p className="text-sm sm:text-base text-[#9AA9BD] max-w-2xl font-light">
            Powered by DeepSeek AI and grounded strictly in verified Launch Library 2 flight parameters. Generate executive mission briefings, compare orbital vehicles, or ask complex astronautics questions.
          </p>
        </div>

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
          <div className="glass-panel p-4 rounded-2xl border border-[rgba(101,246,255,0.18)] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#65F6FF]/10 text-[#65F6FF] border border-[#65F6FF]/30 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F3F7FC] mb-1">Grounded Veracity</h4>
              <p className="text-[11px] text-[#9AA9BD]">Strict adherence to verified telemetry manifests without speculative hallucination.</p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-[rgba(255,180,92,0.2)] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#FFB45C]/10 text-[#FFB45C] border border-[#FFB45C]/30 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F3F7FC] mb-1">Real-Time Synthesis</h4>
              <p className="text-[11px] text-[#9AA9BD]">Automated executive briefings for any scheduled ISRO, SpaceX, or NASA flight.</p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F3F7FC] mb-1">Dual-Engine Resilient</h4>
              <p className="text-[11px] text-[#9AA9BD]">Seamless failover between live DeepSeek completions and verified telemetry engine.</p>
            </div>
          </div>
        </div>

        {/* AI Mission Intelligence Component */}
        {loadingLaunches ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#101C2D] border border-[#FFB45C]/35 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-[#FFB45C]" />
            </div>
            <h3 className="text-xl font-bold text-[#F3F7FC] mb-2 font-mono">Loading Flight Manifests</h3>
            <p className="text-sm text-[#9AA9BD]">Preparing aerospace intelligence models...</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <MissionIntelligence
              launches={launches}
              initialMission={initialMission}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
