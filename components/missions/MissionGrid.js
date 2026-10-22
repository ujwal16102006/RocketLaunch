"use client";

import { MissionCard } from "./MissionCard.js";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton.js";
import { ErrorState } from "@/components/ui/ErrorState.js";
import { EmptyState } from "@/components/ui/EmptyState.js";

export function MissionGrid({
  launches = [],
  loading = false,
  error = null,
  onRetry = null,
  onResetFilters = null,
  onSelectLaunch = null,
  onAskAi = null,
}) {
  if (loading) {
    return <LoadingSkeleton count={6} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Telemetry Synchronization Failed"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!launches || launches.length === 0) {
    return (
      <EmptyState
        title="Zero Missions Found"
        message="No launches match your active search, agency filters, or saved bookmarks."
        onReset={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {launches.map((launch) => (
        <MissionCard
          key={launch.id}
          launch={launch}
          onSelectLaunch={onSelectLaunch}
          onAskAi={onAskAi}
        />
      ))}
    </div>
  );
}
