import { getQueryClient } from '@lib/query-client';
import { RequesterError } from '@lib/requester';
import { SESSIONS_QUERY_KEYS } from '@services/sessions/sessions.options';
import * as API from '@services/users/users.api';
import { mutationOptions } from '@tanstack/react-query';
import {
  CreateUserData,
  CreateUserResponse,
  PartialUpdateUserData,
  PartialUpdateUserResponse,
  RetrieveSessionResponse,
} from '@tokenizer/shared/types';

export const USERS_MUTATION_KEYS = {
  create: () => ['users', 'create'] as const,
  partialUpdate: () => ['users', 'partialUpdate'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const createUserOptions = () =>
  mutationOptions<CreateUserResponse, RequesterError, CreateUserData>({
    mutationKey: USERS_MUTATION_KEYS.create(),
    mutationFn: (variables) => API.createUser(variables),
  });

interface PartialUpdateUserVariables {
  uuid: string;
  data: PartialUpdateUserData;
}

export const partialUpdateUserOptions = () =>
  mutationOptions<
    PartialUpdateUserResponse,
    RequesterError,
    PartialUpdateUserVariables
  >({
    mutationKey: USERS_MUTATION_KEYS.partialUpdate(),
    mutationFn: (variables) =>
      API.partialUpdateUser(variables.uuid, variables.data),
    onSuccess: (user) => {
      const queryClient = getQueryClient();
      const queryKey = SESSIONS_QUERY_KEYS.retrieve('current');
      const session =
        queryClient.getQueryData<Nullable<RetrieveSessionResponse>>(queryKey);

      if (session?.user.uuid === user.uuid)
        queryClient.setQueryData(queryKey, { ...session, user });
    },
  });
