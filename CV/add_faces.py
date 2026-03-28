from pathlib import Path
import os
import pickle

import cv2
import numpy as np


BASE_DIR = Path(__file__).resolve().parent
CASCADE_PATH = BASE_DIR / "haar_face.xml"
NAMES_PATH = BASE_DIR / "names.pkl"
FACES_PATH = BASE_DIR / "faces_data.pkl"
TARGET_SAMPLES = 100


def main() -> None:
    facedetect = cv2.CascadeClassifier(str(CASCADE_PATH))
    if facedetect.empty():
        raise SystemExit(f"Failed to load Haar cascade from {CASCADE_PATH}")

    video = cv2.VideoCapture(0)
    if not video.isOpened():
        raise SystemExit("Camera not accessible")

    try:
        name = input("Enter your name: ").strip()
        if not name:
            raise SystemExit("Name is required")

        faces_data = []
        frame_count = 0

        while True:
            ret, frame = video.read()
            if not ret:
                print("Failed to read a frame from the camera.")
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = facedetect.detectMultiScale(gray, 1.3, 5)

            for (x, y, w, h) in faces:
                crop_img = frame[y : y + h, x : x + w]
                resized_img = cv2.resize(crop_img, (50, 50))
                if len(faces_data) < TARGET_SAMPLES and frame_count % 10 == 0:
                    faces_data.append(resized_img)
                frame_count += 1

                cv2.putText(
                    frame,
                    str(len(faces_data)),
                    (50, 50),
                    cv2.FONT_HERSHEY_COMPLEX,
                    1,
                    (50, 50, 255),
                    1,
                )
                cv2.rectangle(frame, (x, y), (x + w, y + h), (50, 50, 255), 1)

            cv2.imshow("Frame", frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q") or len(faces_data) >= TARGET_SAMPLES:
                break
    finally:
        video.release()
        cv2.destroyAllWindows()

    if not faces_data:
        raise SystemExit("No face samples were captured.")

    face_array = np.asarray(faces_data, dtype=np.uint8).reshape(len(faces_data), -1)

    if NAMES_PATH.exists():
        with NAMES_PATH.open("rb") as file:
            names = pickle.load(file)
    else:
        names = []

    names.extend([name] * len(face_array))
    with NAMES_PATH.open("wb") as file:
        pickle.dump(names, file)

    if FACES_PATH.exists():
        with FACES_PATH.open("rb") as file:
            existing_faces = pickle.load(file)
        face_array = np.append(existing_faces, face_array, axis=0)

    with FACES_PATH.open("wb") as file:
        pickle.dump(face_array, file)

    print(
        f"Saved {len(faces_data)} samples for {name} to {os.fspath(FACES_PATH)} "
        f"and updated {os.fspath(NAMES_PATH)}"
    )


if __name__ == "__main__":
    main()
