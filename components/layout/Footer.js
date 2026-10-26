"use client";

import { Rocket, ArrowUp, Globe, Terminal } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[rgba(180,210,235,0.13)] bg-[#070910] text-[#9AA9BD] text-sm pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[rgba(180,210,235,0.08)]">
          {/* Brand & Disclosure */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#101C2D] border border-[#65F6FF]/30 flex items-center justify-center text-[#65F6FF]">
                <Rocket className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#F3F7FC] tracking-wider">
                ROCKET<span className="text-[#65F6FF]">LAUNCH</span>
              </span>
            </div>
            <p className="text-xs text-[#9AA9BD] leading-relaxed max-w-md">
              A high-precision orbital launch tracking platform. Integrating verified spaceflight manifests from global launch operators with scroll-driven cinematic telemetry and DeepSeek aerospace intelligence.
            </p>
          </div>

          {/* Telemetry Sources */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#F3F7FC] mb-4 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#65F6FF]" />
              Data Feeds
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://ll.thespacedevs.com/docs/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#65F6FF] transition-colors"
                >
                  Launch Library 2 (The Space Devs)
                </a>
              </li>
              <li>
                <a
                  href="https://api-docs.deepseek.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#65F6FF] transition-colors"
                >
                  DeepSeek AI Telemetry Engine
                </a>
              </li>
              <li>
                <span className="text-[#9AA9BD]/60">ISRO, NASA, SpaceX, ESA Manifests</span>
              </li>
            </ul>
          </div>

          {/* Project Architecture & Engineering */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#F3F7FC] mb-4 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#65F6FF]" />
              Engineering Team
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between">
                <span>UI & Layout:</span>
                <span className="text-[#F3F7FC]">V Tarunya Sree</span>
              </li>
              <li className="flex justify-between">
                <span>Launch API:</span>
                <span className="text-[#F3F7FC]">Gousiya M</span>
              </li>
              <li className="flex justify-between">
                <span>Countdown & Logic:</span>
                <span className="text-[#F3F7FC]">Thirumalesh</span>
              </li>
              <li className="flex justify-between">
                <span>Discovery & AI Lead:</span>
                <span className="text-[#F3F7FC]">Ujwal</span>
              </li>
              <li className="flex justify-between">
                <span>Testing & QA:</span>
                <span className="text-[#F3F7FC]">Anand</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} RocketLaunch Aerospace Systems. All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#101C2D] border border-[rgba(180,210,235,0.15)] text-[#F3F7FC] hover:text-[#65F6FF] hover:border-[#65F6FF]/40 transition-all duration-200"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
