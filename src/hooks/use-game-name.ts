'use client';

import { resolveGameName } from '@lib/game-name';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';

export const useGameName = (name: string): string => {
  const { data: session } = useQuery(retrieveSessionOptions());

  return resolveGameName(name, session?.user);
};
