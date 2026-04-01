from __future__ import annotations

from datetime import datetime
import json
from pathlib import Path
import shutil
import uuid


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
EMPLOYEES_PATH = DATA_DIR / "employees.json"
ATTENDANCE_PATH = DATA_DIR / "attendance.json"
FACE_SAMPLES_DIR = DATA_DIR / "face_samples"


def ensure_data_files() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    FACE_SAMPLES_DIR.mkdir(exist_ok=True)
    for path in (EMPLOYEES_PATH, ATTENDANCE_PATH):
        if not path.exists():
            path.write_text("[]\n", encoding="utf-8")


def load_json(path: Path) -> list[dict]:
    ensure_data_files()
    content = path.read_text(encoding="utf-8").strip()
    if not content:
        return []
    return json.loads(content)


def save_json(path: Path, rows: list[dict]) -> None:
    ensure_data_files()
    temp_path = path.with_suffix(path.suffix + ".tmp")
    temp_path.write_text(json.dumps(rows, indent=2) + "\n", encoding="utf-8")
    temp_path.replace(path)


def list_employees() -> list[dict]:
    employees = load_json(EMPLOYEES_PATH)
    return sorted(employees, key=lambda employee: employee["fullName"].lower())


def get_employee(employee_id: int) -> dict | None:
    employees = load_json(EMPLOYEES_PATH)
    for employee in employees:
        if employee["id"] == employee_id:
            return employee
    return None


def create_employee(payload: dict) -> dict:
    employees = load_json(EMPLOYEES_PATH)
    next_id = max((int(current["id"]) for current in employees), default=-1) + 1

    now = datetime.now().isoformat(timespec="seconds")
    employee = {
        "id": next_id,
        "fullName": payload["fullName"],
        "department": payload["department"],
        "schedule": payload["schedule"],
        "faceEnrolled": False,
        "sampleCount": 0,
        "createdAt": now,
        "updatedAt": now,
    }

    employees.append(employee)
    save_json(EMPLOYEES_PATH, employees)

    return employee


def update_employee(employee_id: int, payload: dict) -> dict:
    employees = load_json(EMPLOYEES_PATH)
    for index, employee in enumerate(employees):
        if employee["id"] != employee_id:
            continue

        if payload.get("fullName") is not None:
            employee["fullName"] = payload["fullName"]
        if payload.get("department") is not None:
            employee["department"] = payload["department"]
        if payload.get("schedule") is not None:
            employee["schedule"] = payload["schedule"]
        employee["updatedAt"] = datetime.now().isoformat(timespec="seconds")
        employees[index] = employee
        save_json(EMPLOYEES_PATH, employees)
        return employee

    raise KeyError(employee_id)


def delete_employee(employee_id: int) -> dict:
    employees = load_json(EMPLOYEES_PATH)
    employee_to_delete: dict | None = None
    remaining_employees: list[dict] = []

    for employee in employees:
        if employee["id"] == employee_id:
            employee_to_delete = employee
            continue
        remaining_employees.append(employee)

    if employee_to_delete is None:
        raise KeyError(employee_id)

    attendance_records = load_json(ATTENDANCE_PATH)
    remaining_attendance = [
        record
        for record in attendance_records
        if record["id"] != employee_to_delete["id"]
    ]

    save_json(EMPLOYEES_PATH, remaining_employees)
    save_json(ATTENDANCE_PATH, remaining_attendance)

    sample_dir = FACE_SAMPLES_DIR / str(employee_to_delete["id"])
    if sample_dir.exists():
        shutil.rmtree(sample_dir, ignore_errors=True)

    return employee_to_delete


def face_samples_dir(employee_id: int) -> Path:
    ensure_data_files()
    path = FACE_SAMPLES_DIR / str(employee_id)
    path.mkdir(parents=True, exist_ok=True)
    return path


def update_employee_samples(employee_id: int, sample_count: int) -> dict:
    employees = load_json(EMPLOYEES_PATH)
    for index, employee in enumerate(employees):
        if employee["id"] != employee_id:
            continue

        employee["sampleCount"] = sample_count
        employee["faceEnrolled"] = sample_count > 0
        employee["updatedAt"] = datetime.now().isoformat(timespec="seconds")
        employees[index] = employee
        save_json(EMPLOYEES_PATH, employees)
        return employee

    raise KeyError(employee_id)


def list_attendance() -> list[dict]:
    attendance_records = load_json(ATTENDANCE_PATH)
    return sorted(attendance_records, key=lambda record: record["timestamp"], reverse=True)


def record_attendance_if_first(
    employee: dict,
    *,
    timestamp: datetime,
    status: str,
    confidence: float,
) -> dict | None:
    target_date = timestamp.date().isoformat()

    attendance_records = load_json(ATTENDANCE_PATH)
    already_recorded = any(
        record["id"] == employee["id"] and record["date"] == target_date
        for record in attendance_records
    )
    if already_recorded:
        return None

    attendance_event = {
        # "id": str(uuid.uuid4()),
        "id": employee["id"],
        "fullName": employee["fullName"],
        "timestamp": timestamp.isoformat(timespec="seconds"),
        "date": target_date,
        "status": status,
        "confidence": round(confidence, 2),
    }
    attendance_records.append(attendance_event)
    save_json(ATTENDANCE_PATH, attendance_records)
    return attendance_event
