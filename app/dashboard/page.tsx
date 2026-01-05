"use client";

import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import {
  StatsCard,
  AttendanceFeed,
  SystemAlerts,
  DashboardHeader,
  EmployeeAttendance,
  SystemAlert,
} from "@/components/dashboard";

// Sample data - in production this would come from an API
const statsData = [
  {
    title: "Total Employees",
    value: "124",
    icon: Users,
    subtitle: "+2 new this week",
    subtitleIcon: TrendingUp,
    subtitleVariant: "success" as const,
  },
  {
    title: "Present Today",
    value: "112",
    icon: CheckCircle2,
    subtitle: "90% attendance rate",
    subtitleVariant: "muted" as const,
  },
  {
    title: "Late Arrivals",
    value: "8",
    icon: Clock,
    subtitle: "Needs review",
    subtitleIcon: AlertTriangle,
    subtitleVariant: "warning" as const,
  },
  {
    title: "Absent",
    value: "4",
    icon: XCircle,
    subtitle: "3 planned leaves",
    subtitleVariant: "muted" as const,
  },
];

const employeesData: EmployeeAttendance[] = [
  {
    id: "1",
    name: "Sarah Connor",
    department: "Design Team",
    initials: "SC",
    status: "present",
    matchPercentage: 98,
    checkInTime: "08:55 AM",
  },
  {
    id: "2",
    name: "Michael Chen",
    department: "Engineering",
    initials: "MC",
    status: "late",
    matchPercentage: 95,
    checkInTime: "09:42 AM",
    lateMinutes: 42,
  },
  {
    id: "3",
    name: "Jessica Wu",
    department: "Product",
    initials: "JW",
    status: "present",
    matchPercentage: 99,
    checkInTime: "08:45 AM",
  },
  {
    id: "4",
    name: "David Ross",
    department: "Sales",
    initials: "DR",
    status: "absent",
    noScan: true,
  },
  {
    id: "5",
    name: "Emily Zhang",
    department: "Marketing",
    initials: "EZ",
    status: "present",
    matchPercentage: 97,
    checkInTime: "08:58 AM",
  },
];

const alertsData: SystemAlert[] = [
  {
    id: "1",
    title: "Camera #04 Offline",
    message:
      "The front desk camera (ID: CAM-04) stopped responding at 10:15 AM. Maintenance has been notified.",
    severity: "warning",
  },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const today = new Date();

  return (
    <>
      {/* Header */}
      <DashboardHeader
        title="Attendance Dashboard"
        subtitle={`Overview of employee check-ins for today, ${formatDate(today)}.`}
        onExport={() => console.log("Exporting report...")}
        onSearch={(query) => console.log("Searching:", query)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </section>

        {/* Attendance Feed */}
        <AttendanceFeed
          employees={employeesData}
          lastUpdated="Just now"
          onLoadMore={() => console.log("Loading more...")}
          onLogReason={(id) => console.log("Log reason for:", id)}
        />

        {/* System Alerts */}
        <SystemAlerts alerts={alertsData} />
      </main>
    </>
  );
}
