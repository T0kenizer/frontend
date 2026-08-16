import requester from '@lib/requester';
import {
  ApplyConfirmationResponse,
  RequestConfirmationData,
  RequestConfirmationResponse,
  ValidateConfirmationTokenResponse,
} from '@tokenizer/shared/types';

const BASE_URL = '/account-confirmations';

export const requestConfirmation = async (data: RequestConfirmationData) =>
  requester().post<RequestConfirmationResponse>(BASE_URL, data);

export const validateToken = async (token: string) =>
  requester().get<ValidateConfirmationTokenResponse>(`${BASE_URL}/${token}`);

export const applyConfirmation = async (token: string) =>
  requester().patch<ApplyConfirmationResponse>(`${BASE_URL}/${token}`, {});
