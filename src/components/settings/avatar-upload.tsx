'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { createFileOptions } from '@services/files/files.options';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { partialUpdateUserOptions } from '@services/users/users.options';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@tokenizer/shared/constants/files.constants';
import { Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));

export type AvatarUploadProps = Omit<React.ComponentProps<'div'>, 'onError'>;

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  className,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  const { mutateAsync: createFile, isPending: isUploading } =
    useMutation(createFileOptions());
  // Two instances of the same mutation so each button owns its pending state.
  const { mutateAsync: attachAvatar, isPending: isAttaching } = useMutation(
    partialUpdateUserOptions(),
  );
  const { mutateAsync: detachAvatar, isPending: isDetaching } = useMutation(
    partialUpdateUserOptions(),
  );

  const isImporting = isUploading || isAttaching;
  const isPending = isImporting || isDetaching;
  const hasAvatar = Boolean(user?.avatarUrl);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file || !user || isPending) return;

    // Mirror the server-side upload validators so an invalid pick fails fast.
    if (!ALLOWED_MIME_TYPES.includes(file.type as never)) {
      toast.error('Avatar must be a PNG, JPEG, WebP or GIF image');
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
      await attachAvatar({
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

  const handleRemove = async () => {
    if (!user || isPending) return;

    try {
      await detachAvatar({ uuid: user.uuid, data: { avatar: null } });

      toast.success('Avatar removed');
    } catch (error) {
      toast.error(
        (error instanceof Error && error.message) || 'Failed to remove avatar',
      );
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-start gap-4 @lg/settings:flex-row @lg/settings:items-center',
        className,
      )}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        className="hidden"
        onChange={handleChange}
      />
      <div className="relative">
        <Avatar size="4xl">
          <AvatarImage
            src={user?.avatarUrl ?? undefined}
            alt={user ? `${user.displayName}'s Avatar` : 'Avatar'}
          />
          <AvatarFallback />
        </Avatar>
        {isPending && (
          <span className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/50 text-white">
            <Loader2 className="size-6 animate-spin motion-reduce:animate-none" />
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!user || isPending}
          loading={isImporting}
          onClick={() => inputRef.current?.click()}
        >
          Upload a photo
        </Button>
        <Button
          type="button"
          variant="ghost-destructive"
          disabled={!user || !hasAvatar || isPending}
          loading={isDetaching}
          onClick={handleRemove}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
