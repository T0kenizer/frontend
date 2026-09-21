'use client';

import {
  JoinBackButton,
  JoinHeader,
  JoinPanel,
} from '@components/game/join/join-stage';
import { useQrScanner } from '@hooks/use-qr-scanner';
import * as React from 'react';

export interface JoinScannerStepProps {
  /** Called with the session uuid a scanned join link resolves to. */
  onScanned: (gameUuid: string) => void;
  onBack: () => void;
}

/**
 * Every shape the session uuid can arrive in. Tokenizer's own QR carries the
 * full join link, but a code printed by hand — or a uuid copied out of a chat —
 * is just as usable, so the uuid is matched wherever it sits in the payload.
 */
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * Pulls the session uuid out of whatever the camera read.
 *
 * Only the uuid is taken from the scanned value — never its origin. A QR is a
 * thing anyone can print and tape over the host's, so treating the payload as a
 * URL to follow would turn a joining player into someone else's redirect.
 * Extracting the identifier and routing internally means a hostile code can at
 * worst name a different Tokenizer room.
 */
export function extractGameUuid(scanned: string): Nullable<string> {
  return UUID_PATTERN.exec(scanned)?.[0]?.toLowerCase() ?? null;
}

/**
 * The camera detour off step one. It is not a step of its own: a scan lands on
 * the same seat picker the six digits do, because the code and the QR are two
 * ways of naming one room.
 */
export const JoinScannerStep: React.FC<JoinScannerStepProps> = ({
  onScanned,
  onBack,
}) => {
  const [error, setError] = React.useState<Nullable<string>>(null);

  const handleScan = React.useCallback(
    (value: string) => {
      const gameUuid = extractGameUuid(value);
      if (!gameUuid) {
        setError('That code is not a Tokenizer table.');
        return;
      }
      onScanned(gameUuid);
    },
    [onScanned],
  );

  // A code that was not a table stops the loop, so the camera is only kept
  // alive while there is still something it could usefully read.
  const { videoRef, status } = useQrScanner({
    enabled: !error,
    onScan: handleScan,
  });

  const hint =
    error ??
    (status === 'denied'
      ? 'No camera access — enter the code by hand instead.'
      : status === 'scanning'
        ? 'Looking for a code…'
        : 'Starting the camera…');

  return (
    <JoinPanel>
      <JoinBackButton onClick={onBack}>Enter the code by hand</JoinBackButton>
      <JoinHeader
        eyebrow="Camera"
        title="Frame the QR on the TV"
        description="The table is recognised automatically."
      />

      <div className="border-on-media-border bg-on-media-scrim relative aspect-square overflow-hidden rounded-2xl border">
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Camera preview"
          className="size-full object-cover"
        />

        {/* The finder. Purely a sighting aid — the detector reads the whole
            frame, so a code outside the brackets still scans. */}
        <div aria-hidden className="pointer-events-none absolute inset-[18%]">
          <span className="border-warning absolute top-0 left-0 size-8 rounded-tl-md border-t-[3px] border-l-[3px]" />
          <span className="border-warning absolute top-0 right-0 size-8 rounded-tr-md border-t-[3px] border-r-[3px]" />
          <span className="border-warning absolute bottom-0 left-0 size-8 rounded-bl-md border-b-[3px] border-l-[3px]" />
          <span className="border-warning absolute right-0 bottom-0 size-8 rounded-br-md border-r-[3px] border-b-[3px]" />
        </div>

        <p
          role="status"
          className="text-on-media-foreground absolute inset-x-0 bottom-3.5 text-center text-xs font-semibold [text-shadow:0_1px_3px_oklch(0_0_0/0.8)]"
        >
          {hint}
        </p>
      </div>
    </JoinPanel>
  );
};
