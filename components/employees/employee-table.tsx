"use client";

import * as React from "react";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeScheduleModal } from "./employee-schedule-modal";

export type BiometricStatus = "enrolled" | "pending" | "update-required";
export type AttendanceStatus = "clocked-in" | "away" | "on-leave" | "absent";

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials: string;
  employeeId: string;
  department: string;
  biometricStatus: BiometricStatus;
  attendanceStatus: AttendanceStatus;
}

interface EmployeeTableProps {
  employees: Employee[];
  totalEntries: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function EmployeeTable({
  employees,
  totalEntries,
  currentPage,
  totalPages,
  onPageChange,
}: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const pageSize = 10;
  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  function handleSettingsClick(employee: Employee) {
    setSelectedEmployee(employee);
    setModalOpen(true);
  }

  function handleSaveSchedule(data: {
    checkInTime: string;
    checkOutTime: string;
    hourlyRate: string;
  }) {
    console.log("Saved schedule for:", selectedEmployee?.name, data);
    // Here you would typically make an API call to save the data
  }

  function renderPaginationButtons() {
    const buttons: React.ReactNode[] = [];
    const maxVisiblePages = 3;

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page numbers
    for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className="min-w-8"
        >
          {i}
        </Button>
      );
    }

    // Ellipsis and last page
    if (totalPages > maxVisiblePages) {
      buttons.push(
        <span key="ellipsis" className="px-2 text-muted-foreground">
          ...
        </span>
      );
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="min-w-8"
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  }

  return (
    <>
      <Card>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs uppercase tracking-wider pl-6">Employee</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">ID</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Department</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  {/* Employee Info */}
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                          {employee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Employee ID */}
                  <TableCell>
                    <p className="font-medium text-foreground">{employee.employeeId}</p>
                  </TableCell>

                  {/* Department */}
                  <TableCell>
                    <p className="text-foreground">{employee.department}</p>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleSettingsClick(employee)}
                      title="Edit schedule & rate"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination Footer */}
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {startEntry} to {endEntry} of {totalEntries.toLocaleString()} entries
          </p>
          <div className="flex items-center gap-1">{renderPaginationButtons()}</div>
        </CardFooter>
      </Card>

      {/* Employee Schedule Modal */}
      <EmployeeScheduleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        employee={selectedEmployee}
        onSave={handleSaveSchedule}
      />
    </>
  );
}
