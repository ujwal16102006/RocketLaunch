"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, Sparkles, Menu, X, Clock } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown.js";
import { padZero } from "@/utils/dateUtils.js";

export function Navbar({ nextLaunch = null }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true); // Open cheyane ravali (visible on open)
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalNextLaunch, setInternalNextLaunch] = useState(null);

  // If nextLaunch was not passed from page or is still loading, fetch it once
  useEffect(() => {
    if (!nextLaunch && !internalNextLaunch) {
      let isSubscribed = true;
      fetch("/api/launches?type=upcoming&limit=5")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isSubscribed && data?.launches?.length > 0) {
            const next = data.launches.find((l) => l.net && new Date(l.net).getTime() > Date.now()) || data.launches[0];
            setInternalNextLaunch(next);
          }
        })
        .catch(() => {});
      return () => {
        isSubscribed = false;
      };
    }
  }, [nextLaunch, internalNextLaunch]);

  const activeLaunch = nextLaunch || internalNextLaunch;
  const countdown = useCountdown(activeLaunch?.net);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      // Open cheyane ravali: When near top (<= 80px), always keep visible
      if (currentScrollY <= 80) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scroll chesthey kanipiyakudadhu (scrolling down -> hide)
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Paiki pothe apudu kanipiyalii (scrolling up -> show)
        setVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/launches", label: "Upcoming Launches" },
    { href: "/archive", label: "Mission Archive" },
    { href: "/ai", label: "AI Intelligence", isAi: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
        visible || mobileMenuOpen
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none"
      } ${
        scrolled
          ? "bg-[#060812]/92 backdrop-blur-md border-b border-[rgba(101,246,255,0.18)] py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          : "bg-gradient-to-b from-[#060812]/90 via-[#060812]/60 to-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#65F6FF] rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101C2D] to-[#162438] border border-[#65F6FF]/35 flex items-center justify-center text-[#65F6FF] group-hover:border-[#65F6FF] group-hover:shadow-[0_0_18px_rgba(101,246,255,0.45)] transition-all duration-300">
              <Rocket className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-[#F3F7FC] block leading-none">
                ROCKET<span className="text-[#65F6FF]">LAUNCH</span>
              </span>
              <span className="text-[10px] tracking-widest text-[#9AA9BD] uppercase font-mono block mt-0.5">
                Orbital Operations
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Separate Pages) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              if (link.isAi) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-[#FFB45C]/20 text-[#FFB45C] border border-[#FFB45C]/50 shadow-[0_0_12px_rgba(255,180,92,0.3)] font-semibold"
                        : "text-[#FFB45C]/90 hover:text-[#FFB45C] hover:bg-[#FFB45C]/10"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFB45C]" />
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#65F6FF]/15 text-[#65F6FF] border border-[#65F6FF]/35 font-semibold shadow-[0_0_12px_rgba(101,246,255,0.2)]"
                      : "text-[#9AA9BD] hover:text-[#F3F7FC] hover:bg-[#101C2D]/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Status Badge with Live Next Launch Countdown */}
          <div className="hidden lg:flex items-center gap-3">
            {activeLaunch ? (
              <Link
                href="/launches"
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#101C2D]/90 border border-[#65F6FF]/35 text-xs text-[#F3F7FC] hover:border-[#65F6FF] hover:shadow-[0_0_15px_rgba(101,246,255,0.25)] transition-all duration-200"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65F6FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65F6FF]"></span>
                </span>
                <Clock className="w-3.5 h-3.5 text-[#65F6FF]" />
                <span className="font-mono text-[11px] text-[#65F6FF] font-semibold" suppressHydrationWarning>
                  {countdown.isPast
                    ? "T+ ACTIVE"
                    : `T- ${padZero(countdown.days)}d ${padZero(countdown.hours)}h ${padZero(countdown.minutes)}m ${padZero(countdown.seconds)}s`}
                </span>
                <span className="text-[#9AA9BD] text-[10px] hidden xl:inline">
                  • {activeLaunch?.rocket?.name || activeLaunch?.name || "Next Flight"}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101C2D] border border-[rgba(180,210,235,0.15)] text-xs text-[#9AA9BD]">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Telemetry Synchronized</span>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-lg bg-[#101C2D] border border-[rgba(180,210,235,0.15)] text-[#F3F7FC] hover:text-[#65F6FF] focus:outline-none focus:ring-2 focus:ring-[#65F6FF]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel-elevated border-b border-[rgba(180,210,235,0.15)] px-6 pt-4 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#65F6FF]/15 text-[#65F6FF] border border-[#65F6FF]/30 font-semibold"
                    : link.isAi
                    ? "text-[#FFB45C] hover:bg-[#101C2D]"
                    : "text-[#F3F7FC] hover:text-[#65F6FF] hover:bg-[#101C2D]"
                }`}
              >
                <span>{link.label}</span>
                {link.isAi && <Sparkles className="w-4 h-4 text-[#FFB45C]" />}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
