"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "Telemetry Feed Unavailable",
  message = "Failed to synchronize flight data from the aerospace network.",
  onRetry = null,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={`glass-panel rounded-2xl p-8 border border-rose-500/30 text-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-[#F3F7FC] mb-2">{title}</h3>
      <p className="text-sm text-[#9AA9BD] mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#101C2D] hover:bg-[#162438] text-[#65F6FF] border border-[#65F6FF]/30 font-medium text-sm transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      )}
    </div>
  );
}
