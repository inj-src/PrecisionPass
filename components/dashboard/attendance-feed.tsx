"use client";

import * as React from "react";
import { Filter, LayoutGrid } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmployeeAttendanceItem,
  EmployeeAttendance,
  AttendanceStatus,
} from "./employee-attendance-item";

interface AttendanceFeedProps {
  employees: EmployeeAttendance[];
  lastUpdated?: string;
  onLoadMore?: () => void;
  onLogReason?: (id: string) => void;
}

export function AttendanceFeed({
  employees,
  lastUpdated = "Just now",
  onLoadMore,
  onLogReason,
}: AttendanceFeedProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | AttendanceStatus>("all");

  const filteredEmployees = React.useMemo(() => {
    if (activeTab === "all") return employees;
    return employees.filter((emp) => emp.status === activeTab);
  }, [employees, activeTab]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Live Attendance Feed</CardTitle>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs and Actions */}
        <div className="flex items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="present" className="text-sm">
                Present
              </TabsTrigger>
              <TabsTrigger value="late" className="text-sm">
                Late
              </TabsTrigger>
              <TabsTrigger value="absent" className="text-sm">
                Absent
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

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

        {/* Load More */}
        {onLoadMore && (
          <div className="pt-2">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={onLoadMore}
            >
              Load more employees
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
