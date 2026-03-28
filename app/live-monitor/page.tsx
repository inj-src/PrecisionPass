"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { LiveMonitorHeader } from "@/components/live-monitor/live-monitor-header";
import { CameraFeed } from "@/components/live-monitor/camera-feed";
import { RecognitionFeed } from "@/components/live-monitor/recognition-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getHealth,
  getRecentRecognitions,
  recognizeFrame,
  type HealthResponse,
  type RecognitionDetection,
  type RecognitionEvent,
} from "@/lib/cv-api";
import { captureVideoFrame } from "@/lib/video-frame";

export default function LiveMonitorPage() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const analysisInFlightRef = React.useRef(false);

  const [cameraReady, setCameraReady] = React.useState(false);
  const [detections, setDetections] = React.useState<RecognitionDetection[]>([]);
  const [recognitions, setRecognitions] = React.useState<RecognitionEvent[]>([]);
  const [health, setHealth] = React.useState<HealthResponse | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadHealth = React.useCallback(async () => {
    try {
      const response = await getHealth();
      setHealth(response);
      setError(null);
    } catch (healthError) {
      setHealth(null);
      setError(
        healthError instanceof Error ? healthError.message : "Failed to reach the CV backend."
      );
    }
  }, []);

  const loadRecentRecognitions = React.useCallback(async () => {
    try {
      setRecognitions(await getRecentRecognitions());
    } catch (recognitionError) {
      setError(
        recognitionError instanceof Error
          ? recognitionError.message
          : "Failed to load recognitions."
      );
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

        if (!active || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      } catch (cameraError) {
        setError(
          cameraError instanceof Error
            ? cameraError.message
            : "Failed to access the browser camera."
        );
        setCameraReady(false);
      }
    }

    void startCamera();

    return () => {
      active = false;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  React.useEffect(() => {
    void loadHealth();
    void loadRecentRecognitions();

    const healthInterval = window.setInterval(() => void loadHealth(), 5000);
    const recognitionInterval = window.setInterval(() => void loadRecentRecognitions(), 2000);

    return () => {
      window.clearInterval(healthInterval);
      window.clearInterval(recognitionInterval);
    };
  }, [loadHealth, loadRecentRecognitions]);

  React.useEffect(() => {
    if (!cameraReady) {
      return;
    }

    const interval = window.setInterval(async () => {
      if (analysisInFlightRef.current || !videoRef.current || document.hidden) {
        return;
      }

      analysisInFlightRef.current = true;
      setAnalyzing(true);

      try {
        const frame = await captureVideoFrame(videoRef.current, {
          maxWidth: 640,
          quality: 0.8,
        });
        const result = await recognizeFrame(frame);
        setDetections(result.detections);
        if (result.createdAttendance.length > 0) {
          void loadRecentRecognitions();
        }
      } catch (recognitionError) {
        setError(
          recognitionError instanceof Error
            ? recognitionError.message
            : "Failed to analyze the current frame."
        );
      } finally {
        analysisInFlightRef.current = false;
        setAnalyzing(false);
      }
    }, 500);

    return () => {
      window.clearInterval(interval);
    };
  }, [cameraReady, loadRecentRecognitions]);

  return (
    <>
      <LiveMonitorHeader
        backendOnline={Boolean(health)}
        modelReady={health?.modelReady ?? false}
        employeeCount={health?.employeeCount ?? 0}
      />

      <main className="flex-1 h-full overflow-hidden p-4 md:p-6">
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              void loadHealth();
              void loadRecentRecognitions();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-4 border-destructive/30 bg-destructive/5 py-4">
            <CardContent className="flex items-center gap-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </CardContent>
          </Card>
        )}

        <div className="flex h-full flex-col gap-4 md:gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <CameraFeed
              videoRef={videoRef}
              detections={detections}
              cameraReady={cameraReady}
              analyzing={analyzing}
              error={error}
            />
          </div>

          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-96">
            <div className="min-h-0 flex-1">
              <RecognitionFeed recognitions={recognitions} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
