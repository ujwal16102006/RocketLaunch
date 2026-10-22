"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar.js";
import { Footer } from "@/components/layout/Footer.js";
import { MissionCard } from "@/components/missions/MissionCard.js";
import { MissionDetailsModal } from "@/components/missions/MissionDetailsModal.js";
import { selectNextUpcomingLaunch } from "@/utils/nextLaunchSelector.js";
import { useFavorites } from "@/hooks/useFavorites.js";
import {
  Rocket,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  Heart,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

const POPULAR_AGENCIES = [
  { id: "ALL", label: "All Agencies" },
  { id: "ISRO", label: "ISRO 🇮🇳", match: ["ISRO", "Indian Space Research Organisation"] },
  { id: "SpaceX", label: "SpaceX 🇺🇸", match: ["SpaceX"] },
  { id: "NASA", label: "NASA 🇺🇸", match: ["NASA", "National Aeronautics and Space Administration"] },
  { id: "Rocket Lab", label: "Rocket Lab 🇳🇿", match: ["Rocket Lab"] },
  { id: "ESA", label: "ESA 🇪🇺", match: ["ESA", "European Space Agency", "Arianespace"] },
  { id: "JAXA", label: "JAXA 🇯🇵", match: ["JAXA", "Japan Aerospace Exploration Agency"] },
];

export default function MissionArchivePage() {
  const [launches, setLaunches] = useState([]);
  const [upcomingForNav, setUpcomingForNav] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgencyKey, setSelectedAgencyKey] = useState("ALL");
  const [selectedOutcome, setSelectedOutcome] = useState("ALL"); // ALL | Success | Failure | Other
  const [sortBy, setSortBy] = useState("latest");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeModalLaunch, setActiveModalLaunch] = useState(null);

  const { favorites, count: favoritesCount } = useFavorites();

  // Fetch upcoming launch for navbar live badge
  useEffect(() => {
    fetch("/api/launches?type=upcoming&limit=5")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.launches) setUpcomingForNav(data.launches);
      })
      .catch(() => {});
  }, []);

  const nextLaunch = useMemo(() => {
    return selectNextUpcomingLaunch(upcomingForNav);
  }, [upcomingForNav]);

  // Fetch historical missions
  const fetchArchive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/launches?type=previous&limit=30");
      if (!res.ok) {
        throw new Error(`Archive server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setLaunches(data.launches || []);
    } catch (err) {
      console.error("[ARCHIVE FETCH ERROR]", err);
      setError(err.message || "Failed to load historical missions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchive();
  }, [fetchArchive]);

  // Filtered launches
  const filteredLaunches = useMemo(() => {
    return launches
      .filter((launch) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = launch.name?.toLowerCase().includes(q);
          const matchRocket = launch.rocket?.name?.toLowerCase().includes(q);
          const matchAgency = launch.agency?.name?.toLowerCase().includes(q);
          const matchPad = launch.pad?.name?.toLowerCase().includes(q);
          if (!matchName && !matchRocket && !matchAgency && !matchPad) {
            return false;
          }
        }

        // Agency filter
        if (selectedAgencyKey !== "ALL") {
          const agencyConfig = POPULAR_AGENCIES.find((a) => a.id === selectedAgencyKey);
          if (agencyConfig && agencyConfig.match) {
            const agencyName = launch.agency?.name || "";
            const matched = agencyConfig.match.some((m) =>
              agencyName.toLowerCase().includes(m.toLowerCase())
            );
            if (!matched) return false;
          } else if (launch.agency?.name !== selectedAgencyKey) {
            return false;
          }
        }

        // Outcome filter
        if (selectedOutcome !== "ALL") {
          const statusDesc = (launch.status?.name || "").toLowerCase();
          if (selectedOutcome === "Success" && !statusDesc.includes("success")) return false;
          if (selectedOutcome === "Failure" && !statusDesc.includes("failure")) return false;
        }

        // Favorites filter
        if (onlyFavorites && !favorites.includes(launch.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "latest") {
          const timeA = a.net ? new Date(a.net).getTime() : -Infinity;
          const timeB = b.net ? new Date(b.net).getTime() : -Infinity;
          return timeB - timeA;
        }
        if (sortBy === "earliest") {
          const timeA = a.net ? new Date(a.net).getTime() : Infinity;
          const timeB = b.net ? new Date(b.net).getTime() : Infinity;
          return timeA - timeB;
        }
        if (sortBy === "alphabetical") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      });
  }, [launches, searchQuery, selectedAgencyKey, selectedOutcome, onlyFavorites, favorites, sortBy]);

  const stats = useMemo(() => {
    let successCount = 0;
    let failureCount = 0;
    launches.forEach((l) => {
      const s = (l.status?.name || "").toLowerCase();
      if (s.includes("success")) successCount++;
      if (s.includes("failure")) failureCount++;
    });
    return {
      total: launches.length,
      successCount,
      failureCount,
      rate: launches.length ? Math.round((successCount / launches.length) * 100) : 0,
    };
  }, [launches]);

  return (
    <div className="min-h-screen bg-[#060812] text-[#F3F7FC] flex flex-col space-grid-bg">
      <Navbar nextLaunch={nextLaunch} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101C2D] border border-[#FFB45C]/35 text-xs text-[#FFB45C] font-mono">
              <History className="w-3.5 h-3.5 text-[#FFB45C]" />
              <span>AEROSPACE ARCHIVES • COMPLETED MISSIONS</span>
            </div>

            <button
              onClick={fetchArchive}
              disabled={loading}
              className="p-2 rounded-full bg-[#101C2D] border border-[rgba(180,210,235,0.15)] text-[#9AA9BD] hover:text-[#65F6FF] transition-all disabled:opacity-50"
              title="Refresh archive data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F3F7FC] mb-3">
            Mission <span className="bg-gradient-to-r from-[#FFB45C] via-[#F3F7FC] to-[#65F6FF] bg-clip-text text-transparent">Archive</span>
          </h1>
          <p className="text-sm sm:text-base text-[#9AA9BD] max-w-2xl font-light">
            Explore flight outcomes, trajectory archives, and elapsed mission durations from historical launches across all aerospace agencies worldwide.
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="glass-panel p-4 rounded-2xl border border-[rgba(101,246,255,0.18)]">
            <span className="text-[10px] font-mono text-[#9AA9BD] uppercase block mb-1">Archived Flights</span>
            <div className="text-2xl font-extrabold text-[#F3F7FC] font-mono">{stats.total}</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/25">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">Success Outcomes</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{stats.successCount}</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-rose-500/25">
            <span className="text-[10px] font-mono text-rose-400 uppercase block mb-1">Anomalies / Failures</span>
            <div className="text-2xl font-extrabold text-rose-400 font-mono">{stats.failureCount}</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-[#65F6FF]/25">
            <span className="text-[10px] font-mono text-[#65F6FF] uppercase block mb-1">Mission Assurance</span>
            <div className="text-2xl font-extrabold text-[#65F6FF] font-mono">{stats.rate}%</div>
          </div>
        </div>

        {/* Agency Quick Filter Pills */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {POPULAR_AGENCIES.map((agency) => {
            const isSelected = selectedAgencyKey === agency.id;
            return (
              <button
                key={agency.id}
                onClick={() => setSelectedAgencyKey(agency.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                  isSelected
                    ? "bg-[#FFB45C]/20 text-[#FFB45C] border-[#FFB45C]/50 shadow-[0_0_14px_rgba(255,180,92,0.25)] font-semibold"
                    : "bg-[#101C2D]/80 text-[#9AA9BD] border-[rgba(180,210,235,0.12)] hover:border-[#FFB45C]/30 hover:text-[#F3F7FC]"
                }`}
              >
                {agency.label}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8 border border-[rgba(101,246,255,0.18)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9AA9BD] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090F1B] border border-[rgba(101,246,255,0.18)] text-xs text-[#F3F7FC] placeholder-[#9AA9BD]/60 focus:outline-none focus:ring-2 focus:ring-[#FFB45C] transition-all"
              />
            </div>

            {/* Outcome */}
            <div className="relative">
              <select
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090F1B] border border-[rgba(101,246,255,0.18)] text-xs text-[#F3F7FC] focus:outline-none focus:ring-2 focus:ring-[#FFB45C] transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All Outcomes (Success & Anomalies)</option>
                <option value="Success">Success Flights Only</option>
                <option value="Failure">Anomalies / Failures Only</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090F1B] border border-[rgba(101,246,255,0.18)] text-xs text-[#F3F7FC] focus:outline-none focus:ring-2 focus:ring-[#FFB45C] transition-all appearance-none cursor-pointer"
              >
                <option value="latest">Sort: Most Recent Launch First</option>
                <option value="earliest">Sort: Oldest Launch First</option>
                <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Favorites */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                onlyFavorites
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400 font-semibold"
                  : "bg-[#090F1B] border-[rgba(101,246,255,0.18)] text-[#9AA9BD] hover:text-[#F3F7FC]"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>Bookmarked ({favoritesCount})</span>
            </button>
          </div>
        </div>

        {/* Grid or Status */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#101C2D] border border-[#FFB45C]/35 flex items-center justify-center animate-pulse">
              <History className="w-8 h-8 text-[#FFB45C]" />
            </div>
            <h3 className="text-xl font-bold text-[#F3F7FC] mb-2 font-mono">Retrieving Mission Archives</h3>
            <p className="text-sm text-[#9AA9BD]">Compiling historical telemetry records...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-8 rounded-3xl max-w-xl mx-auto text-center border border-rose-500/30">
            <h3 className="text-lg font-bold text-rose-400 mb-2">Archive Retrieval Error</h3>
            <p className="text-sm text-[#9AA9BD] mb-6">{error}</p>
            <button
              onClick={fetchArchive}
              className="px-6 py-2.5 rounded-xl bg-[#FFB45C] text-[#060812] font-bold text-xs"
            >
              Retry
            </button>
          </div>
        ) : filteredLaunches.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center max-w-xl mx-auto border border-[rgba(101,246,255,0.15)]">
            <Database className="w-12 h-12 text-[#9AA9BD]/40 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#F3F7FC] mb-2">No Archived Flights Match Query</h3>
            <p className="text-sm text-[#9AA9BD] mb-6">Try resetting search keywords or outcome filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLaunches.map((launch) => (
              <MissionCard
                key={launch.id}
                launch={launch}
                onSelectLaunch={setActiveModalLaunch}
                onAskAi={() => {
                  window.location.href = `/ai?missionId=${encodeURIComponent(launch.id)}&missionName=${encodeURIComponent(launch.name)}`;
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {activeModalLaunch && (
        <MissionDetailsModal
          launch={activeModalLaunch}
          onClose={() => setActiveModalLaunch(null)}
          onAskAi={() => {
            window.location.href = `/ai?missionId=${encodeURIComponent(activeModalLaunch.id)}&missionName=${encodeURIComponent(activeModalLaunch.name)}`;
          }}
        />
      )}

      <Footer />
    </div>
  );
}
