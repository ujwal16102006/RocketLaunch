"use client";

export function LoadingSkeleton({ count = 3, className = "" }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel rounded-2xl p-6 border border-[rgba(180,210,235,0.13)] animate-pulse flex flex-col justify-between h-[360px]"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="h-5 w-24 bg-[#1b2b42] rounded-full"></div>
              <div className="h-5 w-16 bg-[#1b2b42] rounded-full"></div>
            </div>
            <div className="h-7 w-3/4 bg-[#1b2b42] rounded-md mb-3"></div>
            <div className="h-4 w-1/2 bg-[#1b2b42] rounded-md mb-6"></div>
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full bg-[#162438] rounded"></div>
              <div className="h-3 w-5/6 bg-[#162438] rounded"></div>
              <div className="h-3 w-4/6 bg-[#162438] rounded"></div>
            </div>
          </div>
          <div className="pt-4 border-t border-[rgba(180,210,235,0.08)] flex justify-between items-center">
            <div className="h-4 w-28 bg-[#1b2b42] rounded"></div>
            <div className="h-8 w-24 bg-[#1b2b42] rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
