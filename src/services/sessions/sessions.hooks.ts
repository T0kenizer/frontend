import ROUTES from '@constants/routes';
import {
  deleteSessionOptions,
  SESSIONS_QUERY_KEYS,
} from '@services/sessions/sessions.options';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';

export const useSignOut = () => {
  const router = useRouter();
  const { mutate, ...rest } = useMutation(deleteSessionOptions());
  const queryClient = useQueryClient();

  const signOut = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          startTransition(() => {
            router.push(ROUTES.auth.signIn());
            queryClient.setQueryData(
              SESSIONS_QUERY_KEYS.retrieve('current'),
              null,
            );
          });
        },
      },
    );
  };

  return { signOut, ...rest };
};
