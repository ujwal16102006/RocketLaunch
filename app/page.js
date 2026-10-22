"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar.js";
import { Footer } from "@/components/layout/Footer.js";
import { CinematicHero } from "@/components/hero/CinematicHero.js";
import { LaunchCountdown } from "@/components/countdown/LaunchCountdown.js";
import { MissionFilters } from "@/components/missions/MissionFilters.js";
import { MissionGrid } from "@/components/missions/MissionGrid.js";
import { MissionDetailsModal } from "@/components/missions/MissionDetailsModal.js";
import { MissionIntelligence } from "@/components/ai/MissionIntelligence.js";
import { selectNextUpcomingLaunch } from "@/utils/nextLaunchSelector.js";
import { useFavorites } from "@/hooks/useFavorites.js";
import { Compass, RefreshCw, Radio } from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'historical'
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("earliest");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeModalLaunch, setActiveModalLaunch] = useState(null);
  const [aiFocusMission, setAiFocusMission] = useState(null);
  const [dataSource, setDataSource] = useState("live");
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const { favorites, count: favoritesCount } = useFavorites();

  // Fetch launches from API proxy
  const fetchLaunches = useCallback(async (feedType) => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = feedType === "historical" ? "previous" : "upcoming";
      const res = await fetch(`/api/launches?type=${typeParam}&limit=24`);
      if (!res.ok) {
        throw new Error(`Aerospace data server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setLaunches(data.launches || []);
      setDataSource(data.source || "live");
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("[TELEMETRY FETCH ERROR]", err);
      setError(err.message || "Failed to load flight manifests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaunches(activeTab);
  }, [activeTab, fetchLaunches]);

  // Determine next upcoming launch for countdown
  const nextLaunch = useMemo(() => {
    return selectNextUpcomingLaunch(launches);
  }, [launches]);

  // Extract distinct agencies for dynamic dropdown
  const agencies = useMemo(() => {
    const set = new Set();
    launches.forEach((l) => {
      if (l.agency?.name) set.add(l.agency.name);
    });
    return Array.from(set).sort();
  }, [launches]);

  // Extract distinct flight statuses for dynamic dropdown
  const statuses = useMemo(() => {
    const set = new Set();
    launches.forEach((l) => {
      if (l.status?.name) set.add(l.status.name);
    });
    return Array.from(set).sort();
  }, [launches]);

  // Filtered & sorted missions
  const filteredLaunches = useMemo(() => {
    return launches
      .filter((launch) => {
        // Search term filter
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
        if (selectedAgency !== "ALL" && launch.agency?.name !== selectedAgency) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "ALL" && launch.status?.name !== selectedStatus) {
          return false;
        }

        // Favorites only toggle
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
  }, [launches, searchQuery, selectedAgency, selectedStatus, onlyFavorites, favorites, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAgency("ALL");
    setSelectedStatus("ALL");
    setOnlyFavorites(false);
  };

  const handleAskAiForLaunch = (launch) => {
    setAiFocusMission(launch);
    const aiSection = document.getElementById("ai");
    if (aiSection) {
      aiSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Navbar nextLaunch={nextLaunch} />

      <main id="main-content" className="flex-1">
        {/* 1. Cinematic Hero with Scroll Animation */}
        <CinematicHero />

        {/* 2. Next Upcoming Mission Countdown */}
        <section id="upcoming" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#65F6FF]/10 border border-[#65F6FF]/30 text-xs font-mono text-[#65F6FF] mb-4">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE ORBITAL TELEMETRY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F3F7FC] tracking-tight mb-4">
              Next Upcoming Spaceflight
            </h2>
            <p className="text-sm sm:text-base text-[#9AA9BD] leading-relaxed">
              Synchronized T-0 ignition countdown tracking the earliest confirmed orbital launch operation worldwide.
            </p>
          </div>

          <LaunchCountdown
            launch={nextLaunch}
            onSelectLaunch={(l) => setActiveModalLaunch(l)}
            onAskAi={handleAskAiForLaunch}
          />
        </section>

        {/* 3. Mission Discovery & Historical Archive */}
        <section id="archive" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101C2D] border border-[rgba(180,210,235,0.15)] text-xs font-mono text-[#9AA9BD] mb-3">
                <Compass className="w-3.5 h-3.5 text-[#65F6FF]" />
                <span>GLOBAL FLIGHT MANIFEST</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
                {activeTab === "upcoming" ? "Upcoming Launch Schedule" : "Historical Launch Archive"}
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-[#9AA9BD]">
              {lastRefreshed && <span>Updated: {lastRefreshed}</span>}
              <button
                onClick={() => fetchLaunches(activeTab)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101C2D] border border-[rgba(180,210,235,0.15)] hover:border-[#65F6FF]/40 text-[#F3F7FC] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <MissionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedAgency={selectedAgency}
            onAgencyChange={setSelectedAgency}
            agencies={agencies}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            statuses={statuses}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onlyFavorites={onlyFavorites}
            onToggleFavorites={() => setOnlyFavorites(!onlyFavorites)}
            favoritesCount={favoritesCount}
          />

          {/* Mission Grid Display */}
          <MissionGrid
            launches={filteredLaunches}
            loading={loading}
            error={error}
            onRetry={() => fetchLaunches(activeTab)}
            onResetFilters={handleResetFilters}
            onSelectLaunch={(l) => setActiveModalLaunch(l)}
            onAskAi={handleAskAiForLaunch}
          />
        </section>

        {/* 4. DeepSeek AI Mission Intelligence */}
        <MissionIntelligence
          launches={launches}
          initialMission={aiFocusMission || nextLaunch || launches[0]}
        />
      </main>

      {/* Flight Dossier Modal */}
      {activeModalLaunch && (
        <MissionDetailsModal
          launch={activeModalLaunch}
          onClose={() => setActiveModalLaunch(null)}
          onAskAi={handleAskAiForLaunch}
        />
      )}

      <Footer />
    </>
  );
}
