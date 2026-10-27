"use client";

import { useEffect, useState } from "react";
import {
  formatUtcDateTime,
  formatIstDateTime,
  padZero,
  getOrbitInfo,
  getGoogleCalendarUrl,
  getSpaceportMapUrl,
} from "@/utils/dateUtils.js";
import { getSingleLaunchImage } from "@/utils/rocketImageResolver.js";
import { useCountdown } from "@/hooks/useCountdown.js";
import { useFavorites } from "@/hooks/useFavorites.js";
import { Badge } from "@/components/ui/Badge.js";
import {
  X,
  Rocket,
  MapPin,
  Calendar,
  Orbit,
  ExternalLink,
  Heart,
  Video,
  FileText,
  Sparkles,
  Clock,
  CalendarPlus,
  Globe,
  Share2,
  Check,
  Map,
} from "lucide-react";

export function MissionDetailsModal({ launch, onClose, onAskAi = null }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefContent, setBriefContent] = useState(null);
  const [briefError, setBriefError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const countdown = useCountdown(launch?.net);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!launch) return null;

  const favorite = isFavorite(launch.id);
  const isGo = (launch.status?.abbrev || "").toLowerCase() === "go";
  const orbit = getOrbitInfo(launch.mission?.orbit);
  const calendarUrl = getGoogleCalendarUrl(launch);
  const mapUrl = getSpaceportMapUrl(launch.pad);
  const modalImage = launch.distinctImage || launch.image || getSingleLaunchImage(launch);

  const handleGenerateBrief = async () => {
    setBriefLoading(true);
    setBriefError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "brief", mission: launch }),
      });
      const data = await res.json();
      if (data.content) {
        setBriefContent(data.content);
        setBriefError(null);
      } else if (data.setupRequired) {
        setBriefError(data.message);
      } else if (!data.success) {
        setBriefError(data.error || "Failed to generate AI mission briefing.");
      } else {
        setBriefContent(data.content);
      }
    } catch (err) {
      setBriefError(err.message);
    } finally {
      setBriefLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/missions/${encodeURIComponent(launch.id)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#070910]/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="glass-panel-elevated rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#65F6FF]/25 shadow-2xl relative p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-[rgba(180,210,235,0.1)] pb-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan">MISSION DOSSIER</Badge>
            <Badge variant={isGo ? "success" : "amber"}>{launch.status?.name || "Scheduled"}</Badge>
            <span className="text-[11px] font-mono text-[#FFB45C] px-2.5 py-0.5 rounded-full bg-[#FFB45C]/10 border border-[#FFB45C]/30 flex items-center gap-1">
              <Orbit className="w-3 h-3" />
              <span>{orbit.badge}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-[#101C2D] border border-[rgba(180,210,235,0.2)] text-[#9AA9BD] hover:text-[#65F6FF] transition-colors"
              title="Copy Mission Link"
              aria-label="Share mission"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => toggleFavorite(launch.id)}
              className="p-2 rounded-full bg-[#101C2D] border border-[rgba(180,210,235,0.2)] text-[#F3F7FC] hover:text-rose-400 transition-colors"
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-4 h-4 ${favorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#101C2D] border border-[rgba(180,210,235,0.2)] text-[#9AA9BD] hover:text-[#F3F7FC] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real Spaceflight Launch Photography Banner */}
        {modalImage && (
          <div className="relative h-44 sm:h-56 w-full rounded-2xl overflow-hidden mb-6 border border-[rgba(180,210,235,0.15)] bg-[#101C2D]">
            <img
              src={modalImage}
              alt={launch.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090F1B] via-[#090F1B]/20 to-transparent opacity-85" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-[#070910]/80 border border-[#65F6FF]/30 text-[#65F6FF] flex items-center gap-1.5 shadow-md">
                <Rocket className="w-3 h-3 text-[#65F6FF]" />
                <span>{launch.rocket?.name || "Orbital Vehicle"}</span>
              </span>
            </div>
          </div>
        )}

        {/* Mission Title & Provider */}
        <h2 id="modal-title" className="text-2xl sm:text-3xl font-extrabold text-[#F3F7FC] tracking-tight mb-1.5">
          {launch.name}
        </h2>
        <p className="text-sm text-[#65F6FF] font-mono mb-6">
          {launch.agency?.name} • {launch.agency?.countryCode || "Global Spaceflight"}
        </p>

        {/* Live Mission Countdown Telemetry */}
        <div className="mb-6 p-4 rounded-2xl bg-[#090F1B] border border-[#65F6FF]/25 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-xs font-mono font-semibold text-[#65F6FF]">
              <span className={`w-2 h-2 rounded-full ${countdown.isPast ? "bg-[#FFB45C]" : "bg-[#65F6FF] animate-ping"}`} />
              {countdown.isPast ? "MISSION FLIGHT ELAPSED" : "LIVE T-MINUS COUNTDOWN"}
            </span>
            <span className="text-xs font-mono text-[#9AA9BD] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#65F6FF]" />
              {countdown.isPast ? "COMPLETED" : "COUNTING DOWN (1s SYNC)"}
            </span>
          </div>

          {countdown.isPast ? (
            <div className="p-2.5 rounded-xl bg-[#101C2D] font-mono text-sm text-[#FFB45C] font-bold flex items-center justify-between">
              <span suppressHydrationWarning>{countdown.formatted || "T+ CONCLUDED"}</span>
              <span className="text-xs text-[#9AA9BD]">LAUNCH EXECUTED</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="bg-[#101C2D] py-2 rounded-xl border border-[rgba(101,246,255,0.15)]">
                <div className="text-xl sm:text-2xl font-extrabold text-[#F3F7FC] tabular-nums" suppressHydrationWarning>{padZero(countdown.days)}</div>
                <div className="text-[10px] text-[#9AA9BD] uppercase font-sans tracking-wider">Days</div>
              </div>
              <div className="bg-[#101C2D] py-2 rounded-xl border border-[rgba(101,246,255,0.15)]">
                <div className="text-xl sm:text-2xl font-extrabold text-[#F3F7FC] tabular-nums" suppressHydrationWarning>{padZero(countdown.hours)}</div>
                <div className="text-[10px] text-[#9AA9BD] uppercase font-sans tracking-wider">Hours</div>
              </div>
              <div className="bg-[#101C2D] py-2 rounded-xl border border-[rgba(101,246,255,0.15)]">
                <div className="text-xl sm:text-2xl font-extrabold text-[#65F6FF] tabular-nums" suppressHydrationWarning>{padZero(countdown.minutes)}</div>
                <div className="text-[10px] text-[#9AA9BD] uppercase font-sans tracking-wider">Minutes</div>
              </div>
              <div className="bg-[#101C2D] py-2 rounded-xl border border-[#65F6FF]/40 shadow-[0_0_12px_rgba(101,246,255,0.25)]">
                <div className="text-xl sm:text-2xl font-extrabold text-[#65F6FF] tabular-nums animate-pulse" suppressHydrationWarning>{padZero(countdown.seconds)}</div>
                <div className="text-[10px] text-[#65F6FF] uppercase font-sans tracking-wider font-semibold">Seconds</div>
              </div>
            </div>
          )}
        </div>

        {/* Dual Timezone Master Banner: UTC & IST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-3 rounded-2xl bg-[#0D1424] border border-[rgba(101,246,255,0.2)]">
          <div className="p-3 rounded-xl bg-[#101C2D] font-mono text-xs space-y-1">
            <span className="text-[#65F6FF] flex items-center gap-1.5 font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>Universal Coordinated Time (UTC):</span>
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

        {/* Flight Parameters Grid */}
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

          {/* Target Orbit Details with User-Friendly Explanation */}
          <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
            <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">TARGET ORBIT / DESTINATION</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#FFB45C]">
              <Orbit className="w-4 h-4" />
              <span>{orbit.name} ({orbit.badge})</span>
            </div>
            <span className="text-xs text-[#65F6FF] block mt-0.5 font-mono">
              Altitude Range: {orbit.altitude}
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
              <span className="text-xs text-[#9AA9BD] block mt-0.5 truncate">
                {launch.pad?.locationName}
              </span>
            </div>
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFB45C]/15 hover:bg-[#FFB45C]/25 border border-[#FFB45C]/35 text-[#FFB45C] text-xs font-semibold w-fit mt-3 transition-colors"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Open Satellite Map</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
            )}
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">CALENDAR SYNCHRONIZATION</span>
              <span className="text-xs text-[#F3F7FC]">Never miss ignition time</span>
            </div>
            {calendarUrl !== "#" && (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#65F6FF]/15 hover:bg-[#65F6FF]/25 border border-[#65F6FF]/35 text-[#65F6FF] text-xs font-semibold w-fit mt-2 transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Add to Google Calendar</span>
              </a>
            )}
          </div>
        </div>

        {/* Mission Description */}
        <div className="mb-8">
          <h4 className="text-xs font-mono tracking-widest uppercase text-[#9AA9BD] mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#65F6FF]" />
            Flight Profile & Payload Overview
          </h4>
          <p className="text-sm text-[#F3F7FC]/90 leading-relaxed bg-[#101C2D]/50 p-4 rounded-xl border border-[rgba(180,210,235,0.08)]">
            {launch.mission?.description ||
              "Primary mission payload parameters and flight objectives are confirmed under active launch operator manifest."}
          </p>
        </div>

        {/* About Mission & AI Flight Intelligence Section */}
        <div className="glass-panel p-5 rounded-2xl border border-[#FFB45C]/30 mb-8 bg-[#101C2D]/70">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#FFB45C]">
              <Sparkles className="w-4 h-4" />
              <span>About Mission & DeepSeek Flight Intelligence</span>
            </div>
            <button
              onClick={handleGenerateBrief}
              disabled={briefLoading}
              className="px-4 py-1.5 rounded-xl bg-[#FFB45C] hover:bg-[#FFB45C]/90 text-[#070910] text-xs font-bold tracking-wider transition-colors disabled:opacity-50 shadow-md"
            >
              {briefLoading ? "Analyzing Telemetry..." : briefContent ? "Regenerate Overview" : "Synthesize Mission Overview"}
            </button>
          </div>

          {briefError && (
            <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 mb-3">
              {briefError}
            </div>
          )}

          {briefContent && (
            <div className="prose prose-invert prose-xs text-xs text-[#F3F7FC] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap bg-[#070910]/70 p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
              {briefContent}
            </div>
          )}

          {!briefContent && !briefLoading && !briefError && (
            <p className="text-xs text-[#9AA9BD]">
              Click &quot;Synthesize Mission Overview&quot; to generate an executive aerospace summary grounded in verified telemetry data.
            </p>
          )}
        </div>

        {/* External Webcast & Pad Links Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[rgba(180,210,235,0.1)] text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {launch.pad?.mapUrl && (
              <a
                href={launch.pad.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#65F6FF] hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                Spaceport Map
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {launch.vidURLs?.length > 0 && (
              <a
                href={launch.vidURLs[0]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-rose-400 font-semibold hover:underline"
              >
                <Video className="w-3.5 h-3.5" />
                Official Webcast
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <button
            onClick={() => {
              if (onAskAi) onAskAi(launch);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#65F6FF] text-[#070910] font-bold text-xs hover:bg-[#65F6FF]/90 transition-colors shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open in AI Mission Intelligence
          </button>
        </div>
      </div>
    </div>
  );
}

