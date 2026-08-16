import { RequesterError } from '@lib/requester';
import * as API from '@services/account-confirmations/account-confirmations.api';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  RequestConfirmationData,
  ValidateConfirmationTokenResponse,
} from '@tokenizer/shared/types';

export const ACCOUNT_CONFIRMATIONS_QUERY_KEYS = {
  validate: (token: string) =>
    ['account-confirmations', 'validate', token] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const ACCOUNT_CONFIRMATIONS_MUTATION_KEYS = {
  request: () => ['account-confirmations', 'request'] as const,
  apply: () => ['account-confirmations', 'apply'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const validateConfirmationTokenOptions = (token: string) =>
  queryOptions<ValidateConfirmationTokenResponse, RequesterError>({
    queryKey: ACCOUNT_CONFIRMATIONS_QUERY_KEYS.validate(token),
    queryFn: () => API.validateToken(token),
    enabled: !!token,
    // A token is single-use and short-lived: never retry it, never serve it
    // stale once it has been spent.
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

export const requestConfirmationOptions = () =>
  mutationOptions<void, RequesterError, RequestConfirmationData>({
    mutationKey: ACCOUNT_CONFIRMATIONS_MUTATION_KEYS.request(),
    mutationFn: API.requestConfirmation,
  });

export const applyConfirmationOptions = () =>
  mutationOptions<void, RequesterError, { token: string }>({
    mutationKey: ACCOUNT_CONFIRMATIONS_MUTATION_KEYS.apply(),
    mutationFn: ({ token }) => API.applyConfirmation(token),
  });
