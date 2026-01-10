"use client";

import { Check, Clock, HelpCircle, Download } from "lucide-react";
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
   onViewAll?: () => void;
   onDownloadReport?: () => void;
}

export function RecognitionFeed({
   recognitions,
   onViewAll,
   onDownloadReport,
}: RecognitionFeedProps) {
   return (
      <Card className="flex flex-col h-full overflow-hidden py-0 gap-0">
         <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0 bg-card">
            <CardTitle className="text-sm font-semibold">
               Recent Recognitions
            </CardTitle>
            <Button
               variant="link"
               size="sm"
               className="h-auto p-0 text-xs"
               onClick={onViewAll}
            >
               View All
            </Button>
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

         <CardFooter className="py-3 px-4 border-t bg-muted/30 justify-center">
            <Button
               variant="ghost"
               size="sm"
               className="text-xs gap-2 text-muted-foreground hover:text-foreground"
               onClick={onDownloadReport}
            >
               Download Daily Report CSV
               <Download className="h-3.5 w-3.5" />
            </Button>
         </CardFooter>
      </Card>
   );
}

function RecognitionItem({ recognition }: { recognition: Recognition }) {
   const isUnknown = recognition.status === "unknown";
   const isLate = recognition.status === "late";
   const isLive = recognition.isLive;

   const containerClass = cn(
      "flex items-center p-2.5 rounded-lg transition-all cursor-pointer",
      isLive && "bg-success/10 border border-success/30",
      isUnknown && "bg-destructive/10 border border-destructive/30",
      !isLive && !isUnknown && "hover:bg-muted/50 border border-transparent"
   );

   const timeClass = cn(
      "text-xs font-mono",
      isLive && "text-success font-bold",
      isLate && "text-warning font-medium",
      isUnknown && "text-destructive",
      !isLive && !isLate && !isUnknown && "text-muted-foreground"
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
               <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage src={recognition.avatar} alt={recognition.name} />
                  <AvatarFallback className="bg-linear-to-br from-amber-400 to-orange-500 text-white text-xs font-semibold">
                     {recognition.initials}
                  </AvatarFallback>
               </Avatar>
            )}

            {/* Status Badge */}
            {!isUnknown && (
               <div
                  className={cn(
                     "absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 border-2 border-background",
                     isLate ? "bg-warning" : "bg-success"
                  )}
               >
                  {isLate ? (
                     <Clock className="h-2.5 w-2.5 text-white" />
                  ) : (
                     <Check className="h-2.5 w-2.5 text-white" />
                  )}
               </div>
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
