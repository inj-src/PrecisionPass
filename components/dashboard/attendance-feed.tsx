"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmployeeAttendanceItem,
  EmployeeAttendance,
  AttendanceStatus,
} from "./employee-attendance-item";

interface AttendanceFeedProps {
  employees: EmployeeAttendance[];
  lastUpdated?: string;
}

export function AttendanceFeed({
  employees,
  lastUpdated = "Just now",
}: AttendanceFeedProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | AttendanceStatus>("all");

  const filteredEmployees = React.useMemo(() => {
    if (activeTab === "all") {
      return employees;
    }
    return employees.filter((employee) => employee.status === activeTab);
  }, [employees, activeTab]);

  return (
    <Card className="gap-4 pb-4 lg:gap-6">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="all" className="px-2 text-xs sm:px-3 sm:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="present" className="px-2 text-xs sm:px-3 sm:text-sm">
                Present
              </TabsTrigger>
              <TabsTrigger value="late" className="px-2 text-xs sm:px-3 sm:text-sm">
                Late
              </TabsTrigger>
              <TabsTrigger value="absent" className="px-2 text-xs sm:px-3 sm:text-sm">
                Absent
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">Last updated: {lastUpdated}</p>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="divide-y">
          {filteredEmployees.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No attendance records match the current filter.
            </div>
          )}
          {filteredEmployees.map((employee) => (
            <EmployeeAttendanceItem key={employee.id} employee={employee} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
