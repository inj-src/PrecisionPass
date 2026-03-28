import argparse
from pathlib import Path

import cv2 as cv
import numpy as np


BASE_DIR = Path(__file__).resolve().parent
CASCADE_PATH = BASE_DIR / "haar_face.xml"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train an LBPH face recognizer from image folders.")
    parser.add_argument(
        "--dataset-dir",
        type=Path,
        default=BASE_DIR / "Faces",
        help="Directory containing one subdirectory per person",
    )
    return parser.parse_args()


def create_train(dataset_dir: Path, haar_cascade: cv.CascadeClassifier) -> tuple[list[np.ndarray], list[int], list[str]]:
    people = sorted([entry.name for entry in dataset_dir.iterdir() if entry.is_dir()])
    if not people:
        raise SystemExit(f"No person folders found in {dataset_dir}")

    features: list[np.ndarray] = []
    labels: list[int] = []

    for label, person in enumerate(people):
        path = dataset_dir / person
        for img_path in path.iterdir():
            if not img_path.is_file():
                continue

            img_array = cv.imread(str(img_path))
            if img_array is None:
                continue

            gray = cv.cvtColor(img_array, cv.COLOR_BGR2GRAY)
            faces_rect = haar_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)

            for (x, y, w, h) in faces_rect:
                faces_roi = gray[y : y + h, x : x + w]
                features.append(faces_roi)
                labels.append(label)

    if not features:
        raise SystemExit(f"No faces detected in dataset {dataset_dir}")

    return features, labels, people


def main() -> None:
    args = parse_args()
    dataset_dir = args.dataset_dir.resolve()
    if not dataset_dir.exists():
        raise SystemExit(f"Dataset directory not found: {dataset_dir}")

    haar_cascade = cv.CascadeClassifier(str(CASCADE_PATH))
    if haar_cascade.empty():
        raise SystemExit(f"Failed to load Haar cascade from {CASCADE_PATH}")

    features, labels, people = create_train(dataset_dir, haar_cascade)

    features_array = np.array(features, dtype="object")
    labels_array = np.array(labels)
    face_recognizer = cv.face.LBPHFaceRecognizer_create()
    face_recognizer.train(features_array, labels_array)

    face_recognizer.save(str(BASE_DIR / "face_recognizer.yml"))
    np.save(BASE_DIR / "features.npy", features_array)
    np.save(BASE_DIR / "labels.npy", labels_array)
    np.save(BASE_DIR / "people.npy", np.array(people, dtype=object))

    print(f"Training done. Saved model and arrays in {BASE_DIR}")


if __name__ == "__main__":
    main()
