import csv
from datetime import datetime
from pathlib import Path
import pickle
import time

import cv2
import numpy as np
from sklearn.neighbors import KNeighborsClassifier


BASE_DIR = Path(__file__).resolve().parent
CASCADE_PATH = BASE_DIR / "haar_face.xml"
NAMES_PATH = BASE_DIR / "names.pkl"
FACES_PATH = BASE_DIR / "faces_data.pkl"
ATTENDANCE_DIR = BASE_DIR / "Attendance"
COL_NAMES = ["NAME", "TIME"]


try:
    from win32com.client import Dispatch
except ImportError:
    Dispatch = None


def speak(message: str) -> None:
    if Dispatch is None:
        print(message)
        return

    speaker = Dispatch("SAPI.SpVoice")
    speaker.Speak(message)


def load_training_data() -> tuple[np.ndarray, list[str]]:
    if not NAMES_PATH.exists() or not FACES_PATH.exists():
        raise SystemExit(
            "Training data not found. Run add_faces.py first to create "
            "names.pkl and faces_data.pkl."
        )

    with NAMES_PATH.open("rb") as file:
        labels = pickle.load(file)
    with FACES_PATH.open("rb") as file:
        faces = pickle.load(file)

    if len(labels) == 0 or len(faces) == 0:
        raise SystemExit("Training data is empty. Run add_faces.py again.")
    if len(labels) != len(faces):
        raise SystemExit("Training data is inconsistent: names and face samples do not match.")

    return np.asarray(faces), list(labels)


def main() -> None:
    facedetect = cv2.CascadeClassifier(str(CASCADE_PATH))
    if facedetect.empty():
        raise SystemExit(f"Failed to load Haar cascade from {CASCADE_PATH}")

    faces, labels = load_training_data()
    knn = KNeighborsClassifier(n_neighbors=min(5, len(labels)))
    knn.fit(faces, labels)

    ATTENDANCE_DIR.mkdir(exist_ok=True)

    video = cv2.VideoCapture(0)
    if not video.isOpened():
        raise SystemExit("Camera not accessible")

    last_attendance = None

    try:
        while True:
            ret, frame = video.read()
            if not ret:
                print("Failed to read a frame from the camera.")
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces_rect = facedetect.detectMultiScale(gray, 1.3, 5)

            for (x, y, w, h) in faces_rect:
                crop_img = frame[y : y + h, x : x + w]
                resized_img = cv2.resize(crop_img, (50, 50)).flatten().reshape(1, -1)
                output = knn.predict(resized_img)
                current_time = datetime.fromtimestamp(time.time())
                date = current_time.strftime("%d-%m-%Y")
                timestamp = current_time.strftime("%H:%M:%S")

                cv2.rectangle(frame, (x, y), (x + w, y + h), (50, 50, 255), 2)
                cv2.rectangle(frame, (x, y - 40), (x + w, y), (50, 50, 255), -1)
                cv2.putText(
                    frame,
                    str(output[0]),
                    (x, y - 15),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (255, 255, 255),
                    1,
                )

                last_attendance = {
                    "name": str(output[0]),
                    "date": date,
                    "timestamp": timestamp,
                }

            cv2.imshow("Frame", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord("o"):
                if last_attendance is None:
                    print("No recognized face to record yet.")
                    continue

                speak("Attendance is taken.")
                filename = ATTENDANCE_DIR / f"Attendance_{last_attendance['date']}.csv"
                file_exists = filename.exists()

                with filename.open("a", newline="") as csvfile:
                    writer = csv.writer(csvfile)
                    if not file_exists:
                        writer.writerow(COL_NAMES)
                    writer.writerow([last_attendance["name"], last_attendance["timestamp"]])

                print(f"Saved attendance to {filename}")

            if key == ord("q"):
                break
    finally:
        video.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
