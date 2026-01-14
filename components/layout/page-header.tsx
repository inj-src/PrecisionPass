import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ApertureIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  className,
  children,
}: PageHeaderProps) {

  return (
    <div className="m-4 md:m-0 mb-0 space-y-4">
      <div className="flex items-center gap-3 md:hidden">
        <ApertureIcon />
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
          <span className="font-medium text-base sm:text-xl text-foreground">Precision Pass</span>
        </div>
        <SidebarTrigger className="ml-auto" />
      </div>

      <div
        className={cn(
          "border px-6 py-4 bg-white md:border-x-0 md:border-t-0 rounded-xl md:rounded-none",
          className
        )}
      >
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            <div>
              <h1 className="font-bold text-foreground text-lg sm:text-xl">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right side content */}
          {children && (
            <div className="flex items-center gap-3">{children}</div>
          )}
        </header>
      </div>
    </div>
  );
}
