import requester, { RequesterError } from '@lib/requester';
import {
  CreateSessionData,
  CreateSessionResponse,
  DeleteSessionResponse,
  RetrieveSessionResponse,
  SessionID,
} from '@tokenizer/shared/types';
import { cache } from 'react';

const BASE_URL = '/sessions';

export const createSession = async (data: CreateSessionData) =>
  requester().post<CreateSessionResponse>(`${BASE_URL}`, data);

export const retrieveSession = async (
  id: SessionID = 'current',
): Promise<Nullable<RetrieveSessionResponse>> => {
  try {
    return await requester().get<RetrieveSessionResponse>(`${BASE_URL}/${id}`);
  } catch (error) {
    if (error instanceof RequesterError && error.status === 401) return null;
    throw error;
  }
};

export const retrieveSessionCached = cache(
  async (
    id: SessionID = 'current',
  ): Promise<Nullable<RetrieveSessionResponse>> => {
    const { cookies } = await import('next/headers');
    const cookieHeader = (await cookies()).toString();

    try {
      return await requester().get<RetrieveSessionResponse>(
        `${BASE_URL}/${id}`,
        { headers: { Cookie: cookieHeader } },
      );
    } catch (error) {
      if (error instanceof RequesterError && error.status === 401) return null;
      throw error;
    }
  },
);

export const deleteSession = async (id: SessionID = 'current') =>
  requester().delete<DeleteSessionResponse>(`${BASE_URL}/${id}`);
