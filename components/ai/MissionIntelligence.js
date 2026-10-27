"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  HelpCircle,
  Scale,
  FileText,
  Key,
  Check,
  Copy,
  AlertCircle,
  Rocket,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

export function MissionIntelligence({ launches = [], initialMission = null }) {
  const [selectedMissionId, setSelectedMissionId] = useState(
    initialMission?.id || launches[0]?.id || ""
  );
  const [comparisonMissionId, setComparisonMissionId] = useState(
    launches[1]?.id || ""
  );

  useEffect(() => {
    if (!selectedMissionId && (initialMission?.id || launches[0]?.id)) {
      setSelectedMissionId(initialMission?.id || launches[0]?.id);
    }
    if (!comparisonMissionId && launches.length > 1) {
      setComparisonMissionId(launches[1]?.id);
    }
  }, [launches, initialMission, selectedMissionId, comparisonMissionId]);
  const [mode, setMode] = useState("brief"); // 'brief' | 'ask' | 'compare' | 'explain'
  const [userQuery, setUserQuery] = useState("");
  const [concept, setConcept] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedMission =
    launches.find((l) => l.id === selectedMissionId) || initialMission || launches[0];
  const comparisonMission = launches.find((l) => l.id === comparisonMissionId);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSetupRequired(false);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          mission: selectedMission,
          comparisonMission: mode === "compare" ? comparisonMission : null,
          userQuery,
          concept,
        }),
      });

      const data = await res.json();

      if (data.content) {
        setResult(data.content);
        setError(null);
        if (data.setupRequired) {
          setSetupRequired(true);
        }
      } else if (data.setupRequired) {
        setSetupRequired(true);
        setError(data.message);
      } else if (!data.success) {
        setError(data.error || "Failed to process AI mission intelligence.");
      } else {
        setResult(data.content);
      }
    } catch (err) {
      setError(err.message || "Network error contacting AI service.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB45C]/10 border border-[#FFB45C]/30 text-xs font-mono text-[#FFB45C] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DEEPSEEK AEROSPACE REASONING ENGINE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F3F7FC] tracking-tight mb-4">
          Mission Intelligence & Telemetry Analysis
        </h2>
        <p className="text-sm sm:text-base text-[#9AA9BD] leading-relaxed">
          Synthesize executive mission briefs, query technical parameters, compare vehicle capabilities, and explore aerospace concepts grounded strictly in verified flight data.
        </p>
      </div>

      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-[#FFB45C]/25 max-w-5xl mx-auto">
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 bg-[#070910] p-1.5 rounded-2xl border border-[rgba(180,210,235,0.1)]">
          <button
            onClick={() => {
              setMode("brief");
              setResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 ${
              mode === "brief"
                ? "bg-[#FFB45C] text-[#070910] shadow-[0_0_15px_rgba(255,180,92,0.3)]"
                : "text-[#9AA9BD] hover:text-[#F3F7FC]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>MISSION BRIEF</span>
          </button>
          <button
            onClick={() => {
              setMode("ask");
              setResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 ${
              mode === "ask"
                ? "bg-[#FFB45C] text-[#070910] shadow-[0_0_15px_rgba(255,180,92,0.3)]"
                : "text-[#9AA9BD] hover:text-[#F3F7FC]"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>ASK AI</span>
          </button>
          <button
            onClick={() => {
              setMode("compare");
              setResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 ${
              mode === "compare"
                ? "bg-[#FFB45C] text-[#070910] shadow-[0_0_15px_rgba(255,180,92,0.3)]"
                : "text-[#9AA9BD] hover:text-[#F3F7FC]"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>COMPARE FLIGHTS</span>
          </button>
          <button
            onClick={() => {
              setMode("explain");
              setResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 ${
              mode === "explain"
                ? "bg-[#FFB45C] text-[#070910] shadow-[0_0_15px_rgba(255,180,92,0.3)]"
                : "text-[#9AA9BD] hover:text-[#F3F7FC]"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>EXPLAIN CONCEPT</span>
          </button>
        </div>

        {/* Input Form based on mode */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          {mode !== "explain" && (
            <div>
              <label className="block text-xs font-mono uppercase text-[#9AA9BD] mb-2">
                Primary Flight Profile:
              </label>
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-[#070910] border border-[rgba(180,210,235,0.18)] text-sm text-[#F3F7FC] focus:outline-none focus:border-[#FFB45C]"
              >
                {launches.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.agency?.name} ({l.rocket?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "compare" && (
            <div>
              <label className="block text-xs font-mono uppercase text-[#9AA9BD] mb-2">
                Comparison Flight Profile:
              </label>
              <select
                value={comparisonMissionId}
                onChange={(e) => setComparisonMissionId(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-[#070910] border border-[rgba(180,210,235,0.18)] text-sm text-[#F3F7FC] focus:outline-none focus:border-[#FFB45C]"
              >
                {launches.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.agency?.name} ({l.rocket?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "ask" && (
            <div>
              <label className="block text-xs font-mono uppercase text-[#9AA9BD] mb-2">
                Your Technical Question:
              </label>
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="e.g., What is the primary payload and target orbit for this mission?"
                required
                className="w-full py-3 px-4 rounded-xl bg-[#070910] border border-[rgba(180,210,235,0.18)] text-sm text-[#F3F7FC] placeholder-[#9AA9BD]/40 focus:outline-none focus:border-[#FFB45C]"
              />
            </div>
          )}

          {mode === "explain" && (
            <div>
              <label className="block text-xs font-mono uppercase text-[#9AA9BD] mb-2">
                Aerospace Concept or Term to Explain:
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., Max-Q, Hohmann Transfer, Specific Impulse, Geostationary Transfer Orbit..."
                required
                className="w-full py-3 px-4 rounded-xl bg-[#070910] border border-[rgba(180,210,235,0.18)] text-sm text-[#F3F7FC] placeholder-[#9AA9BD]/40 focus:outline-none focus:border-[#FFB45C]"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-[#FFB45C] text-[#070910] font-bold text-sm tracking-wide hover:bg-[#FFB45C]/90 transition-all duration-200 flex items-center gap-2 shadow-[0_0_20px_rgba(255,180,92,0.3)] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Analyzing Telemetry..." : "Run AI Intelligence"}</span>
            </button>
          </div>
        </form>

        {/* Configuration Setup Warning if API key missing */}
        {setupRequired && (
          <div className="p-6 rounded-2xl bg-[#101C2D] border border-[#FFB45C]/40 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFB45C]/10 flex items-center justify-center text-[#FFB45C] flex-shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-2 text-xs">
                <h4 className="text-sm font-bold text-[#F3F7FC]">DeepSeek API Key Required</h4>
                <p className="text-[#9AA9BD] leading-relaxed">
                  Real AI mission intelligence requires a valid DeepSeek API key. Configure it securely in your local environment file:
                </p>
                <div className="p-3 bg-[#070910] rounded-lg font-mono text-[11px] text-[#65F6FF] border border-[rgba(180,210,235,0.1)]">
                  # In .env.local<br />
                  DEEPSEEK_API_KEY=your_actual_key_here<br />
                  DEEPSEEK_MODEL=deepseek-chat
                </div>
                <p className="text-[11px] text-[#9AA9BD]/70">
                  Keys remain strictly server-side and are never exposed to browser client code.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && !setupRequired && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Output Display */}
        {result && (
          <div className="rounded-2xl bg-[#070910] p-6 sm:p-8 border border-[rgba(180,210,235,0.15)] relative">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(180,210,235,0.08)] mb-6">
              <div className="flex items-center gap-2">
                <Badge variant="amber">TELEMETRY ANALYSIS SYNTHESIS</Badge>
                <span className="text-[11px] font-mono text-[#9AA9BD]">
                  DeepSeek Verified Output
                </span>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101C2D] border border-[rgba(180,210,235,0.15)] text-xs text-[#9AA9BD] hover:text-[#F3F7FC] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="text-sm text-[#F3F7FC] leading-relaxed whitespace-pre-wrap font-sans space-y-4">
              {result}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
