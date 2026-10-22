"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Rocket, Sparkles, Menu, X, Clock } from "lucide-react";

export function Navbar({ nextLaunch = null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#070910]/85 backdrop-blur-md border-b border-[rgba(180,210,235,0.13)] py-3 shadow-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#65F6FF] rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101C2D] to-[#162438] border border-[#65F6FF]/30 flex items-center justify-center text-[#65F6FF] group-hover:border-[#65F6FF] group-hover:shadow-[0_0_15px_rgba(101,246,255,0.4)] transition-all duration-300">
              <Rocket className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-[#F3F7FC] block leading-none">
                ROCKET<span className="text-[#65F6FF]">LAUNCH</span>
              </span>
              <span className="text-[10px] tracking-widest text-[#9AA9BD] uppercase font-mono block mt-0.5">
                Flight Telemetry
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#hero"
              className="text-[#9AA9BD] hover:text-[#65F6FF] transition-colors duration-200"
            >
              Discover
            </a>
            <a
              href="#upcoming"
              className="text-[#9AA9BD] hover:text-[#65F6FF] transition-colors duration-200"
            >
              Upcoming Launches
            </a>
            <a
              href="#archive"
              className="text-[#9AA9BD] hover:text-[#65F6FF] transition-colors duration-200"
            >
              Mission Archive
            </a>
            <a
              href="#ai"
              className="flex items-center gap-1.5 text-[#FFB45C] hover:text-[#FFB45C]/80 transition-colors duration-200"
            >
              <Sparkles className="w-4 h-4 text-[#FFB45C]" />
              AI Intelligence
            </a>
          </nav>

          {/* Right Status Badge */}
          <div className="hidden lg:flex items-center gap-3">
            {nextLaunch ? (
              <a
                href="#upcoming"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101C2D]/80 border border-[#65F6FF]/30 text-xs text-[#F3F7FC] hover:border-[#65F6FF] transition-colors duration-200"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65F6FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65F6FF]"></span>
                </span>
                <Clock className="w-3.5 h-3.5 text-[#65F6FF]" />
                <span className="font-mono text-[11px] truncate max-w-[140px]">
                  {nextLaunch.rocket?.name || nextLaunch.name}
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101C2D] border border-[rgba(180,210,235,0.15)] text-xs text-[#9AA9BD]">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Network Synchronized</span>
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
        <div className="md:hidden glass-panel-elevated border-b border-[rgba(180,210,235,0.15)] px-6 pt-4 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#F3F7FC] hover:text-[#65F6FF]"
          >
            Discover
          </a>
          <a
            href="#upcoming"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#F3F7FC] hover:text-[#65F6FF]"
          >
            Upcoming Launches
          </a>
          <a
            href="#archive"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#F3F7FC] hover:text-[#65F6FF]"
          >
            Mission Archive
          </a>
          <a
            href="#ai"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-base font-medium text-[#FFB45C]"
          >
            <Sparkles className="w-4 h-4" />
            AI Intelligence
          </a>
        </div>
      )}
    </header>
  );
}
