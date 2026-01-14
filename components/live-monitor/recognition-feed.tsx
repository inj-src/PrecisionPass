"use client";

import { HelpCircle } from "lucide-react";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type RecognitionStatus = "entry" | "late" | "unknown" | "exit";

export interface Recognition {
   id: string;
   name?: string;
   role?: string;
   avatar?: string;
   initials?: string;
   status: RecognitionStatus;
   time: string;
   isLive?: boolean;
}

interface RecognitionFeedProps {
   recognitions: Recognition[];
}

export function RecognitionFeed({
   recognitions,
}: RecognitionFeedProps) {
   return (
      <Card className="flex flex-col h-full overflow-hidden gap-0 py-2">
         <CardHeader className="border-b px-3 pt-4 [.border-b]:pb-4">
            <CardTitle className="text-xs sm:text-sm font-semibold">
               Recent Recognitions
            </CardTitle>
         </CardHeader>

         <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
               <div className="p-2 space-y-1">
                  {recognitions.map((recognition) => (
                     <RecognitionItem key={recognition.id} recognition={recognition} />
                  ))}
               </div>
            </ScrollArea>
         </CardContent>
      </Card>
   );
}

function RecognitionItem({ recognition }: { recognition: Recognition }) {
   const isUnknown = recognition.status === "unknown";
   const isLate = recognition.status === "late";
   const isLive = recognition.isLive;

   const containerClass = cn(
      "flex items-center p-2.5 rounded-lg transition-all cursor-pointer",
      isUnknown && "bg-destructive/10 border border-destructive/30",
      !isUnknown && "hover:bg-muted/50 border border-transparent"
   );

   const timeClass = cn(
      "text-xs font-mono",
      isLate && "text-warning font-medium",
      isUnknown && "text-destructive",
      !isLate && !isUnknown && "text-muted-foreground"
   );

   return (
      <div className={containerClass}>
         {/* Avatar */}
         <div className="relative shrink-0">
            {isUnknown ? (
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-destructive/20 flex items-center justify-center border-2 border-background">
                  <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
               </div>
            ) : (
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-sm">
                  <AvatarImage src={recognition.avatar} alt={recognition.name} />
                     <AvatarFallback >
                     {recognition.initials}
                  </AvatarFallback>
               </Avatar>
            )}
         </div>

         {/* Info */}
         <div className="ml-2 sm:ml-3 flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5 gap-2">
               <p
                  className={cn(
                     "text-xs sm:text-sm font-medium truncate",
                     isUnknown ? "text-destructive" : "text-foreground"
                  )}
               >
                  {isUnknown ? "Unknown" : recognition.name}
               </p>
               <span className={cn(timeClass, "text-[10px] sm:text-xs shrink-0")}>
                  {isLive ? "Now" : recognition.time}
               </span>
            </div>
            <p
               className={cn(
                  "text-[10px] sm:text-xs truncate",
                  isUnknown ? "text-destructive/70" : "text-muted-foreground"
               )}
            >
               {isUnknown
                  ? "Face not matched"
                  : `${recognition.role} • ${isLate ? "Late" : "Entry"}`}
            </p>
         </div>
      </div>
   );
}
