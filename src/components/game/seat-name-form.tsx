'use client';

import {
  SeatAvatarPicker,
  type SeatAvatarChange,
} from '@components/game/seat-avatar-picker';
import { Button } from '@components/ui/button';
import { Field, FieldError, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';
import { SEAT_DISPLAY_NAME_MAX_LENGTH } from '@constants/games';
import { useState } from 'react';
import { toast } from 'sonner';

export type SeatNameMode = 'claim' | 'rename';

const COPY: Record<
  SeatNameMode,
  { submit: string; pending: string; failure: string }
> = {
  claim: {
    submit: 'Take this seat',
    pending: 'Sitting down…',
    failure: 'Could not take the seat',
  },
  rename: {
    submit: 'Save',
    pending: 'Saving…',
    failure: 'Could not rename the seat',
  },
};

export interface SeatNameFormProps {
  mode: SeatNameMode;
  defaultDisplayName?: string;
  currentAvatarUrl?: Nullable<string>;
  seatIndex?: number;
  onCancel: () => void;
  onSubmit: (data: {
    displayName?: string;
    avatar: SeatAvatarChange;
  }) => Promise<void>;
}

export const SeatNameForm: React.FC<SeatNameFormProps> = ({
  mode,
  defaultDisplayName = '',
  currentAvatarUrl = null,
  seatIndex,
  onCancel,
  onSubmit,
}) => {
  const copy = COPY[mode];
  const fieldId = `seat-name-${mode}`;

  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [avatar, setAvatar] = useState<SeatAvatarChange>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = displayName.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        displayName: trimmed === defaultDisplayName ? undefined : trimmed,
        avatar,
      });
    } catch (cause) {
      toast.error((cause instanceof Error && cause.message) || copy.failure);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <SeatAvatarPicker
        currentUrl={currentAvatarUrl}
        canRemove={mode === 'rename'}
        disabled={isSubmitting}
        onChange={setAvatar}
      />

      <Field>
        <FieldLabel htmlFor={fieldId} className="text-xs font-semibold">
          {seatIndex === undefined
            ? 'Your name at the table'
            : `Your name (seat ${seatIndex + 1})`}
        </FieldLabel>
        <Input
          id={fieldId}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={SEAT_DISPLAY_NAME_MAX_LENGTH}
          autoComplete="nickname"
          placeholder="Your name at the table"
          aria-invalid={!trimmed}
          required
          variant="felt"
          size="lg"
        />
        {!trimmed && (
          <FieldError errors={[{ message: 'A display name is required' }]} />
        )}
      </Field>

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="gold"
          loading={isSubmitting}
          disabled={!trimmed}
        >
          {isSubmitting ? copy.pending : copy.submit}
        </Button>
        <Button type="button" variant="line" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
