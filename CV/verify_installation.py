from pathlib import Path

import cv2


BASE_DIR = Path(__file__).resolve().parent
CASCADE_PATH = BASE_DIR / "haar_face.xml"


def main() -> None:
    print(f"OpenCV version: {cv2.__version__}")

    cascade = cv2.CascadeClassifier(str(CASCADE_PATH))
    if cascade.empty():
        raise SystemExit(f"Failed to load Haar cascade from {CASCADE_PATH}")
    print(f"Haar cascade loaded: {CASCADE_PATH}")

    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        raise SystemExit("Camera check failed: webcam is not accessible")

    try:
        ret, frame = camera.read()
        if not ret or frame is None:
            raise SystemExit("Camera check failed: could not read a frame")

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        print(f"Camera frame check passed: {frame.shape[1]}x{frame.shape[0]}")
        print(f"Grayscale conversion check passed: {gray.shape[1]}x{gray.shape[0]}")
    finally:
        camera.release()

    print("Environment looks ready for the webcam-based CV scripts.")


if __name__ == "__main__":
    main()
