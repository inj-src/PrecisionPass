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
- Employees: `GET /employees`, `POST /employees`, `PATCH /employees/{id}`
- Enrollment: `POST /employees/{id}/enroll`
- Recognition: `POST /recognition/frame`, `GET /recognitions/recent`
- Attendance: `GET /attendance/today`

## Storage

- `CV/data/employees.json`
- `CV/data/attendance.json`
- `CV/data/face_samples/<employeeId>/*.jpg`
