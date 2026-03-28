import argparse
from pathlib import Path

import cv2 as cv


BASE_DIR = Path(__file__).resolve().parent
CASCADE_PATH = BASE_DIR / "haar_face.xml"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Detect faces in a single image.")
    parser.add_argument("image", type=Path, help="Path to the image to analyze")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    image_path = args.image.resolve()
    if not image_path.exists():
        raise SystemExit(f"Image not found: {image_path}")

    haar_cascade = cv.CascadeClassifier(str(CASCADE_PATH))
    if haar_cascade.empty():
        raise SystemExit(f"Failed to load Haar cascade from {CASCADE_PATH}")

    img = cv.imread(str(image_path))
    if img is None:
        raise SystemExit(f"Failed to load image: {image_path}")

    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    faces_rect = haar_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=7)
    print(f"Number of faces found = {len(faces_rect)}")

    for (x, y, w, h) in faces_rect:
        cv.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), thickness=2)

    cv.imshow("Detected Face", img)
    cv.waitKey(0)
    cv.destroyAllWindows()


if __name__ == "__main__":
    main()
