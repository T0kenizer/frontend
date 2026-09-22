'use client';

import {
  FeltBackLink,
  FeltHeader,
  FeltPanel,
  FeltStat,
} from '@components/game/felt/felt-stage';
import { Button } from '@components/ui/button';
import { Field, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';
import { SEAT_DISPLAY_NAME_MAX_LENGTH } from '@constants/games';
import { formatAmount } from '@lib/amount';
import type { GameSnapshot } from '@tokenizer/shared/types';
import * as React from 'react';
import { toast } from 'sonner';

export interface JoinIdentityStepProps {
  snapshot: GameSnapshot;
  seatIndex: number;
  defaultDisplayName?: string;
  onSit: (data: { displayName?: string }) => Promise<void>;
  onBack: () => void;
}

export const JoinIdentityStep: React.FC<JoinIdentityStepProps> = ({
  snapshot,
  seatIndex,
  defaultDisplayName,
  onSit,
  onBack,
}) => {
  const seat = snapshot.participants.find(
    (participant) => participant.seatIndex === seatIndex,
  );

  // The account name wins when there is one; otherwise the visitor starts from
  // whatever the host called this chair.
  const initialName = defaultDisplayName ?? seat?.displayName ?? '';
  const [displayName, setDisplayName] = React.useState(initialName);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = displayName.trim();
    if (!name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSit({ displayName: name === initialName ? undefined : name });
    } catch (cause) {
      toast.error(
        (cause instanceof Error && cause.message) || 'Could not take the seat',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FeltPanel>
      <FeltBackLink className="mb-4" onClick={onBack}>
        Change seat
      </FeltBackLink>
      <FeltHeader
        className="mb-6"
        eyebrow={`Seat ${seatIndex + 1} · ${snapshot.name}`}
        title="What should we call you?"
        description="This is what the others see at the table. You can change it in play."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field>
          <FieldLabel htmlFor="join-display-name">Name at the table</FieldLabel>
          <Input
            id="join-display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={SEAT_DISPLAY_NAME_MAX_LENGTH}
            autoComplete="nickname"
            placeholder="Your name at the table"
            required
            variant="felt"
            size="xl"
          />
        </Field>

        {seat && (
          <dl className="border-on-media-hairline bg-on-media-scrim flex items-center gap-3 rounded-xl border px-4 py-3">
            <FeltStat
              className="flex-1"
              label="Your stack"
              value={formatAmount(seat.balance)}
            />
            <span className="text-on-media-muted-foreground shrink-0 text-right text-xs leading-relaxed">
              Set by the host
              <br />
              when the table opened
            </span>
          </dl>
        )}

        <Button
          type="submit"
          variant="felt-inverse"
          size="xl"
          loading={isSubmitting}
          disabled={!displayName.trim()}
          className="w-full"
        >
          {isSubmitting ? 'Sitting down…' : 'Sit at the table'}
        </Button>
      </form>
    </FeltPanel>
  );
};
