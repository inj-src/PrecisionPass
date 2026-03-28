# Precision Pass CV Backend

Minimal FastAPI backend for the Precision Pass demo.

## Run

From the project root:

```bash
python3 -m uvicorn CV.server:app --reload
```

## API

- Interactive docs: `http://127.0.0.1:8000/docs`
- Health: `GET /health`
- Employees: `GET /employees`, `POST /employees`, `PATCH /employees/{id}`, `DELETE /employees/{id}`
- Enrollment: `POST /employees/{id}/enroll`
- Recognition: `POST /recognition/frame`, `GET /recognitions/recent`
- Attendance: `GET /attendance/today`

## Files

- `CV/server.py`
  FastAPI app, request and response models, and all routes.
- `CV/data.py`
  Simple JSON file helpers for employees, attendance, and face-sample folders.
- `CV/vision.py`
  Face detection, sample enrollment, KNN model training, live recognition, and recent-event buffering.

## Storage

- `CV/data/employees.json`
- `CV/data/attendance.json`
- `CV/data/face_samples/<id>/*.jpg`

## Request Flow

### Register a person

1. The website creates an employee with `POST /employees`.
2. The browser captures frames and uploads them to `POST /employees/{id}/enroll`.
3. The backend saves accepted face crops to disk and retrains the recognition model.

### Recognize a person

1. The browser sends one frame to `POST /recognition/frame`.
2. The backend detects faces, compares them against saved samples, and returns detections.
3. The first match for each employee on a given day is written to `attendance.json`.
