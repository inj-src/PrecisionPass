export interface Schedule {
  checkInTime: string;
  checkOutTime: string;
}

export interface EmployeeRecord {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
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
  employeeId: string | null;
  fullName: string | null;
  department: string | null;
  confidence: number | null;
  attendanceStatus: "present" | "late" | null;
  attendanceRecorded: boolean;
}

export interface AttendanceEvent {
  id: string;
  employeeId: string;
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
  employeeId: string | null;
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
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  status: "present" | "late" | "absent";
  scheduledCheckInTime: string;
  checkInTime: string | null;
  faceEnrolled: boolean;
  sampleCount: number;
}

export interface EmployeeCreateInput {
  employeeId: string;
  fullName: string;
  department: string;
  schedule: Schedule;
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
  employeeId: string,
  input: Partial<Pick<EmployeeRecord, "fullName" | "department">> & { schedule?: Schedule },
): Promise<EmployeeRecord> {
  return request<EmployeeRecord>(`/employees/${employeeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function enrollEmployee(
  employeeId: string,
  frames: Blob[],
): Promise<EnrollmentResponse> {
  const formData = new FormData();
  frames.forEach((frame, index) => {
    formData.append("frames", frame, `frame-${index + 1}.jpg`);
  });

  return request<EnrollmentResponse>(`/employees/${employeeId}/enroll`, {
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
