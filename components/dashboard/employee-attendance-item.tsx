import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AttendanceStatus = "present" | "late" | "absent";

export interface EmployeeAttendance {
  id: string;
  name: string;
  department: string;
  avatar?: string;
  initials: string;
  status: AttendanceStatus;
  matchPercentage?: number;
  checkInTime?: string;
  lateMinutes?: number;
  noScan?: boolean;
}

interface EmployeeAttendanceItemProps {
  employee: EmployeeAttendance;
  onLogReason?: (id: string) => void;
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

export function EmployeeAttendanceItem({
  employee,
}: EmployeeAttendanceItemProps) {
  const config = statusConfig[employee.status];
  return (
    <div className="flex items-start sm:items-center justify-between py-4 border-b last:border-b-0 gap-3">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Avatar with online indicator for present */}
        <div className="relative shrink-0">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs sm:text-sm">
              {employee.initials}
            </AvatarFallback>
          </Avatar>
          {employee.status === "present" && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 border-2 border-card" />
          )}
        </div>

        {/* Employee Info */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
            <span className="font-medium text-foreground text-sm sm:text-base">{employee.name}</span>
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              / {employee.department}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Badge variant="outline" className={cn("text-[10px] sm:text-xs px-1.5 sm:px-2", config.className)}>
              {config.label}
            </Badge>
            {employee.matchPercentage !== undefined && (
              <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <svg
                  className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {employee.matchPercentage}%
              </span>
            )}
            {employee.noScan && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">No scan</span>
            )}
          </div>
        </div>
      </div>

      {/* Time / Action */}
      <div className="text-right shrink-0">
        <p className="font-medium text-foreground text-sm sm:text-base">{employee.checkInTime}</p>
        <p
          className={cn(
            "text-[10px] sm:text-xs",
            employee.lateMinutes
              ? "text-amber-600"
              : "text-muted-foreground"
          )}
        >
          {employee.lateMinutes
            ? `+${employee.lateMinutes}m late`
            : "Check-in"}
        </p>
      </div>
    </div>
  );
}
