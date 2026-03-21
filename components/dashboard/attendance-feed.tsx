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
  onLogReason?: (id: string) => void;
}

export function AttendanceFeed({
  employees,
  lastUpdated = "Just now",
  onLogReason,
}: AttendanceFeedProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | AttendanceStatus>("all");

  const filteredEmployees = React.useMemo(() => {
    if (activeTab === "all") return employees;
    return employees.filter((emp) => emp.status === activeTab);
  }, [employees, activeTab]);

  return (
    <Card className="pb-4 gap-4 lg:gap-6">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 space-y-0">
        <div>  {/* Tabs and Actions */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">
                All
              </TabsTrigger>
              <TabsTrigger value="present" className="text-xs sm:text-sm px-2 sm:px-3">
                Present
              </TabsTrigger>
              <TabsTrigger value="late" className="text-xs sm:text-sm px-2 sm:px-3">
                Late
              </TabsTrigger>
              <TabsTrigger value="absent" className="text-xs sm:text-sm px-2 sm:px-3">
                Absent
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </CardHeader>
      <CardContent className="space-y-4 px-0">


        {/* Employee List */}
        <div className="divide-y">
          {filteredEmployees.map((employee) => (
            <EmployeeAttendanceItem
              key={employee.id}
              employee={employee}
              onLogReason={onLogReason}
            />
          ))}
        </div>


      </CardContent>
    </Card>
  );
}
