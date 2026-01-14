"use client";

import { LiveMonitorHeader } from "@/components/live-monitor/live-monitor-header";
import { CameraFeed } from "@/components/live-monitor/camera-feed";
import { RecognitionFeed, Recognition } from "@/components/live-monitor/recognition-feed";

// Mock recognition data
const mockRecognitions: Recognition[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    role: "Product Designer",
    initials: "SJ",
    status: "entry",
    time: "09:42 AM",
    isLive: true,
  },
  {
    id: "2",
    name: "Mark Thompson",
    role: "Engineering Lead",
    initials: "MT",
    status: "entry",
    time: "09:38 AM",
  },
  {
    id: "3",
    name: "Lisa Wong",
    role: "Marketing",
    initials: "LW",
    status: "late",
    time: "09:35 AM",
  },
  {
    id: "4",
    name: "James Miller",
    role: "Sales Director",
    initials: "JM",
    status: "entry",
    time: "09:12 AM",
  },
  {
    id: "5",
    status: "unknown",
    time: "09:05 AM",
  },
  {
    id: "6",
    name: "David Chen",
    role: "Developer",
    initials: "DC",
    status: "entry",
    time: "08:58 AM",
  },
  {
    id: "7",
    name: "Emily Davis",
    role: "HR Manager",
    initials: "ED",
    status: "entry",
    time: "08:55 AM",
  },
];

// Mock bounding boxes for face detection overlay
const mockBoundingBoxes = [
  {
    id: "bb1",
    name: "Sarah Jenkins",
    employeeId: "#8821",
    confidence: 98,
    position: { top: "25%", left: "30%" },
    size: { width: "120px", height: "140px" },
    status: "identified" as const,
  },
  {
    id: "bb2",
    position: { top: "32%", left: "68%" },
    size: { width: "90px", height: "100px" },
    status: "analyzing" as const,
  },
];

export default function LiveMonitorPage() {
  return (
    <>
      {/* Header */}
      <LiveMonitorHeader
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full">
          {/* Camera Feed - Takes most of the space */}
          <div className="flex-1 min-w-0">
            <CameraFeed
              boundingBoxes={mockBoundingBoxes}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">

            {/* Recognition Feed - Grows to fill remaining space */}
            <div className="flex-1 min-h-0">
              <RecognitionFeed
                recognitions={mockRecognitions}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
