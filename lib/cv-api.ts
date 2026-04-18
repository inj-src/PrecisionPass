export interface Schedule {
  checkInTime: string;
  checkOutTime: string;
}

export interface EmployeeRecord {
  id: number;
  fullName: string;
  department: string;
  monthlyWage: number;
  schedule: Schedule;
  faceEnrolled: boolean;
  sampleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthResponse {
  status: "ok";
  modelReady: boolean;
  employeeCount: number;
  sampleCount: number;
}

export interface EnrollmentResponse {
  employee: EmployeeRecord;
  acceptedCount: number;
  rejectedCount: number;
  rejectedReasons: string[];
}

export interface DetectionBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface RecognitionDetection {
  status: "matched" | "unknown";
  box: DetectionBox;
  fullName: string | null;
  department: string | null;
  confidence: number | null;
  attendanceStatus: "present" | "late" | null;
  attendanceRecorded: boolean;
}

export interface AttendanceEvent {
  id: number;
  fullName: string;
  timestamp: string;
  date: string;
  status: "present" | "late";
  confidence: number;
}

export interface RecognitionEvent {
  id: string;
  type: "recognized" | "unknown";
  timestamp: string;
  fullName: string | null;
  department: string | null;
  confidence: number | null;
  attendanceStatus: "present" | "late" | null;
  attendanceRecorded: boolean;
}

export interface RecognitionFrameResponse {
  detections: RecognitionDetection[];
  createdAttendance: AttendanceEvent[];
}

export interface AttendanceTodayItem {
  id: number;
  fullName: string;
  department: string;
  status: "present" | "late" | "absent";
  scheduledCheckInTime: string;
  checkInTime: string | null;
  faceEnrolled: boolean;
  sampleCount: number;
}

export interface EmployeeCreateInput {
  fullName: string;
  department: string;
  monthlyWage: number;
  schedule: Schedule;
}

export interface LeaveRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "approved";
  createdAt: string;
  updatedAt: string;
}

export interface LeaveInput {
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface PayrollItem {
  employeeId: number;
  fullName: string;
  department: string;
  monthlyWage: number;
  dailyRate: number;
  presentDays: number;
  paidLeaveDays: number;
  absentDays: number;
  deduction: number;
  netPay: number;
}

export interface PayrollResponse {
  month: string;
  totalGross: number;
  totalDeduction: number;
  totalNetPay: number;
  employees: PayrollItem[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_CV_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        detail = payload.detail;
      }
    } catch {
      // Ignore non-JSON error bodies.
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export async function getEmployees(): Promise<EmployeeRecord[]> {
  return request<EmployeeRecord[]>("/employees");
}

export async function createEmployee(input: EmployeeCreateInput): Promise<EmployeeRecord> {
  return request<EmployeeRecord>("/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateEmployee(
  id: number,
  input: Partial<Pick<EmployeeRecord, "fullName" | "department" | "monthlyWage">> & {
    schedule?: Schedule;
  },
): Promise<EmployeeRecord> {
  return request<EmployeeRecord>(`/employees/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteEmployee(id: number): Promise<void> {
  await request<void>(`/employees/${id}`, {
    method: "DELETE",
  });
}

export async function enrollEmployee(
  id: number,
  frames: Blob[],
): Promise<EnrollmentResponse> {
  const formData = new FormData();
  frames.forEach((frame, index) => {
    formData.append("frames", frame, `frame-${index + 1}.jpg`);
  });

  return request<EnrollmentResponse>(`/employees/${id}/enroll`, {
    method: "POST",
    body: formData,
  });
}

export async function recognizeFrame(frame: Blob): Promise<RecognitionFrameResponse> {
  const formData = new FormData();
  formData.append("frame", frame, "frame.jpg");
  return request<RecognitionFrameResponse>("/recognition/frame", {
    method: "POST",
    body: formData,
  });
}

export async function getRecentRecognitions(limit = 20): Promise<RecognitionEvent[]> {
  return request<RecognitionEvent[]>(`/recognitions/recent?limit=${limit}`);
}

export async function getTodayAttendance(date?: string): Promise<AttendanceTodayItem[]> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return request<AttendanceTodayItem[]>(`/attendance/today${query}`);
}

export async function getLeaves(): Promise<LeaveRecord[]> {
  return request<LeaveRecord[]>("/leaves");
}

export async function createLeave(input: LeaveInput): Promise<LeaveRecord> {
  return request<LeaveRecord>("/leaves", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateLeave(id: number, input: Partial<LeaveInput>): Promise<LeaveRecord> {
  return request<LeaveRecord>(`/leaves/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteLeave(id: number): Promise<void> {
  await request<void>(`/leaves/${id}`, {
    method: "DELETE",
  });
}

export async function getMonthlyPayroll(month: string): Promise<PayrollResponse> {
  return request<PayrollResponse>(`/payroll/monthly?month=${encodeURIComponent(month)}`);
}
