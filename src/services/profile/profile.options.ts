import { getQueryClient } from '@lib/query-client';
import { RequesterError } from '@lib/requester';
import * as API from '@services/profile/profile.api';
import { SESSIONS_QUERY_KEYS } from '@services/sessions/sessions.options';
import { mutationOptions } from '@tanstack/react-query';
import { SerializedUser } from '@tokenizer/shared/types';

export const PROFILE_MUTATION_KEYS = {
  update: () => ['profile', 'update'] as const,
  uploadAvatar: () => ['profile', 'uploadAvatar'] as const,
  changePassword: () => ['profile', 'changePassword'] as const,
  unlinkGoogle: () => ['profile', 'unlinkGoogle'] as const,
  requestDeletion: () => ['profile', 'requestDeletion'] as const,
  confirmDeletion: () => ['profile', 'confirmDeletion'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

interface UpdateProfileVariables {
  username?: string;
  displayName?: string | null;
  email?: string;
  avatarUrl?: string | null;
}

interface ChangePasswordVariables {
  currentPassword?: string;
  newPassword: string;
}

const updateSessionUser = (user: SerializedUser) => {
  const queryClient = getQueryClient();
  const key = SESSIONS_QUERY_KEYS.retrieve('current');
  const session = queryClient.getQueryData(key);
  if (session) {
    queryClient.setQueryData(key, { ...session, user });
  }
};

export const updateProfileOptions = () =>
  mutationOptions<SerializedUser, RequesterError, UpdateProfileVariables>({
    mutationKey: PROFILE_MUTATION_KEYS.update(),
    mutationFn: API.updateProfile,
    onSuccess: updateSessionUser,
  });

export const uploadAvatarOptions = () =>
  mutationOptions<SerializedUser, RequesterError, File>({
    mutationKey: PROFILE_MUTATION_KEYS.uploadAvatar(),
    mutationFn: API.uploadAvatar,
    onSuccess: updateSessionUser,
  });

export const changePasswordOptions = () =>
  mutationOptions<void, RequesterError, ChangePasswordVariables>({
    mutationKey: PROFILE_MUTATION_KEYS.changePassword(),
    mutationFn: API.changePassword,
  });

export const unlinkGoogleOptions = () =>
  mutationOptions<SerializedUser, RequesterError, void>({
    mutationKey: PROFILE_MUTATION_KEYS.unlinkGoogle(),
    mutationFn: API.unlinkGoogle,
    onSuccess: updateSessionUser,
  });

export const requestDeletionOptions = () =>
  mutationOptions<void, RequesterError, void>({
    mutationKey: PROFILE_MUTATION_KEYS.requestDeletion(),
    mutationFn: API.requestDeletion,
  });

export const confirmDeletionOptions = () =>
  mutationOptions<void, RequesterError, string>({
    mutationKey: PROFILE_MUTATION_KEYS.confirmDeletion(),
    mutationFn: API.confirmDeletion,
  });
