"use client";

import { useState } from "react";
import { formatUtcDateTime, padZero } from "@/utils/dateUtils.js";
import { useCountdown } from "@/hooks/useCountdown.js";
import { useFavorites } from "@/hooks/useFavorites.js";
import { Badge } from "@/components/ui/Badge.js";
import { Rocket, MapPin, Calendar, Heart, Info, Sparkles, Orbit, Clock } from "lucide-react";

export function MissionCard({ launch, onSelectLaunch = null, onAskAi = null }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);
  const countdown = useCountdown(launch?.net);

  if (!launch) return null;

  const favorite = isFavorite(launch.id);
  const statusName = launch.status?.name || "Scheduled";
  const isGo = (launch.status?.abbrev || "").toLowerCase() === "go";

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(180,210,235,0.13)] hover:border-[#65F6FF]/40 transition-all duration-300 flex flex-col justify-between group hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
      {/* Top Banner or Image */}
      <div className="relative h-44 w-full bg-[#101C2D] overflow-hidden">
        {launch.image && !imageError ? (
          <img
            src={launch.image}
            alt={launch.name}
            onError={() => setImageError(true)}
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

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070910] via-transparent to-transparent opacity-80" />

        {/* Favorite Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(launch.id);
          }}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-3 right-3 p-2 rounded-full bg-[#070910]/70 backdrop-blur-md border border-[rgba(180,210,235,0.2)] text-[#F3F7FC] hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${favorite ? "fill-rose-500 text-rose-500" : "text-[#F3F7FC]"}`}
          />
        </button>

        {/* Status Pill on Image */}
        <div className="absolute bottom-3 left-3">
          <Badge variant={isGo ? "success" : "amber"}>{statusName}</Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Agency & Target Orbit */}
          <div className="flex items-center justify-between text-xs text-[#9AA9BD] mb-2 font-mono">
            <span className="truncate max-w-[160px] font-semibold text-[#65F6FF]">
              {launch.agency?.name}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Orbit className="w-3 h-3 text-[#FFB45C]" />
              {launch.mission?.orbit?.abbrev || "LEO"}
            </span>
          </div>

          {/* Mission Title */}
          <h3 className="text-lg font-bold text-[#F3F7FC] tracking-tight mb-2 line-clamp-1 group-hover:text-[#65F6FF] transition-colors">
            {launch.name}
          </h3>

          {/* Launch Vehicle */}
          <p className="text-xs text-[#9AA9BD] mb-3 flex items-center gap-1.5 font-medium">
            <Rocket className="w-3.5 h-3.5 text-[#65F6FF]" />
            <span>{launch.rocket?.name}</span>
          </p>

          {/* Live Mission Ticker / Real-time Countdown for Every Launch */}
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

          {/* Spaceport & Date */}
          <div className="space-y-1.5 text-xs text-[#9AA9BD]/80 border-t border-[rgba(180,210,235,0.08)] pt-2.5 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#9AA9BD]" />
              <span className="font-mono text-[11px]">{formatUtcDateTime(launch.net)}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#9AA9BD] flex-shrink-0" />
              <span className="truncate text-[11px]">{launch.pad?.name}, {launch.pad?.locationName}</span>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="flex items-center gap-2 pt-2">
          {onSelectLaunch && (
            <button
              onClick={() => onSelectLaunch(launch)}
              className="flex-1 py-2 px-3 rounded-lg bg-[#101C2D] hover:bg-[#162438] text-[#F3F7FC] border border-[rgba(180,210,235,0.15)] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-[#65F6FF]" />
              <span>Dossier</span>
            </button>
          )}
          {onAskAi && (
            <button
              onClick={() => onAskAi(launch)}
              className="py-2 px-3 rounded-lg bg-[#101C2D] hover:bg-[#162438] text-[#FFB45C] border border-[#FFB45C]/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              title="Generate AI Flight Briefing"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Brief</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
