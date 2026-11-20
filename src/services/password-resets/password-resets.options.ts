import { getQueryClient } from '@lib/query-client';
import type { RequesterError } from '@lib/requester';
import * as API from '@services/password-resets/password-resets.api';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type { ApplyResetData, RequestResetData } from '@tokenizer/shared/types';

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
  queryOptions<null, RequesterError>({
    queryKey: PASSWORD_RESETS_QUERY_KEYS.validate(token),
    // The backend answers with no body, and a query cannot resolve to nothing.
    queryFn: async () => {
      await API.validateToken(token);
      return null;
    },
    enabled: !!token,
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
    onSuccess: (_data, { token }) => {
      getQueryClient().removeQueries({
        queryKey: PASSWORD_RESETS_QUERY_KEYS.validate(token),
      });
    },
  });
