"use client";

import { Search, X, Heart, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge.js";

export function MissionFilters({
  searchQuery = "",
  onSearchChange,
  activeTab = "upcoming",
  onTabChange,
  selectedAgency = "ALL",
  onAgencyChange,
  agencies = [],
  selectedStatus = "ALL",
  onStatusChange,
  statuses = [],
  sortBy = "earliest",
  onSortChange,
  onlyFavorites = false,
  onToggleFavorites,
  favoritesCount = 0,
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-[rgba(180,210,235,0.13)] mb-8 space-y-5">
      {/* Top Feed Tabs (Upcoming vs Historical Archive) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(180,210,235,0.1)] pb-5">
        <div className="flex items-center gap-2 bg-[#070910] p-1 rounded-xl border border-[rgba(180,210,235,0.1)]">
          <button
            onClick={() => onTabChange("upcoming")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
              activeTab === "upcoming"
                ? "bg-[#65F6FF] text-[#070910] shadow-[0_0_15px_rgba(101,246,255,0.3)]"
                : "text-[#9AA9BD] hover:text-[#F3F7FC]"
            }`}
          >
            UPCOMING LAUNCHES
          </button>
          <button
            onClick={() => onTabChange("historical")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
              activeTab === "historical"
                ? "bg-[#65F6FF] text-[#070910] shadow-[0_0_15px_rgba(101,246,255,0.3)]"
                : "text-[#9AA9BD] hover:text-[#F3F7FC]"
            }`}
          >
            HISTORICAL ARCHIVE
          </button>
        </div>

        {/* Favorites Filter Button */}
        <button
          onClick={onToggleFavorites}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all duration-200 ${
            onlyFavorites
              ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
              : "bg-[#101C2D] border-[rgba(180,210,235,0.15)] text-[#9AA9BD] hover:text-[#F3F7FC]"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-rose-500" : ""}`} />
          <span>Saved Bookmarks</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#070910] text-[10px] font-mono">
            {favoritesCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9AA9BD] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search mission, rocket, agency..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#070910] border border-[rgba(180,210,235,0.15)] text-xs text-[#F3F7FC] placeholder-[#9AA9BD]/50 focus:outline-none focus:border-[#65F6FF] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA9BD] hover:text-[#F3F7FC]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Agency Filter */}
        <div>
          <select
            value={selectedAgency}
            onChange={(e) => onAgencyChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#070910] border border-[rgba(180,210,235,0.15)] text-xs text-[#F3F7FC] focus:outline-none focus:border-[#65F6FF]"
          >
            <option value="ALL">All Launch Operators</option>
            {agencies.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#070910] border border-[rgba(180,210,235,0.15)] text-xs text-[#F3F7FC] focus:outline-none focus:border-[#65F6FF]"
          >
            <option value="ALL">All Flight Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#070910] border border-[rgba(180,210,235,0.15)] text-xs text-[#F3F7FC] focus:outline-none focus:border-[#65F6FF]"
          >
            <option value="earliest">Sort: Soonest Launch (T-0)</option>
            <option value="latest">Sort: Latest Scheduled</option>
            <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
