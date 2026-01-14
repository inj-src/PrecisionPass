"use client";

import { EmployeeDirectoryHeader } from "@/components/employees/employee-directory-header";
import { EmployeeSearch } from "@/components/employees/employee-search";
import { EmployeeTable, Employee } from "@/components/employees/employee-table";

// Mock employee data
const mockEmployees: Employee[] = [
   {
      id: "1",
      name: "Sarah Jenkins",
      role: "Senior Software Engineer",
      avatar: undefined,
      initials: "SJ",
      employeeId: "ID-28491",
      department: "Engineering",
      biometricStatus: "enrolled",
      attendanceStatus: "clocked-in",
   },
   {
      id: "2",
      name: "Michael Chen",
      role: "Product Designer",
      avatar: undefined,
      initials: "MC",
      employeeId: "ID-28495",
      department: "Design",
      biometricStatus: "update-required",
      attendanceStatus: "away",
   },
   {
      id: "3",
      name: "Amanda Roe",
      role: "HR Manager",
      avatar: undefined,
      initials: "AR",
      employeeId: "ID-28502",
      department: "People Operations",
      biometricStatus: "enrolled",
      attendanceStatus: "on-leave",
   },
   {
      id: "4",
      name: "Robert Wilson",
      role: "Marketing Lead",
      avatar: undefined,
      initials: "RW",
      employeeId: "ID-28510",
      department: "Marketing",
      biometricStatus: "pending",
      attendanceStatus: "clocked-in",
   },
   {
      id: "5",
      name: "Emily Davis",
      role: "Data Analyst",
      avatar: undefined,
      initials: "ED",
      employeeId: "ID-28515",
      department: "Analytics",
      biometricStatus: "enrolled",
      attendanceStatus: "clocked-in",
   },
   {
      id: "6",
      name: "James Miller",
      role: "Sales Director",
      avatar: undefined,
      initials: "JM",
      employeeId: "ID-28520",
      department: "Sales",
      biometricStatus: "enrolled",
      attendanceStatus: "away",
   },
   {
      id: "7",
      name: "Lisa Wong",
      role: "Backend Developer",
      avatar: undefined,
      initials: "LW",
      employeeId: "ID-28525",
      department: "Engineering",
      biometricStatus: "enrolled",
      attendanceStatus: "clocked-in",
   },
   {
      id: "8",
      name: "David Chen",
      role: "DevOps Engineer",
      avatar: undefined,
      initials: "DC",
      employeeId: "ID-28530",
      department: "Engineering",
      biometricStatus: "update-required",
      attendanceStatus: "clocked-in",
   },
];

export default function EmployeesPage() {
   return (
      <>
         {/* Header */}
         <EmployeeDirectoryHeader />

         {/* Main Content */}
         <main className="flex-1 overflow-auto p-6 space-y-6">

            {/* Search and Filters */}
            <EmployeeSearch
               onSearch={(query) => console.log("Search:", query)}
               onFilter={() => console.log("Filter clicked")}
               onExport={() => console.log("Export clicked")}
               onAddEmployee={() => console.log("Add employee clicked")}
            />

            {/* Employee Table */}
            <EmployeeTable
               employees={mockEmployees}
               totalEntries={1248}
               currentPage={1}
               totalPages={125}
               onPageChange={(page) => console.log("Page:", page)}
            />
         </main>
      </>
   );
}
