import ROUTES from '@constants/routes';
import {
  deleteSessionOptions,
  SESSIONS_QUERY_KEYS,
} from '@services/sessions/sessions.options';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useSignOut = () => {
  const router = useRouter();
  const { mutate } = useMutation(deleteSessionOptions());
  const queryClient = useQueryClient();

  const signOut = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          queryClient.setQueryData(
            SESSIONS_QUERY_KEYS.retrieve('current'),
            null,
          );
          router.push(ROUTES.auth.signIn());
        },
      },
    );
  };

  return { signOut };
};
