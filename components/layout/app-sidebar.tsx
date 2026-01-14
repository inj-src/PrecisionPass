"use client";

import {
  LayoutDashboard,
  Users,
  ScanFace,
  Video,
  ApertureIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";


const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Video, label: "Live Monitor", href: "/live-monitor" },
  { icon: Users, label: "Employees", href: "/employees" },
  { icon: ScanFace, label: "Face Registry", href: "/face-registration" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sidebar Header - User Profile */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <ApertureIcon />
          <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
            <span className="font-medium text-xl text-foreground">Precision Pass</span>
          </div>
          {isMobile && <SidebarTrigger className="ml-auto" />}
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
    </Sidebar>
  );
}
