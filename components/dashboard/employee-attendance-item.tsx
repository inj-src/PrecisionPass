import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AttendanceStatus = "present" | "late" | "absent";

export interface EmployeeAttendance {
  id: number;
  fullName: string;
  department: string;
  status: AttendanceStatus;
  scheduledCheckInTime: string;
  checkInTime?: string | null;
  faceEnrolled: boolean;
  sampleCount: number;
}

interface EmployeeAttendanceItemProps {
  employee: EmployeeAttendance;
}

const statusConfig = {
  present: {
    label: "Present",
    className: "bg-emerald-500 hover:bg-emerald-500 text-white border-emerald-500",
  },
  late: {
    label: "Late",
    className: "bg-amber-500 hover:bg-amber-500 text-white border-amber-500",
  },
  absent: {
    label: "Absent",
    className: "bg-red-500 hover:bg-red-500 text-white border-red-500",
  },
};

export function EmployeeAttendanceItem({ employee }: EmployeeAttendanceItemProps) {
  const config = statusConfig[employee.status];
  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-start justify-between gap-3 px-4 py-4 sm:items-center lg:px-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground sm:text-base">
                {employee.fullName}
              </span>
              <Badge className={cn("border-transparent text-white", config.className)}>
                {config.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="whitespace-nowrap text-xs leading-none text-muted-foreground sm:text-sm">
                {employee.department}
              </span>
              <span className="whitespace-nowrap text-xs leading-none text-muted-foreground sm:text-sm">
                {employee.faceEnrolled ? `${employee.sampleCount} samples` : "Not enrolled"}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-medium text-foreground sm:text-base">
            {employee.checkInTime ?? "--"}
          </p>
          <p
            className={cn(
              "text-[10px] sm:text-xs",
              employee.status === "late" ? "text-amber-600" : "text-muted-foreground",
            )}
          >
            Scheduled {employee.scheduledCheckInTime}
          </p>
        </div>
      </div>
    </div>
  );
}
