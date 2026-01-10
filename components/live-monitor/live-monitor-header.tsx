"use client";

import { Settings2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveMonitorHeaderProps {
  cameraName?: string;
  onAddCamera?: () => void;
  onSettings?: () => void;
}

export function LiveMonitorHeader({
  cameraName = "Main Entrance (Cam 01)",
  onAddCamera,
  onSettings,
}: LiveMonitorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
      <div>
        <h1 className="text-xl font-bold text-foreground">Live Camera Feed</h1>
        <p className="text-sm text-muted-foreground">
          Monitoring:{" "}
          <span className="text-success font-medium">{cameraName}</span>
        </p>
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

        {/* Settings Button */}
        <Button variant="outline" size="icon" onClick={onSettings}>
          <Settings2 className="h-4 w-4" />
        </Button>

        {/* Add Camera Button */}
        <Button onClick={onAddCamera} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Camera
        </Button>
      </div>
    </header>
  );
}
