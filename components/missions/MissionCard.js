"use client";

import { useState, useEffect } from "react";
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
  Rocket,
  MapPin,
  Calendar,
  Heart,
  Info,
  Sparkles,
  Orbit,
  Clock,
  CalendarPlus,
  Video,
  Globe,
  Map,
  ExternalLink,
} from "lucide-react";

export function MissionCard({ launch, onSelectLaunch = null, onAskAi = null }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const targetImage = launch?.distinctImage || launch?.image || getSingleLaunchImage(launch);
  const [cardImage, setCardImage] = useState(targetImage);
  const [imageError, setImageError] = useState(false);
  const countdown = useCountdown(launch?.net);

  useEffect(() => {
    const nextImg = launch?.distinctImage || launch?.image || getSingleLaunchImage(launch);
    setCardImage(nextImg);
    setImageError(false);
  }, [launch?.distinctImage, launch?.image, launch?.id]);

  if (!launch) return null;

  const favorite = isFavorite(launch.id);
  const statusName = launch.status?.name || "Scheduled";
  const isGo = (launch.status?.abbrev || "").toLowerCase() === "go";
  const orbit = getOrbitInfo(launch.mission?.orbit);
  const calendarUrl = getGoogleCalendarUrl(launch);
  const mapUrl = getSpaceportMapUrl(launch.pad);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(180,210,235,0.13)] hover:border-[#65F6FF]/40 transition-all duration-300 flex flex-col justify-between group hover:shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
      {/* Top Banner / Image */}
      <div className="relative h-44 w-full bg-[#101C2D] overflow-hidden">
        {cardImage && !imageError ? (
          <img
            src={cardImage}
            alt={launch.name}
            onError={() => {
              const fallback = getSingleLaunchImage(launch);
              if (fallback && cardImage !== fallback) {
                setCardImage(fallback);
              } else {
                setImageError(true);
              }
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#101C2D] to-[#162438] p-4 text-center">
            <Rocket className="w-10 h-10 text-[#65F6FF]/40 mb-2 group-hover:text-[#65F6FF] transition-colors" />
            <span className="text-xs font-mono tracking-wider text-[#9AA9BD] uppercase">
              {launch.rocket?.name || "Orbital Vehicle"}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070910] via-transparent to-transparent opacity-85" />

        {/* Favorite Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(launch.id);
          }}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-3 right-3 p-2 rounded-full bg-[#070910]/75 backdrop-blur-md border border-[rgba(180,210,235,0.2)] text-[#F3F7FC] hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors z-10"
        >
          <Heart
            className={`w-4 h-4 ${favorite ? "fill-rose-500 text-rose-500" : "text-[#F3F7FC]"}`}
          />
        </button>

        {/* Status & Webcast Pills on Image */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
          <Badge variant={isGo ? "success" : "amber"}>{statusName}</Badge>
          {launch.vidURLs?.length > 0 && (
            <a
              href={launch.vidURLs[0]}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-semibold tracking-wide shadow-md transition-colors"
            >
              <Video className="w-3 h-3" />
              <span>Watch Live</span>
            </a>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Agency Name & Destination Orbit */}
          <div className="flex items-center justify-between text-xs text-[#9AA9BD] mb-2 font-mono gap-2">
            <span className="truncate max-w-[170px] font-semibold text-[#65F6FF]">
              {launch.agency?.name}
            </span>

            {/* Orbit Destination Chip */}
            <span
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${
                orbit.isPending
                  ? "bg-[#101C2D] border-[rgba(180,210,235,0.15)] text-[#9AA9BD]"
                  : "bg-[#FFB45C]/10 border-[#FFB45C]/35 text-[#FFB45C]"
              }`}
              title={`${orbit.name} (${orbit.altitude}): ${orbit.desc}`}
            >
              <Orbit className="w-3 h-3" />
              <span>{orbit.badge}</span>
            </span>
          </div>

          {/* Mission Title */}
          <h3 className="text-lg font-bold text-[#F3F7FC] tracking-tight mb-1.5 line-clamp-1 group-hover:text-[#65F6FF] transition-colors">
            {launch.name}
          </h3>

          {/* Launch Vehicle */}
          <p className="text-xs text-[#9AA9BD] mb-3 flex items-center gap-1.5 font-medium">
            <Rocket className="w-3.5 h-3.5 text-[#65F6FF]" />
            <span>{launch.rocket?.name}</span>
          </p>

          {/* Live Mission Ticker / Real-time Countdown */}
          <div className="mb-3.5 p-2.5 rounded-xl bg-[#090F1B] border border-[#65F6FF]/20 shadow-inner">
            <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-[#65F6FF] font-semibold">
                <span className={`w-1.5 h-1.5 rounded-full ${countdown.isPast ? "bg-[#FFB45C]" : "bg-[#65F6FF] animate-ping"}`} />
                {countdown.isPast ? "MISSION ELAPSED" : "T-MINUS COUNTDOWN"}
              </span>
              <span className="text-[10px] text-[#9AA9BD] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#65F6FF]" />
                LIVE
              </span>
            </div>

            {countdown.isPast ? (
              <div className="flex items-center justify-between font-mono text-xs text-[#FFB45C] font-semibold py-1 px-2 rounded bg-[#101C2D]">
                <span suppressHydrationWarning>{countdown.formatted || "T+ COMPLETED"}</span>
                <span className="text-[10px] text-[#9AA9BD]">CONCLUDED</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1 text-center font-mono">
                <div className="bg-[#101C2D] py-1 rounded border border-[rgba(101,246,255,0.15)]">
                  <div className="text-sm font-bold text-[#F3F7FC] tabular-nums" suppressHydrationWarning>{padZero(countdown.days)}</div>
                  <div className="text-[9px] text-[#9AA9BD] uppercase font-sans">Days</div>
                </div>
                <div className="bg-[#101C2D] py-1 rounded border border-[rgba(101,246,255,0.15)]">
                  <div className="text-sm font-bold text-[#F3F7FC] tabular-nums" suppressHydrationWarning>{padZero(countdown.hours)}</div>
                  <div className="text-[9px] text-[#9AA9BD] uppercase font-sans">Hrs</div>
                </div>
                <div className="bg-[#101C2D] py-1 rounded border border-[rgba(101,246,255,0.15)]">
                  <div className="text-sm font-bold text-[#65F6FF] tabular-nums" suppressHydrationWarning>{padZero(countdown.minutes)}</div>
                  <div className="text-[9px] text-[#9AA9BD] uppercase font-sans">Mins</div>
                </div>
                <div className="bg-[#101C2D] py-1 rounded border border-[#65F6FF]/35 shadow-[0_0_8px_rgba(101,246,255,0.25)]">
                  <div className="text-sm font-bold text-[#65F6FF] tabular-nums animate-pulse" suppressHydrationWarning>{padZero(countdown.seconds)}</div>
                  <div className="text-[9px] text-[#65F6FF] uppercase font-sans">Secs</div>
                </div>
              </div>
            )}
          </div>

          {/* Dual Timezone Module: UTC + IST (Indian Standard Time) */}
          <div className="mb-3.5 p-2.5 rounded-xl bg-[#0D1424] border border-[rgba(180,210,235,0.12)] space-y-1.5">
            {/* UTC Time */}
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#9AA9BD] flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#65F6FF]" />
                <span className="font-semibold text-[#65F6FF]">UTC</span>
              </span>
              <span className="text-[#F3F7FC] font-medium" suppressHydrationWarning>
                {formatUtcDateTime(launch.net)}
              </span>
            </div>

            {/* Indian Standard Time (IST) */}
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-[rgba(180,210,235,0.08)] pt-1.5">
              <span className="text-[#FFB45C] flex items-center gap-1.5 font-semibold">
                <span className="text-xs">🇮🇳</span>
                <span>IST</span>
              </span>
              <span className="text-[#FFB45C] font-semibold" suppressHydrationWarning>
                {formatIstDateTime(launch.net)}
              </span>
            </div>
          </div>

          {/* Spaceport Location & Direct Satellite Map Link */}
          <div className="flex items-center justify-between gap-2 pb-3 pt-0.5">
            <div className="flex items-center gap-1.5 truncate text-xs text-[#9AA9BD]/90 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#FFB45C] shrink-0" />
              <span className="truncate text-[11px]" title={`${launch.pad?.name}, ${launch.pad?.locationName}`}>
                {launch.pad?.name}, {launch.pad?.locationName}
              </span>
            </div>

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFB45C]/15 hover:bg-[#FFB45C]/25 border border-[#FFB45C]/35 text-[#FFB45C] text-[10px] font-mono font-semibold transition-colors"
                title={`Open Spaceport Map in Google Maps (${launch.pad?.name})`}
              >
                <Map className="w-2.5 h-2.5" />
                <span>Map</span>
                <ExternalLink className="w-2 h-2 opacity-75" />
              </a>
            )}
          </div>
        </div>

        {/* Card Actions Toolbar */}
        <div className="flex items-center gap-2 pt-2 border-t border-[rgba(180,210,235,0.08)]">
          {onSelectLaunch && (
            <button
              onClick={() => onSelectLaunch(launch)}
              className="flex-1 py-2 px-3 rounded-lg bg-[#101C2D] hover:bg-[#162438] text-[#F3F7FC] border border-[rgba(180,210,235,0.18)] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-[#65F6FF]" />
              <span>Dossier</span>
            </button>
          )}

          {onAskAi && (
            <button
              onClick={() => onAskAi(launch)}
              className="flex-1 py-2 px-3 rounded-lg bg-[#FFB45C]/15 hover:bg-[#FFB45C]/25 text-[#FFB45C] border border-[#FFB45C]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="View Mission Overview & AI Telemetry"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFB45C]" />
              <span>About Mission</span>
            </button>
          )}

          {/* Spaceport Map Action Button */}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg bg-[#101C2D] hover:bg-[#162438] text-[#9AA9BD] hover:text-[#FFB45C] border border-[rgba(180,210,235,0.15)] hover:border-[#FFB45C]/40 transition-colors flex items-center justify-center"
              title="Open Spaceport Satellite Map"
            >
              <MapPin className="w-4 h-4" />
            </a>
          )}

          {/* 1-Click Calendar Add */}
          {calendarUrl !== "#" && (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-[#101C2D] hover:bg-[#162438] text-[#9AA9BD] hover:text-[#65F6FF] border border-[rgba(180,210,235,0.15)] transition-colors flex items-center justify-center"
              title="Add to Google Calendar"
            >
              <CalendarPlus className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

