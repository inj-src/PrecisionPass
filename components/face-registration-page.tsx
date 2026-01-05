"use client";

import * as React from "react";
import {
  Search,
  LayoutDashboard,
  CalendarCheck,
  ScanFace,
  Users,
  Settings,
  ChevronDown,
  Camera,
  Upload,
  Save,
  Info,
  CheckCircle2,
  Circle,
  MessageSquare,
} from "lucide-react";

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
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { icon: Search, label: "Search", href: "#" },
  { icon: LayoutDashboard, label: "Dashboard", href: "#" },
  { icon: CalendarCheck, label: "Attendance", href: "#" },
  { icon: ScanFace, label: "Face Registration", href: "#", active: true },
  { icon: Users, label: "Employees", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
];

const checklistItems = [
  { label: "Basic Info", completed: true },
  { label: "Employee ID Assigned", completed: true },
  { label: "Face Scan Complete", completed: false },
  { label: "System Sync", completed: false },
];

export function FaceRegistrationPage() {
  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        {/* Sidebar Header - User Profile */}
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt="Alex Smith" />
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold">
                AS
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
              <span className="font-medium text-foreground">Alex Smith</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </SidebarHeader>

        {/* Sidebar Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.active}
                      tooltip={item.label}
                    >
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer - Help Card */}
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <Card className="bg-muted/50 border-none shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">
                Face Scan Help
              </CardTitle>
              <CardDescription className="text-xs">
                Learn how to properly scan your face for accurate attendance.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between gap-2">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  Learn more
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>©</span>
            <span>2025 Attendance Sys</span>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        <div className="flex flex-col h-full">
          {/* Page Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Face Registration
              </h1>
              <p className="text-sm text-muted-foreground">
                Register new employee facial data for the attendance system.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Details Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employee Details</CardTitle>
                    <CardDescription>
                      Please fill in the personal information accurately.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input id="firstName" placeholder="e.g. Jane" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input id="lastName" placeholder="e.g. Doe" />
                      </Field>
                    </div>

                    {/* Employee ID */}
                    <Field>
                      <FieldLabel htmlFor="employeeId">Employee ID</FieldLabel>
                      <Input
                        id="employeeId"
                        placeholder="EMP-00123"
                        defaultValue="EMP-00123"
                      />
                    </Field>

                    {/* Department */}
                    <Field>
                      <FieldLabel htmlFor="department">Department</FieldLabel>
                      <Select defaultValue="engineering">
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">
                            Engineering
                          </SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {/* Work Email */}
                    <Field>
                      <FieldLabel htmlFor="workEmail">Work Email</FieldLabel>
                      <div className="relative">
                        <Input
                          id="workEmail"
                          type="email"
                          placeholder="jane.doe@company.com"
                          className="pl-10"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                            />
                          </svg>
                        </div>
                      </div>
                    </Field>

                    {/* Access Level */}
                    <Field>
                      <FieldLabel>Access Level</FieldLabel>
                      <RadioGroup
                        defaultValue="standard"
                        className="flex gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standard" id="standard" />
                          <label
                            htmlFor="standard"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Standard
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="admin" id="admin" />
                          <label
                            htmlFor="admin"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Admin
                          </label>
                        </div>
                      </RadioGroup>
                    </Field>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Face Scan & Checklist */}
              <div className="space-y-6">
                {/* Facial Data Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg">Facial Data</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-600 border-amber-200"
                    >
                      Pending
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Face Scan Placeholder */}
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-muted-foreground/40 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-muted-foreground/40 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-muted-foreground/40 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-muted-foreground/40 rounded-br-lg" />

                        {/* Face placeholder */}
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-muted-foreground"
                          >
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                            <circle cx="17" cy="20" r="2" fill="currentColor" />
                            <circle cx="31" cy="20" r="2" fill="currentColor" />
                            <path
                              d="M17 30c2 3 5 4 7 4s5-1 7-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              fill="none"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Click to scan
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        Activate Camera
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                    </div>

                    {/* Help Text */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                      <Info className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>
                        Ensure the employee is facing the camera directly in a
                        well-lit environment. Glasses should be removed for
                        better accuracy.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Registration Checklist Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Registration Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {checklistItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-3">
                          {item.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/40" />
                          )}
                          <span
                            className={`text-sm ${
                              item.completed
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t px-6 py-4 bg-background">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <span>Need assistance?</span>
              <a
                href="#"
                className="text-foreground underline underline-offset-2 hover:text-primary"
              >
                Contact Support
              </a>
            </div>
          </footer>
        </div>

        {/* Floating Chat Button */}
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </SidebarInset>
    </SidebarProvider>
  );
}
