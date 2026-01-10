
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
      {/* Sidebar Trigger (Mobile) */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Attendance Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of employee check-ins for today</p>
        </div>
      </div>
    </header>
  );
}
