'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { useCamera } from '@hooks/use-camera';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@tokenizer/shared/constants/files.constants';
import { Camera, ImageUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));

export type SeatAvatarChange = Optional<Nullable<File>>;

export interface SeatAvatarPickerProps {
  currentUrl?: Nullable<string>;
  canRemove?: boolean;
  disabled?: boolean;
  onChange: (change: SeatAvatarChange) => void;
}

type Shown =
  | { kind: 'current' }
  | { kind: 'picked'; url: string }
  | { kind: 'removed' };

export const SeatAvatarPicker: React.FC<SeatAvatarPickerProps> = ({
  currentUrl = null,
  canRemove = false,
  disabled = false,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [shown, setShown] = useState<Shown>({ kind: 'current' });

  const { videoRef, status, capture } = useCamera({ enabled: isShooting });
  const hasNoCamera = status === 'denied' || status === 'unavailable';

  const previewRef = useRef<Nullable<string>>(null);
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const show = (next: Shown) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = next.kind === 'picked' ? next.url : null;
    setShown(next);
  };

  const pick = (file: File) => {
    show({ kind: 'picked', url: URL.createObjectURL(file) });
    onChange(file);
  };

  const handleCapture = async () => {
    try {
      pick(await capture());
      setIsShooting(false);
    } catch (cause) {
      toast.error(
        (cause instanceof Error && cause.message) || 'Could not take the photo',
      );
    }
  };

  const handleChoose = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type as never)) {
      toast.error('The avatar must be a PNG, JPEG, WebP or GIF image');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`The avatar must be smaller than ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    setIsShooting(false);
    pick(file);
  };

  const handleDiscard = () => {
    show({ kind: 'current' });
    onChange(undefined);
  };

  const handleRemove = () => {
    show({ kind: 'removed' });
    onChange(null);
  };

  const src =
    shown.kind === 'picked'
      ? shown.url
      : shown.kind === 'current'
        ? currentUrl
        : null;

  const chooseInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ALLOWED_MIME_TYPES.join(',')}
      className="hidden"
      onChange={handleChoose}
    />
  );

  if (isShooting) {
    return (
      <div className="flex flex-col gap-3">
        {chooseInput}
        <div className="border-on-media-border bg-on-media-scrim relative mx-auto aspect-square w-full max-w-64 overflow-hidden rounded-full border">
          <video
            ref={videoRef}
            muted
            playsInline
            aria-label="Camera preview"
            className="size-full -scale-x-100 object-cover"
          />
          {status !== 'live' && (
            <p
              role="status"
              className="text-on-media-foreground absolute inset-0 grid place-items-center p-8 text-center text-xs font-semibold"
            >
              {hasNoCamera
                ? 'No camera access — choose a photo instead.'
                : 'Starting the camera…'}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {hasNoCamera ? (
            <Button
              type="button"
              variant="gold"
              className="flex-1"
              onClick={() => inputRef.current?.click()}
            >
              <ImageUp aria-hidden />
              Choose a photo
            </Button>
          ) : (
            <Button
              type="button"
              variant="gold"
              className="flex-1"
              disabled={status !== 'live'}
              onClick={() => void handleCapture()}
            >
              <Camera aria-hidden />
              Take it
            </Button>
          )}
          <Button
            type="button"
            variant="line"
            onClick={() => setIsShooting(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {chooseInput}
      <Avatar size="3xl">
        {src && <AvatarImage src={src} alt="Your avatar at the table" />}
        <AvatarFallback />
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="line"
            size="sm"
            disabled={disabled}
            onClick={() => setIsShooting(true)}
          >
            <Camera aria-hidden />
            {src ? 'Retake' : 'Take a photo'}
          </Button>
          <Button
            type="button"
            variant="line"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            aria-label="Choose a photo"
          >
            <ImageUp aria-hidden />
          </Button>
        </div>

        {shown.kind !== 'current' ? (
          <Button
            type="button"
            variant="link"
            size="xs"
            className="text-on-media-muted-foreground h-auto px-0"
            disabled={disabled}
            onClick={handleDiscard}
          >
            {shown.kind === 'removed'
              ? 'Keep the avatar'
              : currentUrl
                ? 'Keep the previous one'
                : 'Discard'}
          </Button>
        ) : (
          canRemove &&
          shown.kind === 'current' &&
          currentUrl && (
            <Button
              type="button"
              variant="link"
              size="xs"
              className="text-on-media-muted-foreground h-auto px-0"
              disabled={disabled}
              onClick={handleRemove}
            >
              Remove the avatar
            </Button>
          )
        )}
      </div>
    </div>
  );
};
