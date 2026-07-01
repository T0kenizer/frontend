import requester from '@lib/requester';
import {
  ApplyResetData,
  ApplyResetResponse,
  RequestResetData,
  RequestResetResponse,
  ValidateTokenResponse,
} from '@tokenizer/shared/types';

const BASE_URL = '/password-resets';

export const requestReset = async (data: RequestResetData) =>
  requester().post<RequestResetResponse>(BASE_URL, data);

export const validateToken = async (token: string) =>
  requester().get<ValidateTokenResponse>(`${BASE_URL}/${token}`);

export const applyReset = async (token: string, data: ApplyResetData) =>
  requester().patch<ApplyResetResponse>(`${BASE_URL}/${token}`, data);
