from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta
import calendar
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
    monthlyWage: float = Field(default=0, ge=0)
    schedule: Schedule


class EmployeeUpdate(BaseModel):
    fullName: str | None = Field(default=None, min_length=1, max_length=120)
    department: str | None = Field(default=None, min_length=1, max_length=120)
    monthlyWage: float | None = Field(default=None, ge=0)
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


class LeaveCreate(BaseModel):
    employeeId: int
    startDate: str
    endDate: str
    reason: str = Field(min_length=1, max_length=300)


class LeaveUpdate(BaseModel):
    employeeId: int | None = None
    startDate: str | None = None
    endDate: str | None = None
    reason: str | None = Field(default=None, min_length=1, max_length=300)


class LeaveRecord(LeaveCreate):
    id: int
    employeeName: str
    status: Literal["approved"]
    createdAt: str
    updatedAt: str


class PayrollItem(BaseModel):
    employeeId: int
    fullName: str
    department: str
    monthlyWage: float
    dailyRate: float
    presentDays: int
    paidLeaveDays: int
    absentDays: int
    deduction: float
    netPay: float


class PayrollResponse(BaseModel):
    month: str
    totalGross: float
    totalDeduction: float
    totalNetPay: float
    employees: list[PayrollItem]


def allowed_origins() -> list[str]:
    raw = os.getenv(
        "CV_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def parse_date(value: str) -> date:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Date must be YYYY-MM-DD.") from error


def validate_leave_dates(start_date: str, end_date: str) -> None:
    start = parse_date(start_date)
    end = parse_date(end_date)
    if end < start:
        raise HTTPException(status_code=400, detail="Leave end date must be after start date.")


def month_dates(month: str) -> list[date]:
    try:
        year, month_number = [int(part) for part in month.split("-")]
        last_day = calendar.monthrange(year, month_number)[1]
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Month must be YYYY-MM.") from error

    start = date(year, month_number, 1)
    return [start + timedelta(days=offset) for offset in range(last_day)]


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
def update_employee(employee_id: int, payload: EmployeeUpdate) -> dict:
    try:
        return data.update_employee(employee_id, payload.model_dump(exclude_none=True))
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Employee not found.") from error


@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: int) -> None:
    try:
        data.delete_employee(employee_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Employee not found.") from error

    vision.retrain_model(app.state.vision_state)
    return None


@app.post("/employees/{employee_id}/enroll", response_model=EnrollmentResponse)
async def enroll_employee(
    employee_id: int,
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


@app.get("/leaves", response_model=list[LeaveRecord])
def list_leaves() -> list[dict]:
    return data.list_leaves()


@app.post("/leaves", response_model=LeaveRecord, status_code=201)
def create_leave(payload: LeaveCreate) -> dict:
    validate_leave_dates(payload.startDate, payload.endDate)
    try:
        return data.create_leave(payload.model_dump())
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Employee not found.") from error


@app.patch("/leaves/{leave_id}", response_model=LeaveRecord)
def update_leave(leave_id: int, payload: LeaveUpdate) -> dict:
    update_data = payload.model_dump(exclude_none=True)
    existing_leave = next(
        (leave for leave in data.list_leaves() if leave["id"] == leave_id),
        None,
    )
    if existing_leave is None:
        raise HTTPException(status_code=404, detail="Leave not found.")

    start_date = update_data.get("startDate", existing_leave["startDate"])
    end_date = update_data.get("endDate", existing_leave["endDate"])
    validate_leave_dates(start_date, end_date)

    try:
        return data.update_leave(leave_id, update_data)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Employee not found.") from error


@app.delete("/leaves/{leave_id}", status_code=204)
def delete_leave(leave_id: int) -> None:
    try:
        data.delete_leave(leave_id)
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Leave not found.") from error
    return None


@app.get("/payroll/monthly", response_model=PayrollResponse)
def monthly_payroll(month: str = Query(..., pattern=r"^\d{4}-\d{2}$")) -> dict:
    dates = month_dates(month)
    date_values = {current_date.isoformat() for current_date in dates}
    attendance_records = data.list_attendance()
    leave_records = data.list_leaves()

    response_items: list[dict] = []
    for employee in data.list_employees():
        employee_id = employee["id"]
        present_dates = {
            record["date"]
            for record in attendance_records
            if record["id"] == employee_id and record["date"] in date_values
        }

        paid_leave_dates: set[str] = set()
        for leave in leave_records:
            if leave["employeeId"] != employee_id or leave["status"] != "approved":
                continue
            leave_start = parse_date(leave["startDate"])
            leave_end = parse_date(leave["endDate"])
            for current_date in dates:
                current_date_value = current_date.isoformat()
                if leave_start <= current_date <= leave_end and current_date_value not in present_dates:
                    paid_leave_dates.add(current_date_value)

        absent_days = len(date_values - present_dates - paid_leave_dates)
        monthly_wage = float(employee.get("monthlyWage", 0))
        daily_rate = monthly_wage / 30
        deduction = absent_days * daily_rate
        net_pay = max(monthly_wage - deduction, 0)

        response_items.append(
            {
                "employeeId": employee_id,
                "fullName": employee["fullName"],
                "department": employee["department"],
                "monthlyWage": round(monthly_wage, 2),
                "dailyRate": round(daily_rate, 2),
                "presentDays": len(present_dates),
                "paidLeaveDays": len(paid_leave_dates),
                "absentDays": absent_days,
                "deduction": round(deduction, 2),
                "netPay": round(net_pay, 2),
            }
        )

    return {
        "month": month,
        "totalGross": round(sum(item["monthlyWage"] for item in response_items), 2),
        "totalDeduction": round(sum(item["deduction"] for item in response_items), 2),
        "totalNetPay": round(sum(item["netPay"] for item in response_items), 2),
        "employees": response_items,
    }


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
