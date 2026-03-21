"use client";

import { PageHeader } from "@/components/layout";

export function LiveMonitorHeader() {
  return (
    <PageHeader
      title="Live Camera Feed"
      description="Monitoring live camera feed"
    >
      {/* Live Recording Indicator */}
      <div className="flex items-center gap-2 mr-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/70 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
        </span>
        <span className="text-sm font-semibold text-destructive">
          LIVE REC
        </span>
      </div>
    </PageHeader>
  );
}
