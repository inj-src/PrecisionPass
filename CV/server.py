from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date, datetime
import os
from typing import Literal

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from CV import data, vision


TIME_PATTERN = r"^\d{2}:\d{2}$"


class Schedule(BaseModel):
    checkInTime: str = Field(pattern=TIME_PATTERN)
    checkOutTime: str = Field(pattern=TIME_PATTERN)


class EmployeeCreate(BaseModel):
    fullName: str = Field(min_length=1, max_length=120)
    department: str = Field(min_length=1, max_length=120)
    schedule: Schedule


class EmployeeUpdate(BaseModel):
    fullName: str | None = Field(default=None, min_length=1, max_length=120)
    department: str | None = Field(default=None, min_length=1, max_length=120)
    schedule: Schedule | None = None


class EmployeeRecord(EmployeeCreate):
    id: int
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
    fullName: str | None = None
    department: str | None = None
    confidence: float | None = None
    attendanceStatus: Literal["present", "late"] | None = None
    attendanceRecorded: bool = False


class AttendanceEvent(BaseModel):
    id: int
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
    department: str | None = None
    confidence: float | None = None
    attendanceStatus: Literal["present", "late"] | None = None
    attendanceRecorded: bool = False


class RecognitionFrameResponse(BaseModel):
    detections: list[RecognitionDetection]
    createdAttendance: list[AttendanceEvent]


class AttendanceTodayItem(BaseModel):
    id: int
    fullName: str
    department: str
    status: Literal["present", "late", "absent"]
    scheduledCheckInTime: str
    checkInTime: str | None = None
    faceEnrolled: bool
    sampleCount: int


def allowed_origins() -> list[str]:
    raw = os.getenv(
        "CV_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    data.ensure_data_files()
    app.state.vision_state = vision.create_vision_state()
    vision.retrain_model(app.state.vision_state)
    yield


app = FastAPI(
    title="Precision Pass CV API",
    description="Minimal JSON-backed employee registry and face-recognition API for the Precision Pass demo.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> dict:
    vision_state = app.state.vision_state
    return {
        "status": "ok",
        "modelReady": vision.is_model_ready(vision_state),
        "employeeCount": len(data.list_employees()),
        "sampleCount": vision_state.sample_count,
    }


@app.get("/employees", response_model=list[EmployeeRecord])
def list_employees() -> list[dict]:
    return data.list_employees()


@app.post("/employees", response_model=EmployeeRecord, status_code=201)
def create_employee(payload: EmployeeCreate) -> dict:
    return data.create_employee(payload.model_dump())


@app.patch("/employees/{employee_id}", response_model=EmployeeRecord)
def update_employee(employee_id: str, payload: EmployeeUpdate) -> dict:
    try:
        return data.update_employee(employee_id, payload.model_dump(exclude_none=True))
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Employee not found.") from error


@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: str) -> None:
    try:
        data.delete_employee(employee_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Employee not found.") from error

    vision.retrain_model(app.state.vision_state)
    return None


@app.post("/employees/{employee_id}/enroll", response_model=EnrollmentResponse)
async def enroll_employee(
    employee_id: str,
    frames: list[UploadFile] = File(...),
) -> dict:
    employee = data.get_employee(employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found.")

    frame_bytes = [await frame.read() for frame in frames]
    return vision.enroll_employee(app.state.vision_state, employee, frame_bytes)


@app.post("/recognition/frame", response_model=RecognitionFrameResponse)
async def recognize_frame(frame: UploadFile = File(...)) -> dict:
    frame_bytes = await frame.read()

    try:
        return vision.recognize_frame(app.state.vision_state, frame_bytes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/recognitions/recent", response_model=list[RecognitionEvent])
def recent_recognitions(limit: int = Query(default=20, ge=1, le=100)) -> list[dict]:
    return vision.recent_events(app.state.vision_state, limit)


@app.get("/attendance/today", response_model=list[AttendanceTodayItem])
def today_attendance(target_date: str | None = Query(default=None, alias="date")) -> list[dict]:
    employees = data.list_employees()
    date_value = target_date or date.today().isoformat()

    try:
        datetime.strptime(date_value, "%Y-%m-%d")
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Date must be YYYY-MM-DD.") from error

    attendance_by_employee = {
        int(record["id"]): record
        for record in data.list_attendance()
        if record["date"] == date_value
    }

    response: list[dict] = []
    for employee in employees:
        attendance_record = attendance_by_employee.get(employee["id"])
        check_in_time = None
        status = "absent"

        if attendance_record is not None:
            parsed_timestamp = datetime.fromisoformat(attendance_record["timestamp"])
            check_in_time = parsed_timestamp.strftime("%H:%M")
            status = attendance_record["status"]

        response.append(
            {
                "id": employee["id"],
                "fullName": employee["fullName"],
                "department": employee["department"],
                "status": status,
                "scheduledCheckInTime": employee["schedule"]["checkInTime"],
                "checkInTime": check_in_time,
                "faceEnrolled": employee["faceEnrolled"],
                "sampleCount": employee["sampleCount"],
            }
        )

    return response
