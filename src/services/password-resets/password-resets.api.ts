import requester from '@lib/requester';
import { RequestResetData } from '@tokenizer/shared/types';

const BASE_URL = '/password-resets';

export const requestReset = async (data: RequestResetData) =>
  requester().post<void>(BASE_URL, data);

export const validateToken = async (token: string) =>
  requester().get<void>(`${BASE_URL}/${token}`);

export const applyReset = async (token: string, data: { password: string }) =>
  requester().patch<void>(`${BASE_URL}/${token}`, data);
