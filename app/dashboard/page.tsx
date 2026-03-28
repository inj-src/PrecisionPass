"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import {
  AttendanceFeed,
  DashboardHeader,
  EmployeeAttendance,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTodayAttendance } from "@/lib/cv-api";

export default function DashboardPage() {
  const [employees, setEmployees] = React.useState<EmployeeAttendance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string>("Never");

  const loadAttendance = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setEmployees(await getTodayAttendance());
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAttendance();
  }, [loadAttendance]);

  return (
    <>
      <DashboardHeader />

      <main className="flex-1 space-y-4 overflow-auto p-4 md:space-y-6 md:p-6">
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={() => void loadAttendance()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5 py-4">
            <CardContent className="flex items-center gap-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card className="py-10">
            <CardContent className="text-center text-sm text-muted-foreground">
              Loading attendance...
            </CardContent>
          </Card>
        ) : (
          <AttendanceFeed employees={employees} lastUpdated={lastUpdated} />
        )}
      </main>
    </>
  );
}
