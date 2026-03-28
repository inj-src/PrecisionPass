from __future__ import annotations

from datetime import datetime
import json
from pathlib import Path
from threading import Lock
import uuid


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
EMPLOYEES_PATH = DATA_DIR / "employees.json"
ATTENDANCE_PATH = DATA_DIR / "attendance.json"
FACE_SAMPLES_DIR = DATA_DIR / "face_samples"


class JsonStorage:
    def __init__(self) -> None:
        self._lock = Lock()
        self._ensure_storage()

    def _ensure_storage(self) -> None:
        DATA_DIR.mkdir(exist_ok=True)
        FACE_SAMPLES_DIR.mkdir(exist_ok=True)
        for path in (EMPLOYEES_PATH, ATTENDANCE_PATH):
            if not path.exists():
                path.write_text("[]\n", encoding="utf-8")

    def _read_json(self, path: Path) -> list[dict]:
        content = path.read_text(encoding="utf-8").strip()
        if not content:
            return []
        return json.loads(content)

    def _write_json(self, path: Path, payload: list[dict]) -> None:
        temp_path = path.with_suffix(path.suffix + ".tmp")
        temp_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        temp_path.replace(path)

    def list_employees(self) -> list[dict]:
        with self._lock:
            employees = self._read_json(EMPLOYEES_PATH)
        return sorted(employees, key=lambda employee: employee["fullName"].lower())

    def get_employee(self, employee_id: str) -> dict | None:
        with self._lock:
            employees = self._read_json(EMPLOYEES_PATH)
            for employee in employees:
                if employee["id"] == employee_id:
                    return employee
        return None

    def create_employee(self, payload: dict) -> dict:
        now = datetime.now().isoformat(timespec="seconds")
        record = {
            "id": str(uuid.uuid4()),
            "employeeId": payload["employeeId"],
            "fullName": payload["fullName"],
            "department": payload["department"],
            "schedule": payload["schedule"],
            "faceEnrolled": False,
            "sampleCount": 0,
            "createdAt": now,
            "updatedAt": now,
        }

        with self._lock:
            employees = self._read_json(EMPLOYEES_PATH)
            if any(employee["employeeId"] == record["employeeId"] for employee in employees):
                raise ValueError(f"Employee ID '{record['employeeId']}' already exists.")
            employees.append(record)
            self._write_json(EMPLOYEES_PATH, employees)

        return record

    def update_employee(self, employee_id: str, payload: dict) -> dict:
        with self._lock:
            employees = self._read_json(EMPLOYEES_PATH)
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
                self._write_json(EMPLOYEES_PATH, employees)
                return employee

        raise KeyError(employee_id)

    def face_samples_dir(self, employee_code: str) -> Path:
        path = FACE_SAMPLES_DIR / employee_code
        path.mkdir(parents=True, exist_ok=True)
        return path

    def update_employee_samples(self, employee_id: str, sample_count: int) -> dict:
        with self._lock:
            employees = self._read_json(EMPLOYEES_PATH)
            for index, employee in enumerate(employees):
                if employee["id"] != employee_id:
                    continue

                employee["sampleCount"] = sample_count
                employee["faceEnrolled"] = sample_count > 0
                employee["updatedAt"] = datetime.now().isoformat(timespec="seconds")
                employees[index] = employee
                self._write_json(EMPLOYEES_PATH, employees)
                return employee

        raise KeyError(employee_id)

    def list_attendance(self) -> list[dict]:
        with self._lock:
            records = self._read_json(ATTENDANCE_PATH)
        return sorted(records, key=lambda record: record["timestamp"], reverse=True)

    def record_attendance_if_first(
        self,
        employee: dict,
        *,
        timestamp: datetime,
        status: str,
        confidence: float,
    ) -> dict | None:
        target_date = timestamp.date().isoformat()

        with self._lock:
            records = self._read_json(ATTENDANCE_PATH)
            already_recorded = any(
                record["employeeId"] == employee["employeeId"] and record["date"] == target_date
                for record in records
            )
            if already_recorded:
                return None

            event = {
                "id": str(uuid.uuid4()),
                "employeeId": employee["employeeId"],
                "fullName": employee["fullName"],
                "timestamp": timestamp.isoformat(timespec="seconds"),
                "date": target_date,
                "status": status,
                "confidence": round(confidence, 2),
            }
            records.append(event)
            self._write_json(ATTENDANCE_PATH, records)
            return event

