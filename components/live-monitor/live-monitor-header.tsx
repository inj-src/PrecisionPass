"use client";

import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";

interface LiveMonitorHeaderProps {
  backendOnline: boolean;
  modelReady: boolean;
  employeeCount: number;
}

export function LiveMonitorHeader({
  backendOnline,
  modelReady,
  employeeCount,
}: LiveMonitorHeaderProps) {
  return (
    <PageHeader title="Live Camera Feed" description="Browser camera preview with live recognition">
      <div className="flex items-center gap-2">
        <Badge variant={backendOnline ? "default" : "destructive"}>
          {backendOnline ? "Backend Online" : "Backend Offline"}
        </Badge>
        <Badge variant={modelReady ? "secondary" : "outline"}>
          {modelReady ? "Model Ready" : "Model Empty"}
        </Badge>
        <Badge variant="outline">{employeeCount} employees</Badge>
      </div>
    </PageHeader>
  );
}
