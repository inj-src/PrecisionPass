"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EmployeeRecord, Schedule } from "@/lib/cv-api";

interface EmployeeEditData {
  monthlyWage: number;
  schedule: Schedule;
}

interface EmployeeScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeRecord | null;
  isSaving?: boolean;
  onSave: (data: EmployeeEditData) => void;
}

export function EmployeeScheduleModal({
  open,
  onOpenChange,
  employee,
  isSaving = false,
  onSave,
}: EmployeeScheduleModalProps) {
  const [checkInTime, setCheckInTime] = React.useState("09:00");
  const [checkOutTime, setCheckOutTime] = React.useState("18:00");
  const [monthlyWage, setMonthlyWage] = React.useState("0");

  React.useEffect(() => {
    if (!employee) {
      return;
    }

    setCheckInTime(employee.schedule.checkInTime);
    setCheckOutTime(employee.schedule.checkOutTime);
    setMonthlyWage(String(employee.monthlyWage ?? 0));
  }, [employee]);

  function handleSave() {
    onSave({
      monthlyWage: Number(monthlyWage) || 0,
      schedule: { checkInTime, checkOutTime },
    });
  }

  if (!employee) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee Payroll</DialogTitle>
          <DialogDescription>
            Update the monthly wage and schedule used for attendance and salary calculation.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="font-medium text-foreground">{employee.fullName}</p>
          <p className="text-sm text-muted-foreground">{employee.department}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Monthly Wage
            </Label>
            <Input
              type="number"
              min="0"
              value={monthlyWage}
              onChange={(event) => setMonthlyWage(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Scheduled Check-in Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="time"
                value={checkInTime}
                onChange={(event) => setCheckInTime(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Scheduled Check-out Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="time"
                value={checkOutTime}
                onChange={(event) => setCheckOutTime(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
