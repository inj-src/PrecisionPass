"use client";

import * as React from "react";
import { Clock, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

interface EmployeeScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    name: string;
    avatar?: string;
    initials: string;
    employeeId: string;
    department: string;
  } | null;
  onSave: (data: {
    checkInTime: string;
    checkOutTime: string;
    hourlyRate: string;
  }) => void;
}

export function EmployeeScheduleModal({
  open,
  onOpenChange,
  employee,
  onSave,
}: EmployeeScheduleModalProps) {
  const [checkInTime, setCheckInTime] = React.useState("09:00 AM");
  const [checkOutTime, setCheckOutTime] = React.useState("06:00 PM");
  const [hourlyRate, setHourlyRate] = React.useState("45.50");

  function handleSave() {
    onSave({ checkInTime, checkOutTime, hourlyRate });
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee Schedule & Rate</DialogTitle>
        </DialogHeader>

        {/* Employee Info */}
        <div className="flex items-center gap-3 py-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
              {employee.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{employee.name}</p>
            <p className="text-sm text-muted-foreground">
              {employee.employeeId} • {employee.department}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Scheduled Check-in Time */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Scheduled Check-in Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="pl-9 pr-9"
                placeholder="09:00 AM"
              />
              <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Scheduled Check-out Time */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Scheduled Check-out Time
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                ⏱
              </div>
              <Input
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="pl-9 pr-9"
                placeholder="06:00 PM"
              />
              <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hourly Rate ($)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="pl-9"
                placeholder="45.50"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
