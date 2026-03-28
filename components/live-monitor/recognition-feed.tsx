"use client";

import { HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RecognitionEvent } from "@/lib/cv-api";

interface RecognitionFeedProps {
  recognitions: RecognitionEvent[];
}

export function RecognitionFeed({ recognitions }: RecognitionFeedProps) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden py-2">
      <CardHeader className="border-b px-4 pt-4 [.border-b]:pb-4">
        <CardTitle className="text-xs font-semibold sm:text-sm">
          Recent Recognitions
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {recognitions.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No recognitions yet.
              </div>
            )}
            {recognitions.map((recognition) => (
              <RecognitionItem key={recognition.id} recognition={recognition} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function RecognitionItem({ recognition }: { recognition: RecognitionEvent }) {
  const isUnknown = recognition.type === "unknown";
  const isLate = recognition.attendanceStatus === "late";

  const containerClass = cn(
    "flex cursor-pointer items-center rounded-lg border p-2.5 transition-all",
    isUnknown && "border-destructive/30 bg-destructive/10",
    !isUnknown && "border-transparent hover:bg-muted/50"
  );

  const timeClass = cn(
    "font-mono text-xs",
    isLate && "font-medium text-warning",
    isUnknown && "text-destructive",
    !isLate && !isUnknown && "text-muted-foreground"
  );

  return (
    <div className={containerClass}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted/60">
        {isUnknown ? (
          <HelpCircle className="h-5 w-5 text-destructive" />
        ) : (
          <span className="text-sm font-semibold text-foreground">
            {recognition.fullName
              ?.split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("") ?? "PP"}
          </span>
        )}
      </div>

      <div className="ml-2 flex-1 min-w-0 sm:ml-3">
        <div className="mb-0.5 flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "truncate text-xs font-medium sm:text-sm",
              isUnknown ? "text-destructive" : "text-foreground"
            )}
          >
            {isUnknown ? "Unknown face" : recognition.fullName}
          </p>
          <span className={cn(timeClass, "shrink-0 text-[10px] sm:text-xs")}>
            {new Date(recognition.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "truncate text-[10px] sm:text-xs",
              isUnknown ? "text-destructive/70" : "text-muted-foreground"
            )}
          >
            {isUnknown
              ? "Face not matched"
              : `${recognition.department} • ${recognition.confidence?.toFixed(0) ?? 0}% match`}
          </p>
          {!isUnknown && recognition.attendanceStatus && (
            <Badge variant={recognition.attendanceStatus === "late" ? "destructive" : "secondary"}>
              {recognition.attendanceRecorded ? recognition.attendanceStatus : "seen"}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
