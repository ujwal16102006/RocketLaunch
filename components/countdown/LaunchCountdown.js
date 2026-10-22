"use client";

import { useCountdown } from "@/hooks/useCountdown.js";
import { CountdownDigits } from "./CountdownDigits.js";
import { formatUtcDateTime, formatLocalDateTime } from "@/utils/dateUtils.js";
import { Rocket, MapPin, Calendar, Clock, Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

export function LaunchCountdown({ launch, onSelectLaunch = null, onAskAi = null }) {
  const countdown = useCountdown(launch?.net);

  if (!launch) {
    return (
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto border border-[rgba(180,210,235,0.13)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#101C2D] border border-[rgba(180,210,235,0.15)] flex items-center justify-center text-[#9AA9BD]">
          <Rocket className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#F3F7FC] mb-2">No Upcoming Flight Detected</h3>
        <p className="text-sm text-[#9AA9BD] max-w-md mx-auto">
          Currently evaluating flight manifests from global launch operators. Check back shortly for updated launch windows.
        </p>
      </div>
    );
  }

  const isGo = (launch.status?.abbrev || "").toLowerCase() === "go";

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto border border-[#65F6FF]/20 relative overflow-hidden">
      {/* Background illumination accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-[#65F6FF]/10 via-[#FFB45C]/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10">
        {/* Header telemetry tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#65F6FF] animate-ping" />
              T-MINUS MISSION COUNTDOWN
            </Badge>
            <Badge variant={isGo ? "success" : "amber"}>{launch.status?.name || "Scheduled"}</Badge>
          </div>
          <span className="text-xs font-mono text-[#9AA9BD]">
            NET: {formatUtcDateTime(launch.net)}
          </span>
        </div>

        {/* Mission Title & Provider */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight mb-2">
            {launch.name}
          </h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-[#9AA9BD]">
            <span className="flex items-center gap-1.5 text-[#65F6FF] font-medium">
              <Rocket className="w-4 h-4" />
              {launch.rocket?.name}
            </span>
            <span>•</span>
            <span>{launch.agency?.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              {launch.pad?.name}, {launch.pad?.locationName}
            </span>
          </div>
        </div>

        {/* Countdown Digits Engine */}
        <div className="my-8">
          <CountdownDigits
            days={countdown.days}
            hours={countdown.hours}
            minutes={countdown.minutes}
            seconds={countdown.seconds}
            isPast={countdown.isPast}
            isImminent={countdown.isImminent}
          />
        </div>

        {/* Status Message */}
        <div className="text-center mb-8">
          <p
            className={`text-sm font-mono tracking-wide ${
              countdown.isPast
                ? "text-[#FFB45C] font-semibold"
                : countdown.isImminent
                ? "text-[#FFB45C] animate-pulse"
                : "text-[#9AA9BD]"
            }`}
          >
            {countdown.statusMessage}
          </p>
          <p className="text-xs text-[#9AA9BD]/70 mt-1 font-mono">
            Local Window: {formatLocalDateTime(launch.net)}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-[rgba(180,210,235,0.1)]">
          {onSelectLaunch && (
            <button
              onClick={() => onSelectLaunch(launch)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#101C2D] hover:bg-[#162438] text-[#F3F7FC] border border-[rgba(180,210,235,0.2)] text-xs font-semibold tracking-wider transition-all duration-200"
            >
              <Info className="w-4 h-4 text-[#65F6FF]" />
              VIEW MISSION DOSSIER
            </button>
          )}
          {onAskAi && (
            <button
              onClick={() => onAskAi(launch)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#101C2D] hover:bg-[#162438] text-[#FFB45C] border border-[#FFB45C]/30 text-xs font-semibold tracking-wider transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-[#FFB45C]" />
              AI FLIGHT BRIEFING
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
