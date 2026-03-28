from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


TIME_PATTERN = r"^\d{2}:\d{2}$"
EMPLOYEE_ID_PATTERN = r"^[A-Za-z0-9_-]+$"


class Schedule(BaseModel):
    checkInTime: str = Field(pattern=TIME_PATTERN)
    checkOutTime: str = Field(pattern=TIME_PATTERN)


class EmployeeCreate(BaseModel):
    employeeId: str = Field(min_length=1, max_length=64, pattern=EMPLOYEE_ID_PATTERN)
    fullName: str = Field(min_length=1, max_length=120)
    department: str = Field(min_length=1, max_length=120)
    schedule: Schedule


class EmployeeUpdate(BaseModel):
    fullName: str | None = Field(default=None, min_length=1, max_length=120)
    department: str | None = Field(default=None, min_length=1, max_length=120)
    schedule: Schedule | None = None


class EmployeeRecord(EmployeeCreate):
    id: str
    faceEnrolled: bool
    sampleCount: int
    createdAt: str
    updatedAt: str


class HealthResponse(BaseModel):
    status: Literal["ok"]
    modelReady: bool
    employeeCount: int
    sampleCount: int


class EnrollmentResponse(BaseModel):
    employee: EmployeeRecord
    acceptedCount: int
    rejectedCount: int
    rejectedReasons: list[str]


class DetectionBox(BaseModel):
    top: float
    left: float
    width: float
    height: float


class RecognitionDetection(BaseModel):
    status: Literal["matched", "unknown"]
    box: DetectionBox
    employeeId: str | None = None
    fullName: str | None = None
    department: str | None = None
    confidence: float | None = None
    attendanceStatus: Literal["present", "late"] | None = None
    attendanceRecorded: bool = False


class AttendanceEvent(BaseModel):
    id: str
    employeeId: str
    fullName: str
    timestamp: str
    date: str
    status: Literal["present", "late"]
    confidence: float


class RecognitionEvent(BaseModel):
    id: str
    type: Literal["recognized", "unknown"]
    timestamp: str
    fullName: str | None = None
    employeeId: str | None = None
    department: str | None = None
    confidence: float | None = None
    attendanceStatus: Literal["present", "late"] | None = None
    attendanceRecorded: bool = False


class RecognitionFrameResponse(BaseModel):
    detections: list[RecognitionDetection]
    createdAttendance: list[AttendanceEvent]


class AttendanceTodayItem(BaseModel):
    id: str
    employeeId: str
    fullName: str
    department: str
    status: Literal["present", "late", "absent"]
    scheduledCheckInTime: str
    checkInTime: str | None = None
    faceEnrolled: bool
    sampleCount: int

