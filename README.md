# Precision Pass

Precision Pass is a full-stack employee attendance and operations demo that combines:

- **Next.js frontend** for HR workflows
- **FastAPI + OpenCV backend** for face enrollment and recognition
- **JSON-based local storage** for quick local development

It supports attendance tracking, employee management, leave management, and monthly payroll estimates in one app.

## Features

- Real-time attendance dashboard
- Live face recognition monitor
- Employee directory with editable schedules and wages
- Face registration and sample enrollment
- Leave management (approved leave ranges)
- Monthly payroll calculation from attendance + leave data

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** FastAPI, OpenCV, scikit-learn
- **Storage:** Local JSON files under `CV/data`

## Project Structure

```text
app/                 Next.js routes/pages
components/          Reusable UI and feature components
lib/cv-api.ts        Frontend API client for CV backend
CV/server.py         FastAPI entrypoint and API routes
CV/vision.py         Face detection, enrollment, recognition logic
CV/data.py           JSON data helpers
CV/data/             Local employees, attendance, leave, and face samples
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.10+
- A webcam (for face registration and live monitoring)

## Local Setup

From the repository root:

1. Install frontend dependencies:

   ```bash
   npm install
   ```

2. Install backend dependencies:

   ```bash
   python3 -m pip install -r CV/requirements.txt
   ```

3. Start the CV backend:

   ```bash
   npm run dev:server
   ```

4. In another terminal, start the frontend:

   ```bash
   npm run dev
   ```

5. Open the app at:

   - Frontend: `http://localhost:3000`
   - Backend docs: `http://127.0.0.1:8000/docs`

## Environment Variables

### Frontend

- `NEXT_PUBLIC_CV_API_BASE_URL` (optional)  
  Defaults to `http://127.0.0.1:8000`

### Backend

- `CV_ALLOWED_ORIGINS` (optional, comma-separated)  
  Defaults to `http://localhost:3000,http://127.0.0.1:3000`

## Available npm Scripts

- `npm run dev` — start Next.js dev server
- `npm run dev:server` — start FastAPI backend with auto-reload
- `npm run lint` — run ESLint
- `npm run build` — create production build
- `npm run start` — run production server

## API Overview

Core endpoints exposed by `CV/server.py`:

- `GET /health`
- `GET|POST /employees`
- `PATCH|DELETE /employees/{employee_id}`
- `POST /employees/{employee_id}/enroll`
- `POST /recognition/frame`
- `GET /recognitions/recent`
- `GET /attendance/today`
- `GET|POST /leaves`
- `PATCH|DELETE /leaves/{leave_id}`
- `GET /payroll/monthly?month=YYYY-MM`

## Notes

- This project currently uses local JSON storage and is intended for demos/prototyping.
- On restricted networks, `npm run build` may fail if Google Fonts cannot be fetched.
