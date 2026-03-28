"use client";

import * as React from "react";
import { LoaderCircle, Video } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RecognitionDetection } from "@/lib/cv-api";

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: RecognitionDetection[];
  cameraReady: boolean;
  analyzing: boolean;
  error: string | null;
}

export function CameraFeed({
  videoRef,
  detections,
  cameraReady,
  analyzing,
  error,
}: CameraFeedProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-CA");
  };

  return (
    <Card className="flex flex-col gap-0 py-0 overflow-hidden">
      <CardHeader className="flex flex-row justify-between items-center space-y-0 bg-card px-3 sm:px-4 pt-3 [.border-b]:pb-3 border-b">
        <div className="flex items-center gap-2">
          <Video className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-muted-foreground" />
          <span className="font-medium text-xs sm:text-sm">Camera Stream</span>
        </div>
        <div className="flex items-center gap-3"></div>
      </CardHeader>

      <CardContent className="group relative bg-black p-0 aspect-video overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-200",
            cameraReady ? "opacity-100" : "opacity-0",
          )}
        />

        {!cameraReady && (
          <div className="absolute inset-0 flex justify-center items-center bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900">
            <div className="space-y-4 px-6 text-center">
              <div className="flex justify-center items-center bg-zinc-800 mx-auto border border-zinc-700 rounded-full w-24 h-24">
                <Video className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-200 text-sm">Waiting for browser camera access</p>
              <p className="text-zinc-500 text-xs">
                {error ?? "Allow camera access to start the live monitor."}
              </p>
            </div>
          </div>
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {detections.map((detection, index) => (
          <BoundingBoxOverlay
            key={`${detection.employeeId ?? "unknown"}-${index}`}
            detection={detection}
          />
        ))}
      </CardContent>

      <div className="flex justify-between items-center bg-card px-3 sm:px-4 border-t h-10 sm:h-12">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="font-mono text-foreground text-xs sm:text-sm">
            {formatDate(currentTime)}{" "}
            <span className="ml-1 sm:ml-2 text-muted-foreground">{formatTime(currentTime)}</span>
          </span>
        </div>

        <div className="font-medium text-[10px] text-muted-foreground sm:text-xs">
          {cameraReady
            ? `${detections.length} face${detections.length === 1 ? "" : "s"} in frame`
            : "Camera idle"}
        </div>
      </div>
    </Card>
  );
}

function BoundingBoxOverlay({ detection }: { detection: RecognitionDetection }) {
  const borderColor = {
    matched: "border-success",
    unknown: "border-destructive",
  }[detection.status];

  const bgColor = {
    matched: "bg-success",
    unknown: "bg-destructive",
  }[detection.status];

  const top = `${detection.box.top * 100}%`;
  const left = `${detection.box.left * 100}%`;
  const width = `${detection.box.width * 100}%`;
  const height = `${detection.box.height * 100}%`;

  return (
    <div
      className={cn(
        "absolute border-2 rounded-lg transition-all",
        borderColor,
        detection.status === "matched" && "animate-pulse",
      )}
      style={{ top, left, width, height }}
    >
      <div className="-top-0.5 -left-0.5 absolute border-success/80 border-t-2 border-l-2 rounded-tl w-3 h-3" />
      <div className="-top-0.5 -right-0.5 absolute border-success/80 border-t-2 border-r-2 rounded-tr w-3 h-3" />
      <div className="-bottom-0.5 -left-0.5 absolute border-success/80 border-b-2 border-l-2 rounded-bl w-3 h-3" />
      <div className="-right-0.5 -bottom-0.5 absolute border-success/80 border-r-2 border-b-2 rounded-br w-3 h-3" />

      {detection.status === "matched" && detection.fullName && (
        <div className="top-0 left-1/2 z-10 absolute flex items-center gap-2 bg-card shadow-lg px-3 py-1.5 border border-success rounded-lg whitespace-nowrap -translate-x-1/2 -translate-y-full">
          <span className={cn("rounded-full w-2 h-2", bgColor)} />
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold text-xs">{detection.fullName}</span>
            <span className="text-[10px] text-muted-foreground">
              {detection.employeeId} • {detection.confidence?.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {detection.status === "unknown" && (
        <div className="bottom-0 left-1/2 absolute bg-destructive/80 px-2 py-1 rounded font-mono text-[10px] text-white -translate-x-1/2 translate-y-full">
          Unknown
        </div>
      )}
    </div>
  );
}
