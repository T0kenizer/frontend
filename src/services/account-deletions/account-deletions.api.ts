import requester from '@lib/requester';
import {
  ApplyDeletionResponse,
  RequestDeletionResponse,
  ValidateDeletionTokenResponse,
} from '@tokenizer/shared/types';

const BASE_URL = '/account-deletions';

export const requestDeletion = async () =>
  requester().post<RequestDeletionResponse>(BASE_URL, {});

export const validateToken = async (token: string) =>
  requester().get<ValidateDeletionTokenResponse>(`${BASE_URL}/${token}`);

export const applyDeletion = async (token: string) =>
  requester().delete<ApplyDeletionResponse>(`${BASE_URL}/${token}`);
