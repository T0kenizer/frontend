'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { CameraCapture } from '@components/game/camera-capture';
import { Field, FieldGroup, FieldLabel } from '@components/ui/field';
import { Input } from '@components/ui/input';
import { resolveApiUrl } from '@services/games/games.api';
import type { ParticipantSnapshot } from '@tokenizer/shared/types';
import * as React from 'react';
import { toast } from 'sonner';

export interface SeatUpdateFormProps {
  seat: ParticipantSnapshot;
  onCancel: () => void;
  onSubmit: (data: {
    displayName?: Nullable<string>;
    photo?: Nullable<string>;
  }) => Promise<void>;
}

/** Renames/re-photos a seat the visitor already controls. */
export const SeatUpdateForm: React.FC<SeatUpdateFormProps> = ({
  seat,
  onCancel,
  onSubmit,
}) => {
  const [displayName, setDisplayName] = React.useState(seat.displayName);
  // Holds either the seat's current (relative, API-resolved) photo URL, a
  // freshly captured data-URL, or null (cleared) — resolved for display only.
  const [photoUrl, setPhotoUrl] = React.useState<Nullable<string>>(
    seat.photoUrl,
  );
  const [isRetaking, setIsRetaking] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const displayedPhotoUrl =
    photoUrl && photoUrl === seat.photoUrl ? resolveApiUrl(photoUrl) : photoUrl;

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
        photo: photoUrl === seat.photoUrl ? undefined : photoUrl,
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

        <Field>
          <FieldLabel>Seat photo</FieldLabel>
          {isRetaking ? (
            <CameraCapture
              onCapture={(dataUrl) => {
                setPhotoUrl(dataUrl);
                setIsRetaking(false);
              }}
            />
          ) : (
            <div className="flex items-center gap-3">
              <Avatar size="xl">
                {displayedPhotoUrl && (
                  <AvatarImage src={displayedPhotoUrl} alt="" />
                )}
                <AvatarFallback />
              </Avatar>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsRetaking(true)}
              >
                Retake photo
              </Button>
              {photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhotoUrl(null)}
                >
                  Remove
                </Button>
              )}
            </div>
          )}
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
