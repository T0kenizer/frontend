'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { CameraCapture } from '@components/game/camera-capture';
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
  /** Pre-filled avatar URL from the signed-in account, if any; replaceable. */
  defaultPhotoUrl?: string;
  onCancel: () => void;
  onSubmit: (data: {
    /** Omitted when left as the pre-filled default (falls back server-side). */
    displayName?: string;
    /** A captured JPEG data-URL; omitted when left as the pre-filled default. */
    photo?: string;
  }) => Promise<void>;
}

/**
 * Name + live camera capture, submitted together to claim a seat. A
 * signed-in visitor sees their account name/avatar pre-filled but can
 * replace either — only an actual change is sent as an override.
 */
export const SeatJoinForm: React.FC<SeatJoinFormProps> = ({
  seatIndex,
  defaultDisplayName = '',
  defaultPhotoUrl,
  onCancel,
  onSubmit,
}) => {
  const [displayName, setDisplayName] = React.useState(defaultDisplayName);
  const [capturedPhoto, setCapturedPhoto] = React.useState<
    Optional<string>
  >(undefined);
  const [isRetaking, setIsRetaking] = React.useState(!defaultPhotoUrl);
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
        photo: capturedPhoto,
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

        <Field>
          <FieldLabel>Seat photo</FieldLabel>
          {isRetaking ? (
            <CameraCapture
              onCapture={(dataUrl) => {
                setCapturedPhoto(dataUrl);
                setIsRetaking(false);
              }}
            />
          ) : (
            <div className="flex items-center gap-3">
              <Avatar size="xl">
                <AvatarImage src={capturedPhoto ?? defaultPhotoUrl} alt="" />
                <AvatarFallback />
              </Avatar>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsRetaking(true)}
              >
                Retake
              </Button>
            </div>
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
