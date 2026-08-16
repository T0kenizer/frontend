import { getQueryClient } from '@lib/query-client';
import { RequesterError } from '@lib/requester';
import * as API from '@services/account-deletions/account-deletions.api';
import { SESSIONS_QUERY_KEYS } from '@services/sessions/sessions.options';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { ValidateDeletionTokenResponse } from '@tokenizer/shared/types';

export const ACCOUNT_DELETIONS_QUERY_KEYS = {
  validate: (token: string) =>
    ['account-deletions', 'validate', token] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const ACCOUNT_DELETIONS_MUTATION_KEYS = {
  request: () => ['account-deletions', 'request'] as const,
  apply: () => ['account-deletions', 'apply'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const validateDeletionTokenOptions = (token: string) =>
  queryOptions<ValidateDeletionTokenResponse, RequesterError>({
    queryKey: ACCOUNT_DELETIONS_QUERY_KEYS.validate(token),
    queryFn: () => API.validateToken(token),
    enabled: !!token,
    // A token is single-use and short-lived: never retry it, never serve it
    // stale once it has been spent.
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

export const requestDeletionOptions = () =>
  mutationOptions<void, RequesterError, void>({
    mutationKey: ACCOUNT_DELETIONS_MUTATION_KEYS.request(),
    mutationFn: API.requestDeletion,
  });

export const applyDeletionOptions = () =>
  mutationOptions<void, RequesterError, { token: string }>({
    mutationKey: ACCOUNT_DELETIONS_MUTATION_KEYS.apply(),
    mutationFn: ({ token }) => API.applyDeletion(token),
    // The backend destroys the session along with the account, so the cached
    // one is stale the moment this resolves.
    onSuccess: () => {
      getQueryClient().setQueryData(
        SESSIONS_QUERY_KEYS.retrieve('current'),
        null,
      );
    },
  });
