"use client";

import { padZero } from "@/utils/dateUtils.js";

export function CountdownDigits({
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  isPast = false,
  isImminent = false,
}) {
  const units = [
    { label: "DAYS", value: days },
    { label: "HOURS", value: hours },
    { label: "MINS", value: minutes },
    { label: "SECS", value: seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto">
      {units.map((u, i) => (
        <div
          key={i}
          className={`glass-panel rounded-2xl p-3 sm:p-5 text-center flex flex-col justify-center items-center border transition-all duration-300 ${
            isImminent
              ? "border-[#FFB45C]/50 shadow-[0_0_20px_rgba(255,180,92,0.2)]"
              : "border-[rgba(180,210,235,0.15)] hover:border-[#65F6FF]/40"
          }`}
        >
          <span
            className={`font-mono-numbers text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${
              isPast
                ? "text-[#9AA9BD]"
                : isImminent
                ? "text-[#FFB45C] amber-glow"
                : "text-[#65F6FF] cyan-glow"
            }`}
          >
            {padZero(u.value)}
          </span>
          <span className="text-[10px] sm:text-xs font-mono tracking-widest text-[#9AA9BD] mt-1 sm:mt-2">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
