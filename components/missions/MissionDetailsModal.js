"use client";

import { useEffect, useState } from "react";
import { formatUtcDateTime, formatLocalDateTime } from "@/utils/dateUtils.js";
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
  Shield,
} from "lucide-react";

export function MissionDetailsModal({ launch, onClose, onAskAi = null }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefContent, setBriefContent] = useState(null);
  const [briefError, setBriefError] = useState(null);

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
      if (data.setupRequired) {
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
          <div className="flex items-center gap-2">
            <Badge variant="cyan">MISSION DOSSIER</Badge>
            <Badge variant={isGo ? "success" : "amber"}>{launch.status?.name || "Scheduled"}</Badge>
          </div>
          <div className="flex items-center gap-3">
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

        {/* Mission Title */}
        <h2 id="modal-title" className="text-2xl sm:text-3xl font-extrabold text-[#F3F7FC] tracking-tight mb-2">
          {launch.name}
        </h2>
        <p className="text-sm text-[#65F6FF] font-mono mb-6">
          {launch.agency?.name} • {launch.agency?.countryCode}
        </p>

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

          <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
            <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">TARGET ORBIT</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F3F7FC]">
              <Orbit className="w-4 h-4 text-[#FFB45C]" />
              <span>{launch.mission?.orbit?.name || "Low Earth Orbit"}</span>
            </div>
            <span className="text-xs text-[#9AA9BD] block mt-0.5">
              Class: {launch.mission?.orbit?.abbrev || "LEO"}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
            <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">SCHEDULED T-0</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F3F7FC]">
              <Calendar className="w-4 h-4 text-[#65F6FF]" />
              <span className="font-mono text-xs">{formatUtcDateTime(launch.net)}</span>
            </div>
            <span className="text-xs text-[#9AA9BD] block mt-0.5 font-mono">
              Local: {formatLocalDateTime(launch.net)}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
            <span className="text-[11px] font-mono text-[#9AA9BD] block mb-1">LAUNCH COMPLEX</span>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F3F7FC]">
              <MapPin className="w-4 h-4 text-[#FFB45C]" />
              <span className="truncate">{launch.pad?.name}</span>
            </div>
            <span className="text-xs text-[#9AA9BD] block mt-0.5 truncate">
              {launch.pad?.locationName}
            </span>
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

        {/* AI Mission Briefing Section */}
        <div className="glass-panel p-5 rounded-2xl border border-[#FFB45C]/30 mb-8 bg-[#101C2D]/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#FFB45C]">
              <Sparkles className="w-4 h-4" />
              <span>DeepSeek AI Flight Intelligence</span>
            </div>
            <button
              onClick={handleGenerateBrief}
              disabled={briefLoading}
              className="px-3.5 py-1.5 rounded-lg bg-[#FFB45C]/15 hover:bg-[#FFB45C]/25 text-[#FFB45C] border border-[#FFB45C]/30 text-xs font-semibold tracking-wider transition-colors disabled:opacity-50"
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
            <div className="prose prose-invert prose-xs text-xs text-[#F3F7FC] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap bg-[#070910]/70 p-4 rounded-xl border border-[rgba(180,210,235,0.1)]">
              {briefContent}
            </div>
          )}

          {!briefContent && !briefLoading && !briefError && (
            <p className="text-xs text-[#9AA9BD]">
              Click &quot;Generate Brief&quot; to synthesize an executive AI summary grounded strictly in verified telemetry facts.
            </p>
          )}
        </div>

        {/* External Webcast & Pad Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[rgba(180,210,235,0.1)] text-xs">
          <div className="flex items-center gap-3">
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

          <button
            onClick={() => {
              onClose();
              if (onAskAi) onAskAi(launch);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#65F6FF] text-[#070910] font-bold text-xs hover:bg-[#65F6FF]/90 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open in AI Mission Intelligence
          </button>
        </div>
      </div>
    </div>
  );
}
