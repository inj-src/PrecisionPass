import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertSeverity = "info" | "warning" | "error" | "success";

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp?: string;
}

interface SystemAlertsProps {
  alerts: SystemAlert[];
}

const severityConfig = {
  info: {
    icon: Info,
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    iconClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-200 dark:border-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    iconClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
  error: {
    icon: AlertCircle,
    bgClass: "bg-red-50 dark:bg-red-950/30",
    iconClass: "text-red-600 dark:text-red-400",
    borderClass: "border-red-200 dark:border-red-800",
  },
  success: {
    icon: CheckCircle2,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-200 dark:border-emerald-800",
  },
};

export function SystemAlerts({ alerts }: SystemAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">System Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border",
                config.bgClass,
                config.borderClass
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.iconClass)} />
              <div className="space-y-1">
                <p className="font-medium text-foreground">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
