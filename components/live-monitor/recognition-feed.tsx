"use client";

import { Check, Clock, HelpCircle } from "lucide-react";
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
      <Card className="flex flex-col h-full overflow-hidden">
         <CardHeader className=" border-b flex flex-row items-center justify-between space-y-0 bg-card">
            <CardTitle className="text-sm font-semibold">
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
               <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center border-2 border-background">
                  <HelpCircle className="h-5 w-5 text-destructive" />
               </div>
            ) : (
                  <Avatar className="h-10 w-10 shadow-sm">
                  <AvatarImage src={recognition.avatar} alt={recognition.name} />
                     <AvatarFallback >
                     {recognition.initials}
                  </AvatarFallback>
               </Avatar>
            )}
         </div>

         {/* Info */}
         <div className="ml-3 flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
               <p
                  className={cn(
                     "text-sm font-medium truncate",
                     isUnknown ? "text-destructive" : "text-foreground"
                  )}
               >
                  {isUnknown ? "Unknown Person" : recognition.name}
               </p>
               <span className={timeClass}>
                  {isLive ? "Now" : recognition.time}
               </span>
            </div>
            <p
               className={cn(
                  "text-xs truncate",
                  isUnknown ? "text-destructive/70" : "text-muted-foreground"
               )}
            >
               {isUnknown
                  ? "Alert: Face not matched"
                  : `${recognition.role} • ${isLate ? "Late Entry" : "Entry"}`}
            </p>
         </div>
      </div>
   );
}
