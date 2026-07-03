import { useState } from "react";
import Webcam from "react-webcam";

export default function WebcamView() {
  const [cameraError, setCameraError] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#283144] bg-[#0a0e16]">
      {!cameraError ? (
        <Webcam
          className="h-full w-full object-cover"
          audio={false}
          mirrored
          onUserMediaError={() => setCameraError(true)}
          videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
        />
      ) : (
        <div className="grid h-full place-items-center p-8 text-center">
          <div><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#1b2130] text-2xl">◉</div><p className="mt-4 font-bold">Camera unavailable</p><p className="muted mt-2 text-xs">You can continue with voice or typed answers.</p></div>
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold backdrop-blur-md">PREVIEW</span>
    </div>
  );
}
