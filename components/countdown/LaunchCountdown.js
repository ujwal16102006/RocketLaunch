"use client";

import { useCountdown } from "@/hooks/useCountdown.js";
import { CountdownDigits } from "./CountdownDigits.js";
import { formatUtcDateTime, formatIstDateTime, getOrbitInfo, getGoogleCalendarUrl, getSpaceportMapUrl } from "@/utils/dateUtils.js";
import { Rocket, MapPin, Calendar, Clock, Info, Sparkles, Globe, Orbit, CalendarPlus, Video, Map, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

export function LaunchCountdown({ launch, loading = false, onSelectLaunch = null, onAskAi = null }) {
  const countdown = useCountdown(launch?.net);

  if (loading) {
    return (
      <div className="glass-panel-elevated rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto border border-[#65F6FF]/20 relative overflow-hidden text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#101C2D] border border-[#65F6FF]/40 flex items-center justify-center text-[#65F6FF] animate-pulse">
          <Rocket className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#F3F7FC] mb-2 font-mono">Synchronizing Live Master Countdown</h3>
        <p className="text-sm text-[#9AA9BD] max-w-md mx-auto mb-8 font-light">
          Acquiring active orbital telemetry vectors from global spaceports...
        </p>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto opacity-50 animate-pulse">
          {["DAYS", "HOURS", "MINS", "SECS"].map((u, i) => (
            <div key={i} className="glass-panel rounded-2xl p-4 text-center border border-[rgba(101,246,255,0.15)]">
              <span className="font-mono text-3xl sm:text-5xl font-bold text-[#65F6FF]">--</span>
              <span className="text-[10px] block text-[#9AA9BD] mt-1 font-mono">{u}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto border border-[rgba(180,210,235,0.13)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#101C2D] border border-[rgba(180,210,235,0.15)] flex items-center justify-center text-[#9AA9BD]">
          <Rocket className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#F3F7FC] mb-2 font-mono">Connecting to Global Spaceports</h3>
        <p className="text-sm text-[#9AA9BD] max-w-md mx-auto">
          Synchronizing flight manifest data feeds. Launch windows will appear momentarily.
        </p>
      </div>
    );
  }

  const isGo = (launch.status?.abbrev || "").toLowerCase() === "go";
  const orbit = getOrbitInfo(launch.mission?.orbit);
  const calendarUrl = getGoogleCalendarUrl(launch);
  const mapUrl = getSpaceportMapUrl(launch.pad);

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto border border-[#65F6FF]/25 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
      {/* Background illumination accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-b from-[#65F6FF]/15 via-[#FFB45C]/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10">
        {/* Header telemetry tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan" className="gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#65F6FF] animate-ping" />
              T-MINUS MISSION COUNTDOWN
            </Badge>
            <Badge variant={isGo ? "success" : "amber"}>{launch.status?.name || "Scheduled"}</Badge>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                orbit.isPending
                  ? "bg-[#101C2D] border-[rgba(180,210,235,0.15)] text-[#9AA9BD]"
                  : "bg-[#FFB45C]/15 border-[#FFB45C]/40 text-[#FFB45C] font-semibold"
              }`}
              title={`${orbit.name} (${orbit.altitude}): ${orbit.desc}`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Target Orbit: {orbit.badge}</span>
            </span>
          </div>

          {launch.vidURLs?.length > 0 && (
            <a
              href={launch.vidURLs[0]}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Official Webcast</span>
            </a>
          )}
        </div>

        {/* Mission Title & Provider */}
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight mb-2">
            {launch.name}
          </h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-[#9AA9BD]">
            <span className="flex items-center gap-1.5 text-[#65F6FF] font-medium">
              <Rocket className="w-4 h-4" />
              {launch.rocket?.name}
            </span>
            <span>•</span>
            <span className="font-semibold text-[#F3F7FC]">{launch.agency?.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#FFB45C]" />
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

        {/* Status Message & Dual Timezone Bar (UTC & IST) */}
        <div className="text-center mb-8">
          <p
            suppressHydrationWarning
            className={`text-sm font-mono tracking-wide mb-4 ${
              countdown.isPast
                ? "text-[#FFB45C] font-semibold"
                : countdown.isImminent
                ? "text-[#FFB45C] animate-pulse"
                : "text-[#9AA9BD]"
            }`}
          >
            {countdown.statusMessage}
          </p>

          {/* Dual Timezone Badge Grid: UTC & IST */}
          <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#090F1B] border border-[#65F6FF]/25 shadow-inner">
            <div className="flex items-center justify-between sm:justify-center sm:gap-3 p-2 rounded-xl bg-[#101C2D] font-mono text-xs">
              <span className="text-[#65F6FF] flex items-center gap-1.5 font-bold">
                <Globe className="w-3.5 h-3.5" />
                <span>UTC Time:</span>
              </span>
              <span className="text-[#F3F7FC] font-medium" suppressHydrationWarning>
                {formatUtcDateTime(launch.net)}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-center sm:gap-3 p-2 rounded-xl bg-[#101C2D] font-mono text-xs border border-[#FFB45C]/25">
              <span className="text-[#FFB45C] flex items-center gap-1.5 font-bold">
                <span>🇮🇳</span>
                <span>India (IST):</span>
              </span>
              <span className="text-[#FFB45C] font-semibold" suppressHydrationWarning>
                {formatIstDateTime(launch.net)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[rgba(180,210,235,0.1)]">
          {onSelectLaunch && (
            <button
              onClick={() => onSelectLaunch(launch)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#101C2D] hover:bg-[#162438] text-[#F3F7FC] border border-[rgba(180,210,235,0.2)] text-xs font-semibold tracking-wider transition-all duration-200"
            >
              <Info className="w-4 h-4 text-[#65F6FF]" />
              <span>FULL MISSION DOSSIER</span>
            </button>
          )}

          {onAskAi && (
            <button
              onClick={() => onAskAi(launch)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFB45C] text-[#070910] hover:bg-[#FFB45C]/90 text-xs font-bold tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(255,180,92,0.3)]"
            >
              <Sparkles className="w-4 h-4 text-[#070910]" />
              <span>ABOUT MISSION & OVERVIEW</span>
            </button>
          )}

          {calendarUrl !== "#" && (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#101C2D] hover:bg-[#162438] text-[#65F6FF] border border-[#65F6FF]/35 text-xs font-semibold tracking-wider transition-all duration-200"
              title="Add this rocket launch to your Google Calendar"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>ADD TO CALENDAR</span>
            </a>
          )}

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#101C2D] hover:bg-[#162438] text-[#FFB45C] border border-[#FFB45C]/35 text-xs font-semibold tracking-wider transition-all duration-200"
              title={`View ${launch.pad?.name} on Spaceport Satellite Map`}
            >
              <MapPin className="w-4 h-4" />
              <span>SPACEPORT MAP</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

