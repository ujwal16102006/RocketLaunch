"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar.js";
import { Footer } from "@/components/layout/Footer.js";
import { MissionCard } from "@/components/missions/MissionCard.js";
import { MissionDetailsModal } from "@/components/missions/MissionDetailsModal.js";
import { selectNextUpcomingLaunch } from "@/utils/nextLaunchSelector.js";
import { resolveUniqueLaunchImages } from "@/utils/rocketImageResolver.js";
import { useFavorites } from "@/hooks/useFavorites.js";
import {
  Rocket,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  Heart,
  SlidersHorizontal,
  Compass,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";
import Link from "next/link";
import { useRouter } from "next/navigation";

const POPULAR_AGENCIES = [
  { id: "ALL", label: "All Agencies" },
  { id: "ISRO", label: "ISRO 🇮🇳", match: ["ISRO", "Indian Space Research Organisation"] },
  { id: "SpaceX", label: "SpaceX 🇺🇸", match: ["SpaceX"] },
  { id: "NASA", label: "NASA 🇺🇸", match: ["NASA", "National Aeronautics and Space Administration"] },
  { id: "Rocket Lab", label: "Rocket Lab 🇳🇿", match: ["Rocket Lab"] },
  { id: "ESA", label: "ESA 🇪🇺", match: ["ESA", "European Space Agency", "Arianespace"] },
  { id: "JAXA", label: "JAXA 🇯🇵", match: ["JAXA", "Japan Aerospace Exploration Agency"] },
];

export default function UpcomingLaunchesPage() {
  const router = useRouter();
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgencyKey, setSelectedAgencyKey] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("earliest");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeModalLaunch, setActiveModalLaunch] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Auto-refresh state (auto updates if spaceport changes launch time)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  const { favorites, count: favoritesCount } = useFavorites();

  const fetchLaunches = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/launches?type=upcoming&limit=30");
      if (!res.ok) {
        throw new Error(`Aerospace data server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setLaunches(data.launches || []);
      setLastRefreshed(new Date().toLocaleTimeString());
      setRefreshCountdown(30);
    } catch (err) {
      console.error("[UPCOMING LAUNCHES FETCH ERROR]", err);
      if (!isSilent) setError(err.message || "Failed to load upcoming launches.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaunches();
  }, [fetchLaunches]);

  // Real-time auto-refresh interval (every 30s)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchLaunches(true); // silent background fetch
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, fetchLaunches]);

  const nextLaunch = useMemo(() => {
    return selectNextUpcomingLaunch(launches);
  }, [launches]);

  // Extract distinct flight statuses
  const statuses = useMemo(() => {
    const set = new Set();
    launches.forEach((l) => {
      if (l.status?.name) set.add(l.status.name);
    });
    return Array.from(set).sort();
  }, [launches]);

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
          const matchLocation = launch.pad?.locationName?.toLowerCase().includes(q);
          if (!matchName && !matchRocket && !matchAgency && !matchPad && !matchLocation) {
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

        // Status filter
        if (selectedStatus !== "ALL" && launch.status?.name !== selectedStatus) {
          return false;
        }

        // Favorites filter
        if (onlyFavorites && !favorites.includes(launch.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "earliest") {
          const timeA = a.net ? new Date(a.net).getTime() : Infinity;
          const timeB = b.net ? new Date(b.net).getTime() : Infinity;
          return timeA - timeB;
        }
        if (sortBy === "latest") {
          const timeA = a.net ? new Date(a.net).getTime() : -Infinity;
          const timeB = b.net ? new Date(b.net).getTime() : -Infinity;
          return timeB - timeA;
        }
        if (sortBy === "alphabetical") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      });

    return resolveUniqueLaunchImages(result);
  }, [launches, searchQuery, selectedAgencyKey, selectedStatus, onlyFavorites, favorites, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAgencyKey("ALL");
    setSelectedStatus("ALL");
    setOnlyFavorites(false);
  };

  return (
    <div className="min-h-screen bg-[#060812] text-[#F3F7FC] flex flex-col space-grid-bg">
      <Navbar nextLaunch={nextLaunch} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101C2D] border border-[#65F6FF]/35 text-xs text-[#65F6FF] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65F6FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65F6FF]"></span>
              </span>
              <span>LIVE TELEMETRY STREAM • REAL-TIME COUNTDOWNS</span>
            </div>

            {/* Live Auto-Refresh Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all flex items-center gap-2 ${
                  autoRefreshEnabled
                    ? "bg-[#65F6FF]/15 border-[#65F6FF]/40 text-[#65F6FF]"
                    : "bg-[#101C2D] border-[rgba(180,210,235,0.15)] text-[#9AA9BD]"
                }`}
                title="Toggles automated 30s telemetry synchronization with Launch Library 2"
              >
                <Radio className={`w-3.5 h-3.5 ${autoRefreshEnabled ? "animate-pulse" : ""}`} />
                <span>Auto-Sync: {autoRefreshEnabled ? `${refreshCountdown}s` : "OFF"}</span>
              </button>

              <button
                onClick={() => fetchLaunches(false)}
                disabled={loading}
                className="p-2 rounded-full bg-[#101C2D] border border-[#65F6FF]/30 text-[#65F6FF] hover:bg-[#162438] hover:shadow-[0_0_12px_rgba(101,246,255,0.3)] transition-all disabled:opacity-50"
                title="Force refresh telemetry immediately"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F3F7FC] mb-3">
            Upcoming <span className="bg-gradient-to-r from-[#65F6FF] via-[#F3F7FC] to-[#FFB45C] bg-clip-text text-transparent">Orbital Launches</span>
          </h1>
          <p className="text-sm sm:text-base text-[#9AA9BD] max-w-2xl font-light">
            Every scheduled flight below features its own live ticking countdown timer (days, hours, minutes, seconds). Trajectory windows update in real time if spaceports adjust ignition schedules.
          </p>
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
                    ? "bg-[#65F6FF]/20 text-[#65F6FF] border-[#65F6FF]/50 shadow-[0_0_14px_rgba(101,246,255,0.25)] font-semibold"
                    : "bg-[#101C2D]/80 text-[#9AA9BD] border-[rgba(180,210,235,0.12)] hover:border-[#65F6FF]/30 hover:text-[#F3F7FC]"
                }`}
              >
                {agency.label}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8 border border-[rgba(101,246,255,0.18)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9AA9BD] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mission, rocket, pad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090F1B] border border-[rgba(101,246,255,0.18)] text-xs text-[#F3F7FC] placeholder-[#9AA9BD]/60 focus:outline-none focus:ring-2 focus:ring-[#65F6FF] transition-all"
              />
            </div>

            {/* Flight Status */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090F1B] border border-[rgba(101,246,255,0.18)] text-xs text-[#F3F7FC] focus:outline-none focus:ring-2 focus:ring-[#65F6FF] transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All Flight Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090F1B] border border-[rgba(101,246,255,0.18)] text-xs text-[#F3F7FC] focus:outline-none focus:ring-2 focus:ring-[#65F6FF] transition-all appearance-none cursor-pointer"
              >
                <option value="earliest">Sort: Earliest T-0 (Chronological)</option>
                <option value="latest">Sort: Latest Window</option>
                <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Favorites Toggle */}
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

          {/* Active filter count & Reset */}
          {(searchQuery || selectedAgencyKey !== "ALL" || selectedStatus !== "ALL" || onlyFavorites) && (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[rgba(180,210,235,0.1)] text-xs font-mono text-[#9AA9BD]">
              <span>Filtered {filteredLaunches.length} of {launches.length} manifest records</span>
              <button
                onClick={handleResetFilters}
                className="text-[#65F6FF] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Content State: Loading, Error, or Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#101C2D] border border-[#65F6FF]/35 flex items-center justify-center animate-pulse">
              <Rocket className="w-8 h-8 text-[#65F6FF]" />
            </div>
            <h3 className="text-xl font-bold text-[#F3F7FC] mb-2 font-mono">Synchronizing Orbital Manifests</h3>
            <p className="text-sm text-[#9AA9BD]">Connecting with spaceports and global launch operators...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-8 rounded-3xl max-w-xl mx-auto text-center border border-rose-500/30">
            <h3 className="text-lg font-bold text-rose-400 mb-2">Telemetry Uplink Failed</h3>
            <p className="text-sm text-[#9AA9BD] mb-6">{error}</p>
            <button
              onClick={() => fetchLaunches(false)}
              className="px-6 py-2.5 rounded-xl bg-[#65F6FF] text-[#060812] font-bold text-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredLaunches.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center max-w-xl mx-auto border border-[rgba(101,246,255,0.15)]">
            <Compass className="w-12 h-12 text-[#9AA9BD]/40 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#F3F7FC] mb-2">No Matching Flights Found</h3>
            <p className="text-sm text-[#9AA9BD] mb-6">
              Adjust your search keywords or agency filter to inspect other upcoming space missions.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-xl bg-[#101C2D] border border-[#65F6FF]/40 text-[#65F6FF] text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLaunches.map((launch) => (
              <MissionCard
                key={launch.id}
                launch={launch}
                onSelectLaunch={setActiveModalLaunch}
                onAskAi={(l) => {
                  const target = l || launch;
                  if (target?.id) {
                    router.push(`/ai?missionId=${encodeURIComponent(target.id)}&missionName=${encodeURIComponent(target.name || "")}`);
                  } else {
                    router.push("/ai");
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal Dialog for Deep Telemetry Dossier */}
      {activeModalLaunch && (
        <MissionDetailsModal
          launch={activeModalLaunch}
          onClose={() => setActiveModalLaunch(null)}
          onAskAi={(targetLaunch) => {
            const target = targetLaunch || activeModalLaunch;
            if (target?.id) {
              router.push(`/ai?missionId=${encodeURIComponent(target.id)}&missionName=${encodeURIComponent(target.name || "")}`);
            } else {
              router.push("/ai");
            }
          }}
        />
      )}

      <Footer />
    </div>
  );
}
