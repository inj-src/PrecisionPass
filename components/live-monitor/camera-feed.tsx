"use client";

import * as React from "react";
import { Video, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BoundingBox {
   id: string;
   name?: string;
   employeeId?: string;
   confidence?: number;
   position: { top: string; left: string };
   size: { width: string; height: string };
   status: "identified" | "analyzing" | "unknown";
}

interface CameraFeedProps {
   streamName?: string;
   resolution?: string;
   fps?: number;
   latency?: number;
   boundingBoxes?: BoundingBox[];
   onFullscreen?: () => void;
}

export function CameraFeed({
   streamName = "Main Entrance Stream",
   resolution = "1920x1080",
   fps = 60,
   latency = 24,
   boundingBoxes = [],
   onFullscreen,
}: CameraFeedProps) {
   const [currentTime, setCurrentTime] = React.useState(new Date());

   // Update time every second
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
      return date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
   };

   return (
      <Card className="flex flex-col h-full overflow-hidden py-0 gap-0">
         {/* Stream Header */}
         <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0 bg-card">
            <div className="flex items-center gap-2">
               <Video className="h-4 w-4 text-muted-foreground" />
               <span className="text-sm font-medium">{streamName}</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-xs text-muted-foreground font-mono">
                  {resolution} • {fps}FPS
               </span>
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onFullscreen}
               >
                  <Maximize2 className="h-4 w-4" />
               </Button>
            </div>
         </CardHeader>

         {/* Video Feed Area */}
         <CardContent className="flex-1 relative bg-black p-0 overflow-hidden group min-h-[400px]">
            {/* Placeholder Feed Image - Replace with actual video stream */}
            <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
               <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mx-auto border border-zinc-700">
                     <Video className="h-10 w-10 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 text-sm">Camera feed will appear here</p>
               </div>
            </div>

            {/* Video Overlay Gradient */}
            <div
               className="absolute inset-0 pointer-events-none"
               style={{
                  background:
                     "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.6) 100%)",
               }}
            />

            {/* Bounding Boxes */}
            {boundingBoxes.map((box) => (
               <BoundingBoxOverlay key={box.id} box={box} />
            ))}

         </CardContent>

         {/* Controls Footer */}
         <div className="h-12 bg-card border-t flex items-center px-4 justify-between">
            <div className="flex items-center gap-4">
               <span className="text-sm font-mono text-foreground">
                  {formatDate(currentTime)}{" "}
                  <span className="text-muted-foreground ml-2">{formatTime(currentTime)}</span>
               </span>
            </div>

            <div className="text-xs text-muted-foreground font-medium">
               Latency:{" "}
               <span
                  className={cn(
                     latency < 50 ? "text-success" : latency < 100 ? "text-warning" : "text-destructive"
                  )}
               >
                  {latency}ms
               </span>
            </div>
         </div>
      </Card>
   );
}

// Bounding Box Overlay Component
function BoundingBoxOverlay({ box }: { box: BoundingBox }) {
   const borderColor = {
      identified: "border-success",
      analyzing: "border-warning/50",
      unknown: "border-destructive",
   }[box.status];

   const bgColor = {
      identified: "bg-success",
      analyzing: "bg-warning",
      unknown: "bg-destructive",
   }[box.status];

   return (
      <div
         className={cn(
            "absolute border-2 rounded-lg transition-all",
            borderColor,
            box.status === "identified" && "animate-pulse"
         )}
         style={{
            top: box.position.top,
            left: box.position.left,
            width: box.size.width,
            height: box.size.height,
         }}
      >
         {/* Corner Brackets */}
         <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-success/80 rounded-tl" />
         <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-success/80 rounded-tr" />
         <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-success/80 rounded-bl" />
         <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-success/80 rounded-br" />

         {/* Label */}
         {box.status === "identified" && box.name && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card px-3 py-1.5 rounded-lg shadow-lg border border-success flex items-center gap-2 whitespace-nowrap z-10">
               <span className={cn("w-2 h-2 rounded-full", bgColor)} />
               <div className="flex flex-col items-start leading-none">
                  <span className="text-xs font-bold">{box.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                     ID: {box.employeeId} • {box.confidence}%
                  </span>
               </div>
            </div>
         )}

         {box.status === "analyzing" && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-warning/20 px-2 py-1 rounded text-[10px] text-warning font-mono">
               Analyzing...
            </div>
         )}
      </div>
   );
}
