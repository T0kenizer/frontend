'use client';

import {
  JoinBackButton,
  JoinHeader,
  JoinPanel,
} from '@components/game/join/join-stage';
import { Button } from '@components/ui/button';
import { Field, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';
import { SEAT_DISPLAY_NAME_MAX_LENGTH } from '@constants/games';
import type { GameSnapshot } from '@tokenizer/shared/types';
import * as React from 'react';
import { toast } from 'sonner';

export interface JoinIdentityStepProps {
  snapshot: GameSnapshot;
  seatIndex: number;
  /**
   * The name to open with, from the signed-in account when there is one.
   * Falling back to the seat's own configured name keeps the host's table plan
   * visible rather than replacing it with an empty box.
   */
  defaultDisplayName?: string;
  /**
   * Claims the seat. `displayName` is omitted when the visitor left the
   * pre-filled value alone, so the seat keeps falling back to the account (and
   * then the config) default, resolved server-side.
   */
  onSit: (data: { displayName?: string }) => Promise<void>;
  onBack: () => void;
}

/**
 * Step three: who are you at this table?
 *
 * The seat exists before this screen and keeps existing if the visitor walks
 * away — all that is settled here is the name on it, which is why the flow
 * calls this modifying a seat rather than creating one.
 */
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
    <JoinPanel>
      <JoinBackButton onClick={onBack}>Change seat</JoinBackButton>
      <JoinHeader
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
            className="border-on-media-border bg-on-media-scrim text-on-media-foreground placeholder:text-on-media-muted-foreground focus-visible:border-warning focus-visible:ring-warning/25 h-11"
          />
        </Field>

        {seat && (
          <div className="border-on-media-hairline bg-on-media-scrim flex items-center gap-3 rounded-xl border px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="text-on-media-muted-foreground block text-[0.65rem] font-bold tracking-[0.08em] uppercase">
                Your stack
              </span>
              <span className="mt-0.5 block text-lg font-extrabold tabular-nums">
                {seat.balance}
              </span>
            </span>
            <span className="text-on-media-muted-foreground shrink-0 text-right text-xs leading-relaxed">
              Set by the host
              <br />
              when the table opened
            </span>
          </div>
        )}

        <Button
          type="submit"
          variant="felt-inverse"
          size="lg"
          loading={isSubmitting}
          disabled={!displayName.trim()}
          className="h-11 w-full"
        >
          {isSubmitting ? 'Sitting down…' : 'Sit at the table'}
        </Button>
      </form>
    </JoinPanel>
  );
};
