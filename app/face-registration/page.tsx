"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Save,
  ScanFace,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  createEmployee,
  enrollEmployee,
  getHealth,
  updateEmployee,
  type EmployeeRecord,
  type EnrollmentResponse,
  type HealthResponse,
} from "@/lib/cv-api";
import { captureVideoFrame } from "@/lib/video-frame";

const steps = [
  { id: 1, label: "Employee Details", icon: User },
  { id: 2, label: "Facial Data", icon: ScanFace },
];

export default function FaceRegistrationPage() {
  const router = useRouter();
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    employeeId: "",
    fullName: "",
    department: "",
    checkInTime: "09:00",
    checkOutTime: "18:00",
  });
  const [employee, setEmployee] = React.useState<EmployeeRecord | null>(null);
  const [health, setHealth] = React.useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = React.useState(true);
  const [cameraReady, setCameraReady] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [enrolling, setEnrolling] = React.useState(false);
  const [enrollmentResult, setEnrollmentResult] = React.useState<EnrollmentResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const hasEnrollmentSamples = Boolean(employee && employee.sampleCount > 0);

  const loadHealth = React.useCallback(async () => {
    try {
      setLoadingHealth(true);
      setHealth(await getHealth());
      setError(null);
    } catch (healthError) {
      setHealth(null);
      setError(
        healthError instanceof Error ? healthError.message : "Failed to reach the CV backend.",
      );
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  React.useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  React.useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function updateField(name: keyof typeof formData, value: string) {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function startCamera() {
    if (cameraReady) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraReady(true);
      setError(null);
    } catch (cameraError) {
      setError(
        cameraError instanceof Error ? cameraError.message : "Failed to access the browser camera.",
      );
    }
  }

  async function handleDetailsSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSubmitting(true);
    setEnrollmentResult(null);

    try {
      const payload = {
        employeeId: formData.employeeId.trim(),
        fullName: formData.fullName.trim(),
        department: formData.department.trim(),
        schedule: {
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
        },
      };

      const savedEmployee = employee
        ? await updateEmployee(employee.id, {
            fullName: payload.fullName,
            department: payload.department,
            schedule: payload.schedule,
          })
        : await createEmployee(payload);

      setEmployee(savedEmployee);
      setError(null);
      setCurrentStep(2);
      await startCamera();
      await loadHealth();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save the employee.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEnrollment() {
    if (!employee || !videoRef.current) {
      return;
    }

    try {
      setEnrolling(true);
      setError(null);
      const frames: Blob[] = [];

      for (let index = 0; index < 18; index += 1) {
        frames.push(await captureVideoFrame(videoRef.current, { maxWidth: 720, quality: 0.85 }));
        await new Promise((resolve) => window.setTimeout(resolve, 140));
      }

      const result = await enrollEmployee(employee.id, frames);
      setEmployee(result.employee);
      setEnrollmentResult(result);
      await loadHealth();
    } catch (enrollError) {
      setError(
        enrollError instanceof Error ? enrollError.message : "Failed to enroll face samples.",
      );
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <PageHeader
        title="Face Registration"
        description="Register employees in two steps: details first, then browser-based facial enrollment."
      />

      <div className="bg-muted/30 px-6 py-6 border-b">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-3 transition-all duration-200 cursor-pointer",
                      isCurrent && "scale-105",
                    )}
                    onClick={() => {
                      if (step.id === 1 || employee) {
                        setCurrentStep(step.id);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "flex justify-center items-center rounded-full w-12 h-12 transition-all duration-300",
                        isCompleted && "bg-success text-success-foreground",
                        isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>

                    <div className="hidden sm:block text-left">
                      <p
                        className={cn(
                          "font-medium text-xs uppercase tracking-wide",
                          isCurrent ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        Step {step.id}
                      </p>
                      <p
                        className={cn(
                          "font-semibold text-sm",
                          isCurrent ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  </button>

                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4 sm:mx-8">
                      <div className="isolate relative bg-muted rounded-full h-1 overflow-hidden">
                        <div className="-z-10 absolute inset-0 bg-gray-300" />
                        <div
                          className={cn(
                            "bg-success h-full transition-all duration-500 ease-out",
                            isCompleted ? "w-full" : "w-0",
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

      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          {currentStep === 1 && (
            <div className="slide-in-from-left-4 animate-in duration-300 fade-in">
              <Card className="py-0">
                <CardHeader className="py-4 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Save className="w-5 h-5" />
                    Employee Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleDetailsSubmit} className="space-y-5">
                    <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
                      <Field>
                        <FieldLabel htmlFor="employeeId">Employee ID</FieldLabel>
                        <Input
                          id="employeeId"
                          value={formData.employeeId}
                          onChange={(event) => updateField("employeeId", event.target.value)}
                          placeholder="EMP-001"
                          required
                          disabled={Boolean(employee)}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(event) => updateField("fullName", event.target.value)}
                          placeholder="Jane Doe"
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="department">Department</FieldLabel>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(event) => updateField("department", event.target.value)}
                          placeholder="Engineering"
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="checkInTime">Scheduled Check-in</FieldLabel>
                        <Input
                          id="checkInTime"
                          type="time"
                          value={formData.checkInTime}
                          onChange={(event) => updateField("checkInTime", event.target.value)}
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="checkOutTime">Scheduled Check-out</FieldLabel>
                        <Input
                          id="checkOutTime"
                          type="time"
                          value={formData.checkOutTime}
                          onChange={(event) => updateField("checkOutTime", event.target.value)}
                          required
                        />
                      </Field>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 w-4 h-4" />
                            {employee ? "Save & Continue" : "Create & Continue"}
                          </>
                        )}
                      </Button>

                      {employee && <Badge variant="secondary">Created {employee.employeeId}</Badge>}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="slide-in-from-right-4 animate-in duration-300 fade-in">
              <div className="gap-6 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <Card className="py-0">
                  <CardHeader className="py-4 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ScanFace className="w-5 h-5" />
                      Face Enrollment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="bg-black border rounded-xl overflow-hidden">
                      <div className="relative aspect-video">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className={`absolute inset-0 h-full w-full object-cover ${cameraReady ? "opacity-100" : "opacity-0"}`}
                        />
                        {!cameraReady && (
                          <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 px-6 text-zinc-300 text-center">
                            <Camera className="w-10 h-10 text-zinc-500" />
                            <p className="text-sm">
                              Start the browser camera to capture enrollment samples.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="outline" onClick={() => void startCamera()}>
                        <Camera className="mr-2 w-4 h-4" />
                        {cameraReady ? "Camera Ready" : "Start Camera"}
                      </Button>

                      <Button
                        onClick={() => void handleEnrollment()}
                        disabled={!employee || !cameraReady || enrolling}
                      >
                        {enrolling ? (
                          <>
                            <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
                            Capturing 18 Samples
                          </>
                        ) : (
                          <>
                            <ScanFace className="mr-2 w-4 h-4" />
                            Capture And Enroll
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="py-0">
                  <CardHeader className="py-4 border-b">
                    <CardTitle className="text-lg">Registration Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="bg-muted/30 p-4 border rounded-lg text-sm">
                      <p className="font-medium text-foreground">
                        {formData.fullName || "Unnamed employee"}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {formData.employeeId || "No employee ID"} •{" "}
                        {formData.department || "No department"}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Schedule {formData.checkInTime} - {formData.checkOutTime}
                      </p>
                    </div>

                    <div className="bg-muted/30 p-4 border rounded-lg text-muted-foreground text-sm">
                      <p className="font-medium text-foreground">Enrollment flow</p>
                      <p className="mt-1">
                        Keep the facing the camera and make small head movements while the app
                        captures 18 frames for upload.
                      </p>
                    </div>

                    {employee && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={employee.faceEnrolled ? "default" : "outline"}>
                          {employee.faceEnrolled
                            ? `${employee.sampleCount} samples saved`
                            : "No samples yet"}
                        </Badge>
                      </div>
                    )}

                    {enrollmentResult && (
                      <div className="bg-success/5 p-4 border border-success/30 rounded-lg">
                        <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          Enrollment complete
                        </div>
                        <p className="mt-2 text-muted-foreground text-sm">
                          Accepted {enrollmentResult.acceptedCount} sample
                          {enrollmentResult.acceptedCount === 1 ? "" : "s"} and rejected{" "}
                          {enrollmentResult.rejectedCount}.
                        </p>
                        {enrollmentResult.rejectedReasons.length > 0 && (
                          <ul className="space-y-1 mt-3 text-muted-foreground text-xs">
                            {enrollmentResult.rejectedReasons.slice(0, 5).map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              disabled={currentStep === 1 || submitting || enrolling}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Previous
            </Button>

            {currentStep === 1 ? (
              <Button onClick={() => void handleDetailsSubmit()} disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/employes")}
                disabled={!hasEnrollmentSamples || enrolling}
              >
                <CheckCircle2 className="mr-2 w-4 h-4" />
                Complete Registration
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="bg-destructive/5 mx-auto mt-6 py-4 border-destructive/30 max-w-6xl">
            <CardContent className="flex items-center gap-3 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
