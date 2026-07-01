import { getQueryClient } from '@lib/query-client';
import { RequesterError } from '@lib/requester';
import * as API from '@services/sessions/sessions.api';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  CreateSessionData,
  CreateSessionResponse,
  DeleteSessionResponse,
  RetrieveSessionResponse,
  SessionID,
} from '@tokenizer/shared/types';

export const SESSIONS_QUERY_KEYS = {
  retrieve: (id: SessionID) => ['sessions', 'retrieve', id] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const SESSIONS_MUTATION_KEYS = {
  create: () => ['sessions', 'create'] as const,
  delete: () => ['sessions', 'delete'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const retrieveSessionOptions = (id: SessionID = 'current') =>
  queryOptions<Nullable<RetrieveSessionResponse>, RequesterError>({
    queryKey: SESSIONS_QUERY_KEYS.retrieve(id),
    queryFn: () => API.retrieveSession(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

/**
 * Server-only: relies on `next/headers` to forward cookies. Do not call from
 * client components.
 */
export const retrieveSessionServerOptions = (id: SessionID = 'current') =>
  queryOptions<Nullable<RetrieveSessionResponse>, RequesterError>({
    ...retrieveSessionOptions(id),
    queryFn: () => API.retrieveSessionCached(id),
  });

export const createSessionOptions = () =>
  mutationOptions<CreateSessionResponse, RequesterError, CreateSessionData>({
    mutationKey: SESSIONS_MUTATION_KEYS.create(),
    mutationFn: API.createSession,
    onSuccess: (data) => {
      const queryClient = getQueryClient();
      const options = retrieveSessionOptions('current');

      queryClient.setQueryDefaults(options.queryKey, options);
      queryClient.setQueryData(options.queryKey, data);
    },
  });

interface DeleteSessionVariables {
  id?: SessionID;
}

export const deleteSessionOptions = () =>
  mutationOptions<
    DeleteSessionResponse,
    RequesterError,
    DeleteSessionVariables
  >({
    mutationKey: SESSIONS_MUTATION_KEYS.delete(),
    mutationFn: (variables) => API.deleteSession(variables.id),
  });
