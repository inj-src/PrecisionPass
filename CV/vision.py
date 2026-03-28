from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
import os
from pathlib import Path
from threading import Lock
import time
import uuid

import cv2
import numpy as np
from sklearn.neighbors import KNeighborsClassifier

from CV import data


FACE_SIZE = (50, 50)


@dataclass
class VisionState:
    face_cascade: cv2.CascadeClassifier
    state_lock: Lock = field(default_factory=Lock)
    model: KNeighborsClassifier | None = None
    sample_count: int = 0
    recent_events: deque[dict] = field(default_factory=lambda: deque(maxlen=200))
    last_recent_event_time: dict[str, float] = field(default_factory=dict)
    recent_recognition_cooldown_seconds: float = 60.0
    unknown_recognition_cooldown_seconds: float = 2.0
    unknown_distance_threshold: float = 11.0


def create_vision_state() -> VisionState:
    cascade_path = Path(__file__).resolve().parent / "haar_face.xml"
    face_cascade = cv2.CascadeClassifier(str(cascade_path))
    if face_cascade.empty():
        raise RuntimeError(f"Failed to load Haar cascade from {cascade_path}")

    return VisionState(
        face_cascade=face_cascade,
        recent_recognition_cooldown_seconds=float(
            os.getenv("CV_RECENT_RECOGNITION_COOLDOWN_SECONDS", "60.0")
        ),
        unknown_recognition_cooldown_seconds=float(
            os.getenv("CV_UNKNOWN_RECOGNITION_COOLDOWN_SECONDS", "2.0")
        ),
        unknown_distance_threshold=float(os.getenv("CV_UNKNOWN_DISTANCE_THRESHOLD", "11.0")),
    )


def is_model_ready(state: VisionState) -> bool:
    with state.state_lock:
        return state.model is not None and state.sample_count > 0


def retrain_model(state: VisionState) -> None:
    samples: list[np.ndarray] = []
    labels: list[str] = []

    for employee in data.list_employees():
        sample_dir = data.face_samples_dir(employee["id"])
        for sample_path in sorted(sample_dir.glob("*.jpg")):
            image = cv2.imread(str(sample_path))
            if image is None:
                continue
            samples.append(preprocess_face(image))
            labels.append(str(employee["id"]))

    model: KNeighborsClassifier | None = None
    if samples:
        model = KNeighborsClassifier(n_neighbors=min(3, len(samples)))
        model.fit(np.asarray(samples, dtype=np.float32), labels)

    with state.state_lock:
        state.model = model
        state.sample_count = len(samples)


def enroll_employee(state: VisionState, employee: dict, frames: list[bytes]) -> dict:
    sample_dir = data.face_samples_dir(employee["id"])
    accepted_count = 0
    rejected_reasons: list[str] = []

    for index, frame_bytes in enumerate(frames):
        frame = decode_image(frame_bytes)
        if frame is None:
            rejected_reasons.append(f"Frame {index + 1}: invalid image data")
            continue

        faces = detect_faces(state, frame)
        if len(faces) != 1:
            reason = "no face detected" if len(faces) == 0 else "multiple faces detected"
            rejected_reasons.append(f"Frame {index + 1}: {reason}")
            continue

        x, y, width, height = faces[0]
        crop = frame[y : y + height, x : x + width]
        filename = f"{datetime.now().strftime('%Y%m%dT%H%M%S%f')}_{index:03d}.jpg"
        cv2.imwrite(str(sample_dir / filename), crop)
        accepted_count += 1

    sample_count = len(list(sample_dir.glob("*.jpg")))
    updated_employee = data.update_employee_samples(employee["id"], sample_count)
    if accepted_count:
        retrain_model(state)

    return {
        "employee": updated_employee,
        "acceptedCount": accepted_count,
        "rejectedCount": len(rejected_reasons),
        "rejectedReasons": rejected_reasons,
    }


