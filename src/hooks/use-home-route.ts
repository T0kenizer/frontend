'use client';

import ROUTES from '@constants/routes';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';

export const useHomeRoute = (): string => {
  const { data: session } = useQuery(retrieveSessionOptions());

  return ROUTES.home(!!session?.user);
};
