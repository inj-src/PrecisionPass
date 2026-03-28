import argparse
from pathlib import Path

import cv2 as cv
import numpy as np


BASE_DIR = Path(__file__).resolve().parent
CASCADE_PATH = BASE_DIR / "haar_face.xml"
MODEL_PATH = BASE_DIR / "face_recognizer.yml"
PEOPLE_PATH = BASE_DIR / "people.npy"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run LBPH recognition on a single image.")
    parser.add_argument("image", type=Path, help="Path to the image to analyze")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    image_path = args.image.resolve()
    if not image_path.exists():
        raise SystemExit(f"Image not found: {image_path}")
    if not MODEL_PATH.exists():
        raise SystemExit(f"Model not found: {MODEL_PATH}. Run opencv_face_train.py first.")
    if not PEOPLE_PATH.exists():
        raise SystemExit(f"Label map not found: {PEOPLE_PATH}. Run opencv_face_train.py first.")

    haar_cascade = cv.CascadeClassifier(str(CASCADE_PATH))
    if haar_cascade.empty():
        raise SystemExit(f"Failed to load Haar cascade from {CASCADE_PATH}")

    people = np.load(PEOPLE_PATH, allow_pickle=True).tolist()
    face_recognizer = cv.face.LBPHFaceRecognizer_create()
    face_recognizer.read(str(MODEL_PATH))

    img = cv.imread(str(image_path))
    if img is None:
        raise SystemExit(f"Failed to load image: {image_path}")

    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    faces_rect = haar_cascade.detectMultiScale(gray, 1.1, 4)
    if len(faces_rect) == 0:
        raise SystemExit("No faces detected in the image.")

    for (x, y, w, h) in faces_rect:
        faces_roi = gray[y : y + h, x : x + w]
        label, confidence = face_recognizer.predict(faces_roi)
        print(f"Label = {people[label]} with a confidence = {confidence:.2f}")

        cv.putText(img, str(people[label]), (x, y - 10), cv.FONT_HERSHEY_COMPLEX, 1.0, (0, 0, 255), 2)
        cv.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)

    cv.imshow("Detected Face", img)
    cv.waitKey(0)
    cv.destroyAllWindows()


if __name__ == "__main__":
    main()
