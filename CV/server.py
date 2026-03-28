from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date, datetime
import os

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from CV.recognition import RecognitionService
from CV.schemas import (
    AttendanceTodayItem,
    EmployeeCreate,
    EmployeeRecord,
    EmployeeUpdate,
    EnrollmentResponse,
    HealthResponse,
    RecognitionEvent,
    RecognitionFrameResponse,
)
from CV.storage import JsonStorage


def _allowed_origins() -> list[str]:
    raw = os.getenv(
        "CV_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    storage = JsonStorage()
    recognizer = RecognitionService(storage)
    recognizer.retrain()
    app.state.storage = storage
    app.state.recognizer = recognizer
    yield


app = FastAPI(
    title="Precision Pass CV API",
    description="Minimal JSON-backed employee registry and face-recognition API for the Precision Pass demo.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    storage: JsonStorage = app.state.storage
    recognizer: RecognitionService = app.state.recognizer
    return HealthResponse(
        status="ok",
        modelReady=recognizer.is_model_ready(),
        employeeCount=len(storage.list_employees()),
        sampleCount=recognizer.sample_count,
    )


@app.get("/employees", response_model=list[EmployeeRecord])
def list_employees() -> list[EmployeeRecord]:
    storage: JsonStorage = app.state.storage
    return [EmployeeRecord.model_validate(employee) for employee in storage.list_employees()]


@app.post("/employees", response_model=EmployeeRecord, status_code=201)
def create_employee(payload: EmployeeCreate) -> EmployeeRecord:
    storage: JsonStorage = app.state.storage
    try:
        employee = storage.create_employee(payload.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error

    return EmployeeRecord.model_validate(employee)


@app.patch("/employees/{employee_id}", response_model=EmployeeRecord)
def update_employee(employee_id: str, payload: EmployeeUpdate) -> EmployeeRecord:
    storage: JsonStorage = app.state.storage
    try:
        employee = storage.update_employee(employee_id, payload.model_dump(exclude_none=True))
    except KeyError as error:
        raise HTTPException(status_code=404, detail="Employee not found.") from error

    return EmployeeRecord.model_validate(employee)


@app.post("/employees/{employee_id}/enroll", response_model=EnrollmentResponse)
async def enroll_employee(
    employee_id: str,
    frames: list[UploadFile] = File(...),
) -> EnrollmentResponse:
    storage: JsonStorage = app.state.storage
    recognizer: RecognitionService = app.state.recognizer

    employee = storage.get_employee(employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found.")

    frame_bytes = [await frame.read() for frame in frames]
    result = recognizer.enroll_employee(employee, frame_bytes)
    return EnrollmentResponse.model_validate(result)


@app.post("/recognition/frame", response_model=RecognitionFrameResponse)
async def recognize_frame(frame: UploadFile = File(...)) -> RecognitionFrameResponse:
    recognizer: RecognitionService = app.state.recognizer
    frame_bytes = await frame.read()

    try:
        result = recognizer.recognize_frame(frame_bytes)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return RecognitionFrameResponse.model_validate(result)


@app.get("/recognitions/recent", response_model=list[RecognitionEvent])
def recent_recognitions(limit: int = Query(default=20, ge=1, le=100)) -> list[RecognitionEvent]:
    recognizer: RecognitionService = app.state.recognizer
    return [RecognitionEvent.model_validate(event) for event in recognizer.recent_events(limit)]


@app.get("/attendance/today", response_model=list[AttendanceTodayItem])
def today_attendance(target_date: str | None = Query(default=None, alias="date")) -> list[AttendanceTodayItem]:
    storage: JsonStorage = app.state.storage
    employees = storage.list_employees()
    date_value = target_date or date.today().isoformat()

    try:
        datetime.strptime(date_value, "%Y-%m-%d")
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Date must be YYYY-MM-DD.") from error

    attendance_by_employee = {
        record["employeeId"]: record
        for record in storage.list_attendance()
        if record["date"] == date_value
    }

    response: list[AttendanceTodayItem] = []
    for employee in employees:
        record = attendance_by_employee.get(employee["employeeId"])
        check_in_time = None
        status = "absent"
        if record is not None:
            parsed_timestamp = datetime.fromisoformat(record["timestamp"])
            check_in_time = parsed_timestamp.strftime("%H:%M")
            status = record["status"]

        response.append(
            AttendanceTodayItem(
                id=employee["id"],
                employeeId=employee["employeeId"],
                fullName=employee["fullName"],
                department=employee["department"],
                status=status,
                scheduledCheckInTime=employee["schedule"]["checkInTime"],
                checkInTime=check_in_time,
                faceEnrolled=employee["faceEnrolled"],
                sampleCount=employee["sampleCount"],
            )
        )

    return response

