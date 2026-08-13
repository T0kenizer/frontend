import { getQueryClient } from '@lib/query-client';
import { RequesterError } from '@lib/requester';
import * as API from '@services/password-resets/password-resets.api';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  ApplyResetData,
  RequestResetData,
  ValidateTokenResponse,
} from '@tokenizer/shared/types';

export const PASSWORD_RESETS_QUERY_KEYS = {
  validate: (token: string) => ['password-resets', 'validate', token] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const PASSWORD_RESETS_MUTATION_KEYS = {
  request: () => ['password-resets', 'request'] as const,
  apply: () => ['password-resets', 'apply'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const validateResetTokenOptions = (token: string) =>
  queryOptions<ValidateTokenResponse, RequesterError>({
    queryKey: PASSWORD_RESETS_QUERY_KEYS.validate(token),
    queryFn: () => API.validateToken(token),
    enabled: !!token,
    // A token is single-use and short-lived: never retry it, never serve it
    // stale once it has been spent.
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

export const requestResetOptions = () =>
  mutationOptions<void, RequesterError, RequestResetData>({
    mutationKey: PASSWORD_RESETS_MUTATION_KEYS.request(),
    mutationFn: API.requestReset,
  });

export const applyResetOptions = () =>
  mutationOptions<void, RequesterError, { token: string } & ApplyResetData>({
    mutationKey: PASSWORD_RESETS_MUTATION_KEYS.apply(),
    mutationFn: ({ token, ...data }) => API.applyReset(token, data),
    // The token is spent once this resolves, so a cached validation of it must
    // not survive to make the link look usable again.
    onSuccess: (_data, { token }) => {
      getQueryClient().removeQueries({
        queryKey: PASSWORD_RESETS_QUERY_KEYS.validate(token),
      });
    },
  });
