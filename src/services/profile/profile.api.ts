import requester from '@lib/requester';
import { SerializedUser } from '@tokenizer/shared/types';

const BASE_URL = '/profile';

export const getProfile = async () => requester().get<SerializedUser>(BASE_URL);

export const updateProfile = async (data: {
  username?: string;
  displayName?: string | null;
  email?: string;
  avatarUrl?: string | null;
}) => requester().patch<SerializedUser>(BASE_URL, data);

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return requester().patch<SerializedUser>(`${BASE_URL}/avatar`, formData);
};

export const changePassword = async (data: {
  currentPassword?: string;
  newPassword: string;
}) => requester().patch<void>(`${BASE_URL}/password`, data);

export const unlinkGoogle = async () =>
  requester().delete<SerializedUser>(`${BASE_URL}/google`);

export const requestDeletion = async () =>
  requester().post<void>(`${BASE_URL}/delete`);

export const confirmDeletion = async (token: string) =>
  requester().delete<void>(BASE_URL, { data: { token } });
