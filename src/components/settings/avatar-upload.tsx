'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { NEXT_PUBLIC_API_URL } from '@lib/env';
import { cn } from '@lib/utils';
import { createFileOptions } from '@services/files/files.options';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { partialUpdateUserOptions } from '@services/users/users.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@tokenizer/shared/constants/files.constants';
import { Loader2, Pencil } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));

export type AvatarUploadProps = Omit<
  React.ComponentProps<'button'>,
  'onError'
>;

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  className,
  ...props
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const { mutateAsync: createFile, isPending: isUploading } = useMutation(
    createFileOptions(),
  );
  const { mutateAsync: partialUpdateUser, isPending: isUpdating } = useMutation(
    partialUpdateUserOptions(),
  );

  const isPending = isUploading || isUpdating;

  const avatarSrc = user?.avatarUrl
    ? `${NEXT_PUBLIC_API_URL}${user.avatarUrl}`
    : undefined;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Let the same file be picked again after a failed attempt.
    event.target.value = '';

    if (!file || !user || isPending) return;

    // Mirror the server-side upload validators so an invalid pick fails fast.
    if (!ALLOWED_MIME_TYPES.includes(file.type as never)) {
      toast.error('Avatar must be a PNG or JPEG image');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Avatar must be smaller than ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    try {
      // Sync upload: the content is stored before responding, so the avatar
      // the update points at is readable right away.
      const uploaded = await createFile({ file });
      await partialUpdateUser({
        uuid: user.uuid,
        data: { avatar: uploaded.uuid },
      });

      toast.success('Avatar updated');
    } catch (error) {
      toast.error(
        (error instanceof Error && error.message) || 'Failed to update avatar',
      );
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={isPending || !user}
        aria-label="Change avatar"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group/avatar-upload focus-visible:ring-ring relative cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        <Avatar size="4xl">
          <AvatarImage src={avatarSrc} alt={user?.displayName ?? 'Avatar'} />
          <AvatarFallback />
        </Avatar>
        <span
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity',
            'group-hover/avatar-upload:opacity-100 group-focus-visible/avatar-upload:opacity-100',
            isPending && 'opacity-100',
          )}
        >
          {isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Pencil className="size-6" />
          )}
        </span>
      </button>
    </>
  );
};