def recognize_frame(state: VisionState, frame_bytes: bytes) -> dict:
    frame = decode_image(frame_bytes)
    if frame is None:
        raise ValueError("Invalid image data")

    frame_height, frame_width = frame.shape[:2]
    employees_by_code = {
        str(employee["id"]): employee
        for employee in data.list_employees()
    }
    timestamp = datetime.now()

    with state.state_lock:
        model = state.model

    detections: list[dict] = []
    created_attendance: list[dict] = []

    for x, y, width, height in detect_faces(state, frame):
        detection = build_unknown_detection(x, y, width, height, frame_width, frame_height)

        if model is None:
            detections.append(detection)
            push_recent_event(
                state,
                build_unknown_event(timestamp),
                throttle_key="unknown",
                cooldown_seconds=state.unknown_recognition_cooldown_seconds,
            )
            continue

        face = frame[y : y + height, x : x + width]
        sample = preprocess_face(face).reshape(1, -1)
        distances, _ = model.kneighbors(sample, n_neighbors=1)
        distance = float(distances[0][0])
        predicted_employee_id = str(model.predict(sample)[0])

        if (
            predicted_employee_id not in employees_by_code
            or distance > state.unknown_distance_threshold
        ):
            detections.append(detection)
            push_recent_event(
                state,
                build_unknown_event(timestamp),
                throttle_key="unknown",
                cooldown_seconds=state.unknown_recognition_cooldown_seconds,
            )
            continue

        employee = employees_by_code[predicted_employee_id]
        confidence = round(
            max(0.0, (1 - (distance / state.unknown_distance_threshold))) * 100,
            2,
        )
        attendance_status = compute_attendance_status(employee, timestamp)
        attendance_event = data.record_attendance_if_first(
            employee,
            timestamp=timestamp,
            status=attendance_status,
            confidence=confidence,
        )

        detection.update(
                {
                    "status": "matched",
                    "fullName": employee["fullName"],
                    "department": employee["department"],
                    "confidence": confidence,
                "attendanceStatus": attendance_status,
                "attendanceRecorded": attendance_event is not None,
            }
        )
        detections.append(detection)

        if attendance_event is not None:
            created_attendance.append(attendance_event)

            push_recent_event(
                state,
                build_recognized_event(employee, timestamp, confidence, attendance_status, attendance_event),
                throttle_key=str(employee["id"]),
                cooldown_seconds=state.recent_recognition_cooldown_seconds,
            )

    return {
        "detections": detections,
        "createdAttendance": created_attendance,
    }


def recent_events(state: VisionState, limit: int) -> list[dict]:
    with state.state_lock:
        return list(state.recent_events)[:limit]


def decode_image(image_bytes: bytes) -> np.ndarray | None:
    buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    return cv2.imdecode(buffer, cv2.IMREAD_COLOR)


def detect_faces(state: VisionState, frame: np.ndarray) -> list[tuple[int, int, int, int]]:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = state.face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)
    return [(int(x), int(y), int(width), int(height)) for (x, y, width, height) in faces]


def preprocess_face(face: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, FACE_SIZE)
    return resized.astype(np.float32).flatten() / 255.0


def compute_attendance_status(employee: dict, timestamp: datetime) -> str:
    scheduled_check_in = datetime.strptime(employee["schedule"]["checkInTime"], "%H:%M").time()
    return "late" if timestamp.time() > scheduled_check_in else "present"


def build_unknown_detection(
    x: int,
    y: int,
    width: int,
    height: int,
    frame_width: int,
    frame_height: int,
) -> dict:
    return {
        "status": "unknown",
        "box": {
            "top": round(y / frame_height, 4),
            "left": round(x / frame_width, 4),
            "width": round(width / frame_width, 4),
            "height": round(height / frame_height, 4),
        },
        "fullName": None,
        "department": None,
        "confidence": None,
        "attendanceStatus": None,
        "attendanceRecorded": False,
    }


def build_unknown_event(timestamp: datetime) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "type": "unknown",
        "timestamp": timestamp.isoformat(timespec="seconds"),
        "fullName": None,
        "department": None,
        "confidence": None,
        "attendanceStatus": None,
        "attendanceRecorded": False,
    }


def build_recognized_event(
    employee: dict,
    timestamp: datetime,
    confidence: float,
    attendance_status: str,
    attendance_event: dict | None,
) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "type": "recognized",
        "timestamp": timestamp.isoformat(timespec="seconds"),
        "fullName": employee["fullName"],
        "department": employee["department"],
        "confidence": confidence,
        "attendanceStatus": attendance_status,
        "attendanceRecorded": attendance_event is not None,
    }


def push_recent_event(
    state: VisionState,
    event: dict,
    *,
    throttle_key: str,
    cooldown_seconds: float,
) -> None:
    now = time.monotonic()

    with state.state_lock:
        last_seen = state.last_recent_event_time.get(throttle_key, 0.0)
        if now - last_seen < cooldown_seconds:
            return

        state.last_recent_event_time[throttle_key] = now
        state.recent_events.appendleft(event)
