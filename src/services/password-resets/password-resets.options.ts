import { RequesterError } from '@lib/requester';
import * as API from '@services/password-resets/password-resets.api';
import { mutationOptions } from '@tanstack/react-query';
import { ApplyResetData, RequestResetData } from '@tokenizer/shared/types';

export const PASSWORD_RESETS_MUTATION_KEYS = {
  request: () => ['password-resets', 'request'] as const,
  apply: () => ['password-resets', 'apply'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const requestResetOptions = () =>
  mutationOptions<void, RequesterError, RequestResetData>({
    mutationKey: PASSWORD_RESETS_MUTATION_KEYS.request(),
    mutationFn: API.requestReset,
  });

export const applyResetOptions = () =>
  mutationOptions<void, RequesterError, { token: string } & ApplyResetData>({
    mutationKey: PASSWORD_RESETS_MUTATION_KEYS.apply(),
    mutationFn: ({ token, ...data }) => API.applyReset(token, data),
  });
