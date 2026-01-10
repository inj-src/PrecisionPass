"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function LiveMonitorHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Live Camera Feed</h1>
          <p className="text-sm text-muted-foreground">
            Monitoring live camera feed
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
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

      </div>
    </header>
  );
}
