'use client';

import {
  FeltBackLink,
  FeltHeader,
  FeltPanel,
} from '@components/game/felt/felt-stage';
import { useQrScanner } from '@hooks/use-qr-scanner';
import * as React from 'react';

export interface JoinScannerStepProps {
  onScanned: (gameUuid: string) => void;
  onBack: () => void;
}

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function extractGameUuid(scanned: string): Nullable<string> {
  return UUID_PATTERN.exec(scanned)?.[0]?.toLowerCase() ?? null;
}

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
    <FeltPanel>
      <FeltBackLink className="mb-4" onClick={onBack}>
        Enter the code by hand
      </FeltBackLink>
      <FeltHeader
        className="mb-6"
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
    </FeltPanel>
  );
};
