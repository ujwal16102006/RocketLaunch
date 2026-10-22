"use client";

import { Compass, RotateCcw } from "lucide-react";

export function EmptyState({
  title = "No Orbital Launches Found",
  message = "There are no launch operations matching the selected criteria.",
  onReset = null,
  className = "",
}) {
  return (
    <div
      className={`glass-panel rounded-2xl p-10 border border-[rgba(180,210,235,0.13)] text-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#65F6FF]/10 flex items-center justify-center text-[#65F6FF]">
        <Compass className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-[#F3F7FC] mb-2">{title}</h3>
      <p className="text-sm text-[#9AA9BD] mb-6 leading-relaxed">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#101C2D] hover:bg-[#162438] text-[#F3F7FC] border border-[rgba(180,210,235,0.2)] font-medium text-sm transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
