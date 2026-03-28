export async function captureVideoFrame(
  video: HTMLVideoElement,
  {
    maxWidth = 640,
    quality = 0.82,
  }: {
    maxWidth?: number;
    quality?: number;
  } = {},
): Promise<Blob> {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("Video stream is not ready.");
  }

  const scale = Math.min(1, maxWidth / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to capture a video frame.");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Failed to encode the captured frame."));
    }, "image/jpeg", quality);
  });
}
