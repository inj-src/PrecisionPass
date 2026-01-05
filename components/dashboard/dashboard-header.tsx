import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onExport?: () => void;
}

export function DashboardHeader({
  title,
  subtitle,
  searchPlaceholder = "Search employee...",
  onSearch,
  onExport,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9 w-[220px]"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        {/* Export Button */}
        <Button onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </header>
  );
}
