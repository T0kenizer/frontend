'use client';

import { JoinHeader, JoinPanel } from '@components/game/join/join-stage';
import { Button } from '@components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@components/ui/input-otp';
import { JOIN_CODE_LENGTH } from '@constants/games';
import { useQrScanningSupport } from '@hooks/use-qr-scanner';
import { cn } from '@lib/utils';
import { ChevronRight, CircleAlert, ScanLine } from 'lucide-react';
import * as React from 'react';

export interface JoinIdentifyStepProps {
  /** Resolves a code to its room. Rejects when the code does not resolve. */
  onSubmitCode: (code: string) => Promise<void>;
  onOpenScanner: () => void;
}

const SLOTS = Array.from({ length: JOIN_CODE_LENGTH }, (_, index) => index);

/**
 * Step one: which table?
 *
 * The code submits itself on the sixth digit rather than behind a button —
 * there is nothing left to decide once it is complete, and a visitor reading
 * digits off a screen across a room should not have to look back down at their
 * phone to find a confirm. A code that does not resolve clears itself and hands
 * focus back to the first slot, because the likeliest cause is a misread digit
 * and retyping six is faster than hunting for the wrong one.
 */
export const JoinIdentifyStep: React.FC<JoinIdentifyStepProps> = ({
  onSubmitCode,
  onOpenScanner,
}) => {
  const [code, setCode] = React.useState('');
  const [isResolving, setIsResolving] = React.useState(false);
  const [error, setError] = React.useState<Nullable<string>>(null);

  // Feature detection touches `window`, so it cannot answer during the server
  // render: the scan entry point appears on the client or not at all.
  const canScan = useQrScanningSupport();

  const handleChange = async (value: string) => {
    setCode(value);
    setError(null);
    if (value.length < JOIN_CODE_LENGTH || isResolving) return;

    setIsResolving(true);
    try {
      await onSubmitCode(value);
    } catch (cause) {
      setError(
        (cause instanceof Error && cause.message) || 'No table with that code.',
      );
      setCode('');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <JoinPanel>
      <JoinHeader
        eyebrow="Join a game"
        title="Enter the table code"
        description={`${JOIN_CODE_LENGTH} digits shown on the host's screen.`}
      />

      <InputOTP
        autoFocus
        value={code}
        onChange={(value) => void handleChange(value)}
        maxLength={JOIN_CODE_LENGTH}
        disabled={isResolving}
        aria-invalid={!!error}
        aria-label="Table code"
        containerClassName="w-full"
      >
        <InputOTPGroup className="w-full gap-2">
          {SLOTS.map((index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(
                'border-on-media-border bg-on-media-scrim text-on-media-foreground data-[active=true]:border-warning data-[active=true]:ring-warning/25 h-14 flex-1 rounded-lg border text-2xl font-extrabold tabular-nums transition-colors first:rounded-l-lg last:rounded-r-lg',
                error && 'border-destructive',
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {error && (
        <p
          role="alert"
          className="text-destructive mt-3.5 flex items-center gap-2 text-xs font-semibold"
        >
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      )}

      {canScan && (
        <>
          <div className="text-on-media-muted-foreground my-5 flex items-center gap-3 text-[0.65rem] font-bold tracking-[0.1em] uppercase">
            <span className="bg-on-media-hairline h-px flex-1" />
            or
            <span className="bg-on-media-hairline h-px flex-1" />
          </div>

          <Button
            variant="line"
            onClick={onOpenScanner}
            className="h-auto w-full justify-start gap-3.5 rounded-xl px-4 py-3.5 text-left"
          >
            <span className="bg-on-media-scrim grid size-10 shrink-0 place-items-center rounded-lg">
              <ScanLine className="text-warning size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Scan the QR code</span>
              <span className="text-on-media-muted-foreground block text-xs font-normal">
                The host shows it on the TV.
              </span>
            </span>
            <ChevronRight className="ml-auto shrink-0 opacity-60" />
          </Button>
        </>
      )}
    </JoinPanel>
  );
};
