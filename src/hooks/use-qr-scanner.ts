import * as React from 'react';

/** What the scanner is doing, and why it stopped if it did. */
export type QrScannerStatus =
  | 'idle'
  | 'starting'
  | 'scanning'
  | 'denied'
  | 'unavailable';

export interface UseQrScannerParams {
  /** Start the camera. Turning this off releases it. */
  enabled: boolean;
  /**
   * Called once per scan, with the decoded text. Fired at most once per run:
   * the loop stops on the first hit so a code is never read twice.
   */
  onScan: (value: string) => void;
}

/** How often the video frame is handed to the detector. */
const SCAN_INTERVAL_MS = 320;

/** Support never changes within a page, so there is nothing to subscribe to. */
const subscribeToNothing = () => () => {};

const detectSupport = () =>
  typeof window !== 'undefined' &&
  'BarcodeDetector' in window &&
  !!navigator.mediaDevices;

/**
 * Whether this browser can decode a QR out of a camera stream.
 *
 * Read through `useSyncExternalStore` rather than an effect, so the server
 * render and the first client render agree on `false` and the answer arrives
 * during hydration instead of in a second pass.
 */
export function useQrScanningSupport(): boolean {
  return React.useSyncExternalStore(
    subscribeToNothing,
    detectSupport,
    () => false,
  );
}

/**
 * Reads a QR out of the rear camera with the browser's own detector.
 *
 * There is deliberately no decoding library behind this. The join screen is
 * public and unauthenticated, so it is the one page where a few hundred
 * kilobytes of JavaScript are felt most — and where they would buy nothing for
 * the visitor who can already type the six digits sitting right above the scan
 * button. A browser without `BarcodeDetector` reports `unavailable`, and the
 * caller hides the entry point rather than offering a camera that cannot see.
 *
 * The stream is owned here and torn down on every exit — an effect cleanup, an
 * unmount, a successful scan. A camera left running behind a routed-away page
 * keeps its indicator light on, which reads as the app spying.
 */
export function useQrScanner({ enabled, onScan }: UseQrScannerParams) {
  const videoRef = React.useRef<Nullable<HTMLVideoElement>>(null);
  const isSupported = useQrScanningSupport();

  // Only the two outcomes the camera itself decides are stored; `idle`,
  // `unavailable` and `starting` are all derivable from what the caller asked
  // for and what the browser can do, so they never need a render of their own.
  const [isLive, setIsLive] = React.useState(false);
  const [isDenied, setIsDenied] = React.useState(false);

  // Kept in a ref so a caller passing an inline closure does not restart the
  // camera on every render it happens to be recreated in.
  const onScanRef = React.useRef(onScan);
  React.useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  React.useEffect(() => {
    if (!enabled || !isSupported) return;

    let stream: Nullable<MediaStream> = null;
    let timer: Optional<ReturnType<typeof setTimeout>>;
    // Survives the async gaps below: an unmount between two awaits must not
    // leave a stream running with nothing left to release it.
    let cancelled = false;

    const release = () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    const run = async () => {
      const detector = new window.BarcodeDetector!({ formats: ['qr_code'] });

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          // The host holds the code up on a TV, so the visitor points the back
          // of their phone at it.
          video: { facingMode: 'environment' },
        });
      } catch {
        // Denied, already in use, or no camera at all: one dead end for the
        // visitor, who is sent back to typing the code either way.
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

      const tick = async () => {
        if (cancelled || !videoRef.current) return;

        try {
          const [barcode] = await detector.detect(videoRef.current);
          if (barcode?.rawValue) {
            release();
            onScanRef.current(barcode.rawValue);
            return;
          }
        } catch {
          // A frame the detector cannot read is the normal case while the
          // visitor lines the code up; the next one is a fresh chance.
        }
        timer = setTimeout(() => void tick(), SCAN_INTERVAL_MS);
      };

      timer = setTimeout(() => void tick(), SCAN_INTERVAL_MS);
    };

    void run();

    return () => {
      release();
      // Back to square one, so re-enabling the scanner reports `starting`
      // rather than replaying the verdict of the run before it.
      setIsLive(false);
      setIsDenied(false);
    };
  }, [enabled, isSupported]);

  const status: QrScannerStatus = !enabled
    ? 'idle'
    : !isSupported
      ? 'unavailable'
      : isDenied
        ? 'denied'
        : isLive
          ? 'scanning'
          : 'starting';

  return { videoRef, status };
}
