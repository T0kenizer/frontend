'use client';

import { Button } from '@components/ui/button';
import { Camera, RotateCcw } from 'lucide-react';
import * as React from 'react';

export interface CameraCaptureProps {
  /** Called with the captured frame (a JPEG data-URL) once confirmed. */
  onCapture: (dataUrl: string) => void;
  className?: string;
}

/**
 * Live camera capture only — no file/gallery import. Streams the device
 * camera into a `<video>`, grabs a single frame onto a canvas on demand, and
 * hands the caller a JPEG data-URL once confirmed. The stream is torn down as
 * soon as a frame is captured or the component unmounts.
 */
export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  className,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<Nullable<MediaStream>>(null);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<Nullable<string>>(null);
  const [preview, setPreview] = React.useState<Nullable<string>>(null);

  const stopStream = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsStreaming(false);
  }, []);

  const startStream = React.useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsStreaming(true);
    } catch {
      setError('Camera access was denied or is unavailable');
    }
  }, []);

  React.useEffect(() => {
    // Camera permission/init is inherently async (device prompt); the
    // resulting setState happens in a resolved promise, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(dataUrl);
    stopStream();
    onCapture(dataUrl);
  };

  const retake = () => {
    setPreview(null);
    void startStream();
  };

  return (
    <div className={className}>
      {error && <p className="text-destructive text-sm">{error}</p>}

      {preview ? (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient data: URL, not a remote asset */}
          <img
            src={preview}
            alt="Captured seat photo"
            className="aspect-square w-full max-w-56 rounded-md object-cover"
          />
          <Button type="button" variant="secondary" size="sm" onClick={retake}>
            <RotateCcw />
            Retake
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-square w-full max-w-56 rounded-md bg-black object-cover"
          />
          <Button
            type="button"
            size="sm"
            onClick={capture}
            disabled={!isStreaming}
          >
            <Camera />
            Take photo
          </Button>
        </div>
      )}
    </div>
  );
};
