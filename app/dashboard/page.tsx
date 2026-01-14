"use client";

import {
  AttendanceFeed,
  DashboardHeader,
  EmployeeAttendance,
} from "@/components/dashboard";

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

export default function DashboardPage() {

  return (
    <>
      {/* Header */}
      <DashboardHeader
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 space-y-4 md:space-y-6">


        {/* Attendance Feed */}
        <AttendanceFeed
          employees={employeesData}
          lastUpdated="Just now"
          onLogReason={(id) => console.log("Log reason for:", id)}
        />
      </main>
    </>
  );
}
