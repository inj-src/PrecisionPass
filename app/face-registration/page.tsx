"use client";

import * as React from "react";
import {
  Camera,
  Upload,
  Save,
  CheckCircle2,
  Circle,
  User,
  ScanFace,
  ArrowRight,
  ArrowLeft,
  Clock,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
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
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Employee Details", icon: User },
  { id: 2, label: "Facial Data", icon: ScanFace },
];

export default function FaceRegistrationPage() {
  const [currentStep, setCurrentStep] = React.useState(1);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Header */}
      <PageHeader
        title="Face Registration"
        description="Register new employee for the attendance system."
      />

      {/* Progress Stepper */}
      <div className="border-b bg-muted/30 px-6 py-6 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  {/* Step Item */}
                  <div
                    className={cn(
                      "flex items-center gap-3 cursor-pointer transition-all duration-200",
                      isCurrent && "scale-105"
                    )}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    {/* Step Circle */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        isCompleted && "bg-success text-success-foreground",
                        isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="hidden sm:block">
                      <p
                        className={cn(
                          "text-xs font-medium uppercase tracking-wide",
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        Step {step.id}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isCurrent ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4 sm:mx-8">
                      <div className="h-1 isolate rounded-full bg-muted relative overflow-hidden">
                        <div
                          className={cn(
                            "bg-gray-300 -z-10 absolute inset-0",
                          )}
                        />
                        <div
                          className={cn(
                            "h-full z-20 bg-success transition-all duration-500 ease-out",
                            isCompleted ? "w-full" : "w-0"
                          )}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-auto p-6 px-4 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section 1: Employee Details */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Employee Details</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Please fill in the personal information accurately.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6  sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* First Name */}
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input id="firstName" placeholder="e.g. Jane" />
                  </Field>

                  {/* Last Name */}
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input id="lastName" placeholder="e.g. Doe" />
                  </Field>

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
                        <SelectItem value="engineering">Engineering</SelectItem>
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
                    <RadioGroup defaultValue="standard" className="flex gap-6 mt-2">
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

                  {/* Scheduled Check-in Time */}
                  <Field>
                    <FieldLabel htmlFor="checkInTime">Scheduled Check-in Time</FieldLabel>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="checkInTime"
                        placeholder="09:00 AM"
                        defaultValue="09:00 AM"
                        className="pl-9"
                      />
                    </div>
                  </Field>

                  {/* Scheduled Check-out Time */}
                  <Field>
                    <FieldLabel htmlFor="checkOutTime">Scheduled Check-out Time</FieldLabel>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="checkOutTime"
                        placeholder="06:00 PM"
                        defaultValue="06:00 PM"
                        className="pl-9"
                      />
                    </div>
                  </Field>

                  {/* Hourly Rate */}
                  <Field>
                    <FieldLabel htmlFor="hourlyRate">Hourly Rate ($)</FieldLabel>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="hourlyRate"
                        type="text"
                        placeholder="45.50"
                        defaultValue="45.50"
                        className="pl-9"
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Facial Data */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Facial Data</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Capture or upload facial data for biometric recognition.
                </p>
              </div>

              <div className="bg-card border rounded-xl p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Face Scan Preview */}
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      {/* Corner brackets with animation */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/60 rounded-tl-xl animate-pulse" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/60 rounded-tr-xl animate-pulse" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/60 rounded-bl-xl animate-pulse" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/60 rounded-br-xl animate-pulse" />

                      {/* Face placeholder */}
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                        <svg
                          width="64"
                          height="64"
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
                    <p className="text-sm text-muted-foreground mt-6">
                      Position your face within the frame
                    </p>
                  </div>

                  {/* Action Buttons & Instructions */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Button size="lg" className="w-full">
                        <Camera className="h-5 w-5 mr-2" />
                        Activate Camera
                      </Button>
                      <Button variant="outline" size="lg" className="w-full">
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Photo
                      </Button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm">Photo Guidelines</h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-center gap-2">
                          <Circle className="h-1.5 w-1.5 fill-current" />
                          Ensure good lighting on your face
                        </li>
                        <li className="flex items-center gap-2">
                          <Circle className="h-1.5 w-1.5 fill-current" />
                          Remove glasses or accessories
                        </li>
                        <li className="flex items-center gap-2">
                          <Circle className="h-1.5 w-1.5 fill-current" />
                          Look directly at the camera
                        </li>
                        <li className="flex items-center gap-2">
                          <Circle className="h-1.5 w-1.5 fill-current" />
                          Keep a neutral expression
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={handleNext} className="gap-2">
                Next Step
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Complete Registration
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
