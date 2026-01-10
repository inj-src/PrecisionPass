"use client";

import {
  LayoutDashboard,
  Users,
  ScanFace,
  Settings,
  LogOut,
  ChevronDown,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";


const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Video, label: "Live Monitor", href: "/live-monitor" },
  { icon: Users, label: "Employees", href: "/employees" },
  { icon: ScanFace, label: "Face Registry", href: "/face-registration" },
];

const bottomNavItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: LogOut, label: "Logout", href: "/logout" },
];

interface AppSidebarProps {
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
}

export function AppSidebar({ user = { name: "Alex Smith", initials: "AS" } }: AppSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sidebar Header - User Profile */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          {isMobile && <SidebarTrigger />}
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-linear-to-br from-amber-400 to-orange-500 text-white font-semibold text-sm">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
            <span className="font-medium text-foreground">{user.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="mt-auto">
        {/* System Health Card */}
        {/* <div className="px-4 pb-4 group-data-[collapsible=icon]:hidden">
          <Card className="bg-muted/50 border-none shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">System Health</CardTitle>
              <CardDescription className="text-xs">
                Facial recognition services are running optimally.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                </div>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  View logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div> */}

        <SidebarSeparator />

        {/* Bottom Nav Items */}
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Copyright */}
        <div className="px-4 pb-4 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground">© 2025 AttendSys Inc.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
