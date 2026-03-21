"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full min-h-screen">
          {children}
        </div>
        
        {/* Floating Chat Button */}
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </SidebarInset>
    </SidebarProvider>
  );
}
