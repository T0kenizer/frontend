import * as React from 'react';

export type CameraStatus =
  | 'idle'
  | 'starting'
  | 'live'
  | 'denied'
  | 'unavailable';

export interface UseCameraParams {
  enabled: boolean;
}

const PHOTO_SIZE_PX = 640;

const PHOTO_MIME_TYPE = 'image/jpeg';
const PHOTO_QUALITY = 0.9;

const subscribeToNothing = () => () => {};

const detectSupport = () =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

export function useCameraSupport(): boolean {
  return React.useSyncExternalStore(
    subscribeToNothing,
    detectSupport,
    () => false,
  );
}

export function useCamera({ enabled }: UseCameraParams) {
  const videoRef = React.useRef<Nullable<HTMLVideoElement>>(null);
  const isSupported = useCameraSupport();

  const [isLive, setIsLive] = React.useState(false);
  const [isDenied, setIsDenied] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || !isSupported) return;

    let stream: Nullable<MediaStream> = null;
    let cancelled = false;

    const release = () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
        });
      } catch {
        if (!cancelled) setIsDenied(true);
        return;
      }
      if (cancelled || !videoRef.current) {
        release();
        return;
      }

      const video = videoRef.current;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        if (!cancelled) setIsDenied(true);
        release();
        return;
      }
      if (cancelled) return;
      setIsDenied(false);
      setIsLive(true);
    };

    void run();

    return () => {
      release();
      setIsLive(false);
      setIsDenied(false);
    };
  }, [enabled, isSupported]);

  const capture = React.useCallback(async (): Promise<File> => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) {
      throw new Error('The camera is not ready yet');
    }

    const side = Math.min(video.videoWidth, video.videoHeight);
    const size = Math.min(side, PHOTO_SIZE_PX);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not take the photo');

    context.translate(size, 0);
    context.scale(-1, 1);
    context.drawImage(
      video,
      (video.videoWidth - side) / 2,
      (video.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );

    const blob = await new Promise<Nullable<Blob>>((resolve) =>
      canvas.toBlob(resolve, PHOTO_MIME_TYPE, PHOTO_QUALITY),
    );
    if (!blob) throw new Error('Could not take the photo');

    return new File([blob], 'seat-photo.jpg', { type: PHOTO_MIME_TYPE });
  }, []);

  const status: CameraStatus = !enabled
    ? 'idle'
    : !isSupported
      ? 'unavailable'
      : isDenied
        ? 'denied'
        : isLive
          ? 'live'
          : 'starting';

  return { videoRef, status, capture };
}
