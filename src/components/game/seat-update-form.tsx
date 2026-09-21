'use client';

import { Button } from '@components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';
import type { ParticipantSnapshot } from '@tokenizer/shared/types';
import * as React from 'react';
import { toast } from 'sonner';

export interface SeatUpdateFormProps {
  seat: ParticipantSnapshot;
  onCancel: () => void;
  onSubmit: (data: { displayName?: Nullable<string> }) => Promise<void>;
}

/** Renames the seat this client's token belongs to. */
export const SeatUpdateForm: React.FC<SeatUpdateFormProps> = ({
  seat,
  onCancel,
  onSubmit,
}) => {
  const [displayName, setDisplayName] = React.useState(seat.displayName);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!displayName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        displayName:
          displayName.trim() === seat.displayName
            ? undefined
            : displayName.trim(),
      });
    } catch (error) {
      toast.error(
        (error instanceof Error && error.message) ||
          'Failed to update the seat',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="seat-update-display-name">Your name</FieldLabel>
          <Input
            id="seat-update-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            required
          />
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={!displayName.trim() || isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
