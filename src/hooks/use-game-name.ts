'use client';

import { resolveGameName } from '@services/games/games.utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';

export const useGameName = (name: string): string => {
  const { data: session } = useQuery(retrieveSessionOptions());

  return resolveGameName(name, session?.user);
};
