import { RequesterError } from '@lib/requester';
import * as API from '@services/users/users.api';
import { mutationOptions } from '@tanstack/react-query';
import { CreateUserData, CreateUserResponse } from '@tokenizer/shared/types';

export const USERS_MUTATION_KEYS = {
  create: () => ['users', 'create'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const createUserOptions = () =>
  mutationOptions<CreateUserResponse, RequesterError, CreateUserData>({
    mutationKey: USERS_MUTATION_KEYS.create(),
    mutationFn: (variables) => API.createUser(variables),
  });
