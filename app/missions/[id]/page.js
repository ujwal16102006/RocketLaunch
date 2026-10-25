"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar.js";
import { Footer } from "@/components/layout/Footer.js";
import { Badge } from "@/components/ui/Badge.js";
import {
  formatUtcDateTime,
  formatIstDateTime,
  getOrbitInfo,
  getGoogleCalendarUrl,
  getSpaceportMapUrl,
} from "@/utils/dateUtils.js";
import { getSingleLaunchImage } from "@/utils/rocketImageResolver.js";
import { useFavorites } from "@/hooks/useFavorites.js";
import {
  ArrowLeft,
  Rocket,
  MapPin,
  Calendar,
  Orbit,
  ExternalLink,
  Heart,
  Video,
  FileText,
  Sparkles,
  AlertTriangle,
  Globe,
  CalendarPlus,
  Map,
} from "lucide-react";

export default function MissionDossierPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [briefContent, setBriefContent] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState(null);

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    async function loadMission() {
      try {
        const res = await fetch(`/api/launches?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLaunch(data.launch);
      } catch (err) {
        setError(err.message || "Failed to load mission dossier.");
      } finally {
        setLoading(false);
      }
    }
    loadMission();
  }, [id]);

  const handleGenerateBrief = async () => {
    if (!launch) return;
    setBriefLoading(true);
    setBriefError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "brief", mission: launch }),
      });
      const data = await res.json();
      if (data.setupRequired) {
        setBriefError(data.message);
      } else if (!data.success) {
        setBriefError(data.error);
      } else {
        setBriefContent(data.content);
      }
    } catch (err) {
      setBriefError(err.message);
    } finally {
      setBriefLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070910] text-[#F3F7FC] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-mono text-[#65F6FF]">
          <Rocket className="w-5 h-5 animate-spin" />
          <span>INITIALIZING FLIGHT DOSSIER...</span>
        </div>
      </div>
    );
  }

  if (error || !launch) {
    return (
      <div className="min-h-screen bg-[#070910] text-[#F3F7FC] flex flex-col justify-between">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-36 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Flight Record Not Located</h1>
          <p className="text-sm text-[#9AA9BD] mb-8">{error || "Flight record does not exist on active manifest."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#101C2D] border border-[rgba(180,210,235,0.2)] text-sm font-semibold hover:border-[#65F6FF]/40 text-[#65F6FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Mission Dashboard</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const favorite = isFavorite(launch.id);
  const isGo = (launch.status?.abbrev || "").toLowerCase() === "go";
  const orbit = getOrbitInfo(launch.mission?.orbit);
  const calendarUrl = getGoogleCalendarUrl(launch);
  const mapUrl = getSpaceportMapUrl(launch.pad);

  return (
    <div className="min-h-screen bg-[#070910] text-[#F3F7FC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#9AA9BD] hover:text-[#65F6FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO TELEMETRY DASHBOARD</span>
          </Link>
        </div>

        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-[#65F6FF]/25 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(180,210,235,0.1)] pb-6 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan">STANDALONE DOSSIER</Badge>
              <Badge variant={isGo ? "success" : "amber"}>{launch.status?.name || "Scheduled"}</Badge>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFB45C]/15 border border-[#FFB45C]/35 text-[#FFB45C] font-semibold flex items-center gap-1">
                <Orbit className="w-3.5 h-3.5" />
                <span>{orbit.badge}</span>
              </span>
            </div>
            <button
              onClick={() => toggleFavorite(launch.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101C2D] border border-[rgba(180,210,235,0.2)] text-xs font-semibold hover:text-rose-400 transition-colors"
            >
              <Heart className={`w-4 h-4 ${favorite ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{favorite ? "Saved to Bookmarks" : "Save Flight"}</span>
            </button>
          </div>

          {/* Real Spaceflight Launch Photography Banner */}
          {(() => {
            const dossierImage = launch.distinctImage || launch.image || getSingleLaunchImage(launch);
            if (!dossierImage) return null;
            return (
              <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden mb-6 border border-[rgba(180,210,235,0.15)] bg-[#101C2D]">
                <img
                  src={dossierImage}
                  alt={launch.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090F1B] via-[#090F1B]/20 to-transparent opacity-85" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="text-xs font-mono tracking-wider px-3 py-1 rounded-full bg-[#070910]/80 border border-[#65F6FF]/30 text-[#65F6FF] flex items-center gap-1.5 shadow-md">
                    <Rocket className="w-3.5 h-3.5 text-[#65F6FF]" />
                    <span>{launch.rocket?.name || "Orbital Vehicle"}</span>
                  </span>
                </div>
              </div>
            );
          })()}

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F3F7FC] tracking-tight mb-2">
            {launch.name}
          </h1>
          <p className="text-sm sm:text-base text-[#65F6FF] font-mono mb-6">
            {launch.agency?.name} • {launch.agency?.countryCode || "Global Spaceflight"}
          </p>

          {/* Master Dual Timezone Strip: UTC & IST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 p-3.5 rounded-2xl bg-[#0D1424] border border-[rgba(101,246,255,0.2)]">
            <div className="p-3 rounded-xl bg-[#101C2D] font-mono text-xs space-y-1">
              <span className="text-[#65F6FF] flex items-center gap-1.5 font-bold">
                <Globe className="w-3.5 h-3.5" />
                <span>UTC Launch Time:</span>
              </span>
              <div className="text-sm text-[#F3F7FC] font-semibold pl-5" suppressHydrationWarning>
                {formatUtcDateTime(launch.net)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#101C2D] font-mono text-xs border border-[#FFB45C]/25 space-y-1">
              <span className="text-[#FFB45C] flex items-center gap-1.5 font-bold">
                <span>🇮🇳</span>
                <span>Indian Standard Time (IST):</span>
              </span>
              <div className="text-sm text-[#FFB45C] font-semibold pl-5" suppressHydrationWarning>
                {formatIstDateTime(launch.net)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
              <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">LAUNCH VEHICLE</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F3F7FC]">
                <Rocket className="w-4 h-4 text-[#65F6FF]" />
                <span>{launch.rocket?.name}</span>
              </div>
              {launch.rocket?.family && (
                <span className="text-xs text-[#9AA9BD] block mt-0.5">Family: {launch.rocket?.family}</span>
              )}
            </div>

            <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
              <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">TARGET ORBIT / DESTINATION</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FFB45C]">
                <Orbit className="w-4 h-4" />
                <span>{orbit.name} ({orbit.badge})</span>
              </div>
              <span className="text-xs text-[#65F6FF] block mt-0.5 font-mono">
                Altitude: {orbit.altitude}
              </span>
              <span className="text-[11px] text-[#9AA9BD] block mt-1 leading-normal">
                {orbit.desc}
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">SPACEPORT COMPLEX</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#F3F7FC]">
                  <MapPin className="w-4 h-4 text-[#FFB45C]" />
                  <span className="truncate">{launch.pad?.name}</span>
                </div>
                <span className="text-xs text-[#9AA9BD] block mt-0.5 truncate">{launch.pad?.locationName}</span>
              </div>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFB45C]/15 hover:bg-[#FFB45C]/25 border border-[#FFB45C]/35 text-[#FFB45C] text-xs font-semibold w-fit mt-3 transition-colors"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Open Spaceport Satellite Map</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </a>
              )}
            </div>

            <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">CALENDAR INTEGRATION</span>
                <span className="text-xs text-[#F3F7FC]">Synchronize ignition window</span>
              </div>
              {calendarUrl !== "#" && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#65F6FF]/15 hover:bg-[#65F6FF]/25 border border-[#65F6FF]/35 text-[#65F6FF] text-xs font-semibold w-fit mt-2 transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Add to Google Calendar</span>
                </a>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#9AA9BD] mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#65F6FF]" />
              Flight Objectives & Mission Description
            </h3>
            <p className="text-sm text-[#F3F7FC]/90 leading-relaxed bg-[#101C2D]/50 p-5 rounded-2xl border border-[rgba(180,210,235,0.08)]">
              {launch.mission?.description || "Primary payload delivery operation under active launch manifest."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#FFB45C]/30 mb-8 bg-[#101C2D]/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#FFB45C]">
                <Sparkles className="w-4 h-4" />
                <span>DeepSeek AI Flight Intelligence</span>
              </div>
              <button
                onClick={handleGenerateBrief}
                disabled={briefLoading}
                className="px-4 py-2 rounded-xl bg-[#FFB45C] text-[#070910] text-xs font-bold tracking-wider hover:bg-[#FFB45C]/90 transition-colors disabled:opacity-50"
              >
                {briefLoading ? "Analyzing Telemetry..." : briefContent ? "Regenerate Brief" : "Generate Brief"}
              </button>
            </div>
            {briefError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 mb-3">
                {briefError}
              </div>
            )}
            {briefContent && (
              <div className="prose prose-invert prose-xs text-xs text-[#F3F7FC] leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap bg-[#070910]/70 p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
                {briefContent}
              </div>
            )}
          </div>

          {/* Webcast & Coordinates */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[rgba(180,210,235,0.1)] text-xs">
            {launch.pad?.mapUrl && (
              <a
                href={launch.pad.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#65F6FF] hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                Spaceport Coordinates
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {launch.vidURLs?.length > 0 && (
              <a
                href={launch.vidURLs[0]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-rose-400 hover:underline"
              >
                <Video className="w-3.5 h-3.5" />
                Official Webcast
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
