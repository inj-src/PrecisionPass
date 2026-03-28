from __future__ import annotations

from collections import deque
from datetime import datetime
import os
from pathlib import Path
from threading import Lock
import time
import uuid

import cv2
import numpy as np
from sklearn.neighbors import KNeighborsClassifier

from CV.storage import JsonStorage


class RecognitionService:
    FACE_SIZE = (50, 50)

    def __init__(self, storage: JsonStorage) -> None:
        self.storage = storage
        self._model_lock = Lock()
        self._recent_event_lock = Lock()
        self._recent_events: deque[dict] = deque(maxlen=200)
        self._last_event_time: dict[str, float] = {}
        self._knn: KNeighborsClassifier | None = None
        self._known_employee_ids: set[str] = set()
        self._sample_count = 0
        self.recent_recognition_cooldown_seconds = float(
            os.getenv("CV_RECENT_RECOGNITION_COOLDOWN_SECONDS", "60.0")
        )
        self.unknown_recognition_cooldown_seconds = float(
            os.getenv("CV_UNKNOWN_RECOGNITION_COOLDOWN_SECONDS", "2.0")
        )
        self.unknown_distance_threshold = float(
            os.getenv("CV_UNKNOWN_DISTANCE_THRESHOLD", "11.0")
        )

        cascade_path = Path(__file__).resolve().parent / "haar_face.xml"
        self._face_cascade = cv2.CascadeClassifier(str(cascade_path))
        if self._face_cascade.empty():
            raise RuntimeError(f"Failed to load Haar cascade from {cascade_path}")

    @property
    def sample_count(self) -> int:
        return self._sample_count

    def is_model_ready(self) -> bool:
        return self._knn is not None and bool(self._known_employee_ids)

    def retrain(self) -> None:
        samples: list[np.ndarray] = []
        labels: list[str] = []

        for employee in self.storage.list_employees():
            sample_dir = self.storage.face_samples_dir(employee["employeeId"])
            for sample_path in sorted(sample_dir.glob("*.jpg")):
                image = cv2.imread(str(sample_path))
                if image is None:
                    continue
                samples.append(self._preprocess_face(image))
                labels.append(employee["employeeId"])

        with self._model_lock:
            self._sample_count = len(samples)
            self._known_employee_ids = set(labels)
            if not samples:
                self._knn = None
                return

            model = KNeighborsClassifier(n_neighbors=min(3, len(samples)))
            model.fit(np.asarray(samples, dtype=np.float32), labels)
            self._knn = model

    def enroll_employee(self, employee: dict, frames: list[bytes]) -> dict:
        sample_dir = self.storage.face_samples_dir(employee["employeeId"])
        accepted_count = 0
        rejected_reasons: list[str] = []

        for index, frame_bytes in enumerate(frames):
            frame = self._decode_image(frame_bytes)
            if frame is None:
                rejected_reasons.append(f"Frame {index + 1}: invalid image data")
                continue

            faces = self._detect_faces(frame)
            if len(faces) != 1:
                reason = "no face detected" if len(faces) == 0 else "multiple faces detected"
                rejected_reasons.append(f"Frame {index + 1}: {reason}")
                continue

            x, y, w, h = faces[0]
            crop = frame[y : y + h, x : x + w]
            filename = f"{datetime.now().strftime('%Y%m%dT%H%M%S%f')}_{index:03d}.jpg"
            cv2.imwrite(str(sample_dir / filename), crop)
            accepted_count += 1

        sample_count = len(list(sample_dir.glob("*.jpg")))
        employee = self.storage.update_employee_samples(employee["id"], sample_count)
        if accepted_count:
            self.retrain()

        return {
            "employee": employee,
            "acceptedCount": accepted_count,
            "rejectedCount": len(rejected_reasons),
            "rejectedReasons": rejected_reasons,
        }

    def recognize_frame(self, frame_bytes: bytes) -> dict:
        frame = self._decode_image(frame_bytes)
        if frame is None:
            raise ValueError("Invalid image data")

        height, width = frame.shape[:2]
        employees = {employee["employeeId"]: employee for employee in self.storage.list_employees()}
        timestamp = datetime.now()

        detections: list[dict] = []
        created_attendance: list[dict] = []

        with self._model_lock:
            knn = self._knn

        for x, y, w, h in self._detect_faces(frame):
            face = frame[y : y + h, x : x + w]
            detection = {
                "status": "unknown",
                "box": {
                    "top": round(y / height, 4),
                    "left": round(x / width, 4),
                    "width": round(w / width, 4),
                    "height": round(h / height, 4),
                },
                "employeeId": None,
                "fullName": None,
                "department": None,
                "confidence": None,
                "attendanceStatus": None,
                "attendanceRecorded": False,
            }

            if knn is None:
                detections.append(detection)
                self._push_recent_event(
                    {
                        "id": str(uuid.uuid4()),
                        "type": "unknown",
                        "timestamp": timestamp.isoformat(timespec="seconds"),
                        "fullName": None,
                        "employeeId": None,
                        "department": None,
                        "confidence": None,
                        "attendanceStatus": None,
                        "attendanceRecorded": False,
                    },
                    throttle_key="unknown",
                    cooldown_seconds=self.unknown_recognition_cooldown_seconds,
                )
                continue

            sample = self._preprocess_face(face).reshape(1, -1)
            distances, _ = knn.kneighbors(sample, n_neighbors=1)
            distance = float(distances[0][0])
            predicted_employee_id = str(knn.predict(sample)[0])

            if predicted_employee_id not in employees or distance > self.unknown_distance_threshold:
                detections.append(detection)
                self._push_recent_event(
                    {
                        "id": str(uuid.uuid4()),
                        "type": "unknown",
                        "timestamp": timestamp.isoformat(timespec="seconds"),
                        "fullName": None,
                        "employeeId": None,
                        "department": None,
                        "confidence": None,
                        "attendanceStatus": None,
                        "attendanceRecorded": False,
                    },
                    throttle_key="unknown",
                    cooldown_seconds=self.unknown_recognition_cooldown_seconds,
                )
                continue

            employee = employees[predicted_employee_id]
            confidence = round(
                max(0.0, (1 - (distance / self.unknown_distance_threshold))) * 100,
                2,
            )
            attendance_status = self._compute_attendance_status(employee, timestamp)
            attendance_event = self.storage.record_attendance_if_first(
                employee,
                timestamp=timestamp,
                status=attendance_status,
                confidence=confidence,
            )

            detection.update(
                {
                    "status": "matched",
                    "employeeId": employee["employeeId"],
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

            self._push_recent_event(
                {
                    "id": str(uuid.uuid4()),
                    "type": "recognized",
                    "timestamp": timestamp.isoformat(timespec="seconds"),
                    "fullName": employee["fullName"],
                    "employeeId": employee["employeeId"],
                    "department": employee["department"],
                    "confidence": confidence,
                    "attendanceStatus": attendance_status,
                    "attendanceRecorded": attendance_event is not None,
                },
                throttle_key=employee["employeeId"],
                cooldown_seconds=self.recent_recognition_cooldown_seconds,
            )

        return {
            "detections": detections,
            "createdAttendance": created_attendance,
        }

    def recent_events(self, limit: int) -> list[dict]:
        with self._recent_event_lock:
            return list(self._recent_events)[:limit]

    def _decode_image(self, image_bytes: bytes) -> np.ndarray | None:
        buffer = np.frombuffer(image_bytes, dtype=np.uint8)
        return cv2.imdecode(buffer, cv2.IMREAD_COLOR)

    def _detect_faces(self, frame: np.ndarray) -> list[tuple[int, int, int, int]]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self._face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)
        return [(int(x), int(y), int(w), int(h)) for (x, y, w, h) in faces]

    def _preprocess_face(self, face: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, self.FACE_SIZE)
        return resized.astype(np.float32).flatten() / 255.0

    def _compute_attendance_status(self, employee: dict, timestamp: datetime) -> str:
        scheduled = datetime.strptime(employee["schedule"]["checkInTime"], "%H:%M").time()
        return "late" if timestamp.time() > scheduled else "present"

    def _push_recent_event(self, event: dict, *, throttle_key: str, cooldown_seconds: float) -> None:
        now = time.monotonic()
        last_seen = self._last_event_time.get(throttle_key, 0.0)
        if now - last_seen < cooldown_seconds:
            return

        self._last_event_time[throttle_key] = now
        with self._recent_event_lock:
            self._recent_events.appendleft(event)
