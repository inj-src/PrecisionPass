import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  subtitleIcon?: LucideIcon;
  subtitleVariant?: "default" | "success" | "warning" | "muted";
}

const subtitleVariants = {
  default: "text-primary",
  success: "text-success",
  warning: "text-amber-600",
  muted: "text-muted-foreground",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  subtitleIcon: SubtitleIcon,
  subtitleVariant = "default",
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  subtitleVariants[subtitleVariant]
                )}
              >
                {SubtitleIcon && <SubtitleIcon className="h-3 w-3" />}
                {subtitle}
              </p>
            )}
          </div>
          <div className="text-muted-foreground/50">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
