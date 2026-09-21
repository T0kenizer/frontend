'use client';

import { Button } from '@components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@components/ui/field';
import { Input } from '@components/ui/input';
import * as React from 'react';
import { toast } from 'sonner';

export interface SeatJoinFormProps {
  seatIndex: number;
  /** Pre-filled from the signed-in account, if any; replaceable. */
  defaultDisplayName?: string;
  onCancel: () => void;
  onSubmit: (data: {
    /** Omitted when left as the pre-filled default (falls back server-side). */
    displayName?: string;
  }) => Promise<void>;
}

/**
 * The name a visitor sits down under. A signed-in visitor sees their account
 * name pre-filled but can replace it — only an actual change is sent as an
 * override, so the seat otherwise keeps falling back to the account (and then
 * the config) default, resolved server-side.
 */
export const SeatJoinForm: React.FC<SeatJoinFormProps> = ({
  seatIndex,
  defaultDisplayName = '',
  onCancel,
  onSubmit,
}) => {
  const [displayName, setDisplayName] = React.useState(defaultDisplayName);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!displayName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        displayName:
          displayName.trim() === defaultDisplayName
            ? undefined
            : displayName.trim(),
      });
    } catch (error) {
      toast.error(
        (error instanceof Error && error.message) || 'Failed to join the seat',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="seat-display-name">
            Your name (seat #{seatIndex})
          </FieldLabel>
          <Input
            id="seat-display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            required
          />
          {!displayName.trim() && (
            <FieldError errors={[{ message: 'A display name is required' }]} />
          )}
        </Field>
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" disabled={!displayName.trim() || isSubmitting}>
          {isSubmitting ? 'Joining…' : 'Take this seat'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
