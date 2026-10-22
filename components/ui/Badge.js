"use client";

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-[#101C2D] text-[#9AA9BD] border-[rgba(180,210,235,0.15)]",
    cyan: "bg-[#65F6FF]/10 text-[#65F6FF] border-[#65F6FF]/30",
    amber: "bg-[#FFB45C]/10 text-[#FFB45C] border-[#FFB45C]/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    outline: "bg-transparent text-[#9AA9BD] border-[rgba(180,210,235,0.2)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
