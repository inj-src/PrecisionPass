import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "warning" | "success" | "destructive";
}

export function StatCard({
  label,
  value,
  subtitle,
  variant = "default",
}: StatCardProps) {
  const valueColorClass = {
    default: "text-foreground",
    warning: "text-warning",
    success: "text-success",
    destructive: "text-destructive",
  }[variant];

  return (
    <Card size="sm">
      <CardContent className="py-0">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
          {label}
        </p>
        <p className={cn("text-2xl font-bold mt-1", valueColorClass)}>
          {value}
          {subtitle && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {subtitle}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
