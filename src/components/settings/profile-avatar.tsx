'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { TokenizerBorder } from '@components/ui/tokenizer-border';
import { uploadAvatarOptions } from '@services/profile/profile.options';
import { useMutation } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { useRef } from 'react';

interface ProfileAvatarProps {
  src?: string | null;
  displayName: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  displayName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadAvatar, isPending } = useMutation(
    uploadAvatarOptions(),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isPending) return;
    uploadAvatar(file);
    e.target.value = '';
  };

  return (
    <div className="mb-6 flex justify-center">
      <TokenizerBorder
        flip
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
      >
        <Avatar className="size-20">
          <AvatarImage src={src || ''} alt={displayName} />
          <AvatarFallback className="text-2xl" />
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="size-6 text-white" />
        </div>
      </TokenizerBorder>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};
