"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeScheduleModal } from "./employee-schedule-modal";
import type { EmployeeRecord, Schedule } from "@/lib/cv-api";

export type Employee = EmployeeRecord;

interface EmployeeTableProps {
  employees: Employee[];
  isSavingEmployeeId?: string | null;
  onSaveSchedule: (employeeId: string, schedule: Schedule) => void;
}

export function EmployeeTable({
  employees,
  isSavingEmployeeId = null,
  onSaveSchedule,
}: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  function handleEditClick(employee: Employee) {
    setSelectedEmployee(employee);
    setModalOpen(true);
  }

  function handleSaveSchedule(schedule: Schedule) {
    if (!selectedEmployee) {
      return;
    }

    onSaveSchedule(selectedEmployee.id, schedule);
    setModalOpen(false);
  }

  return (
    <>
      <Card className="py-2 lg:py-6">
        <CardContent className="overflow-x-auto px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="whitespace-nowrap pl-4 text-[10px] uppercase tracking-wider sm:pl-6 sm:text-xs">
                  Employee
                </TableHead>
                <TableHead className="whitespace-nowrap text-[10px] uppercase tracking-wider sm:text-xs">
                  Schedule
                </TableHead>
                <TableHead className="hidden text-[10px] uppercase tracking-wider sm:table-cell sm:text-xs">
                  Face Data
                </TableHead>
                <TableHead className="hidden text-[10px] uppercase tracking-wider lg:table-cell sm:text-xs">
                  Updated
                </TableHead>
                <TableHead className="pr-4 text-right text-[10px] uppercase tracking-wider sm:pr-6 sm:text-xs">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No employees found. Register an employee to get started.
                  </TableCell>
                </TableRow>
              )}
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="pl-4 sm:pl-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground sm:text-base">
                        {employee.fullName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground sm:text-sm">
                        {employee.employeeId} • {employee.department}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">
                      {employee.schedule.checkInTime} - {employee.schedule.checkOutTime}
                    </p>
                    <p className="text-xs text-muted-foreground">Check-in to check-out</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Badge variant={employee.faceEnrolled ? "default" : "outline"}>
                        {employee.faceEnrolled ? "Enrolled" : "Pending"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {employee.sampleCount} sample{employee.sampleCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <p className="text-sm text-foreground">
                      {new Date(employee.updatedAt).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell className="pr-4 text-right sm:pr-6">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(employee)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Schedule
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmployeeScheduleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        employee={selectedEmployee}
        isSaving={selectedEmployee?.id === isSavingEmployeeId}
        onSave={handleSaveSchedule}
      />
    </>
  );
}
