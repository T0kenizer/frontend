'use client';

import {
  FeltDivider,
  FeltHeader,
  FeltNotice,
  FeltPanel,
} from '@components/game/felt/felt-stage';
import { Button } from '@components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@components/ui/input-otp';
import { useQrScanningSupport } from '@hooks/use-qr-scanner';
import { JOIN_CODE_LENGTH } from '@tokenizer/shared/constants/games.constants';
import { ChevronRight, ScanLine } from 'lucide-react';
import { useState } from 'react';

export interface JoinIdentifyStepProps {
  onSubmitCode: (code: string) => Promise<void>;
  onOpenScanner: () => void;
}

const SLOTS = Array.from({ length: JOIN_CODE_LENGTH }, (_, index) => index);

export const JoinIdentifyStep: React.FC<JoinIdentifyStepProps> = ({
  onSubmitCode,
  onOpenScanner,
}) => {
  const [code, setCode] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<Nullable<string>>(null);

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
    <FeltPanel>
      <FeltHeader
        className="mb-6"
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
            <InputOTPSlot key={index} index={index} variant="felt" />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {error && (
        <FeltNotice tone="error" className="mt-3.5 font-semibold">
          {error}
        </FeltNotice>
      )}

      {canScan && (
        <>
          <FeltDivider className="my-5">or</FeltDivider>

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
    </FeltPanel>
  );
};
