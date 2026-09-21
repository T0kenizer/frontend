import { getQueryClient } from '@lib/query-client';
import { RequesterError } from '@lib/requester';
import * as API from '@services/games/games.api';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import {
  ClaimSeatData,
  ClaimSeatResponse,
  CreateGameSessionData,
  CreateGameSessionResponse,
  RetrieveGameSessionResponse,
} from '@tokenizer/shared/types';

export const GAMES_QUERY_KEYS = {
  retrieve: (uuid: string) => ['games', 'retrieve', uuid] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const GAMES_MUTATION_KEYS = {
  create: () => ['games', 'create'] as const,
  claimSeat: () => ['games', 'claimSeat'] as const,
  joinByCode: () => ['games', 'joinByCode'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

/**
 * Snapshot of a game session. The GET opens the room server-side; once the
 * socket is attached (`useGameSession`), the cache is kept fresh by the
 * `game:*` broadcasts, so no polling is needed.
 */
export const retrieveGameOptions = (uuid: Optional<string>) =>
  queryOptions<RetrieveGameSessionResponse, RequesterError>({
    queryKey: GAMES_QUERY_KEYS.retrieve(uuid ?? ''),
    queryFn: () => API.retrieveGame(uuid!),
    enabled: !!uuid,
    staleTime: Infinity, // live data flows in through the socket
    gcTime: 5 * 60 * 1000, // matches the server-side idle room TTL
  });

export const createGameOptions = () =>
  mutationOptions<
    CreateGameSessionResponse,
    RequesterError,
    CreateGameSessionData
  >({
    mutationKey: GAMES_MUTATION_KEYS.create(),
    mutationFn: (variables) => API.createGame(variables),
    onSuccess: (snapshot) => {
      // Seed the retrieve cache so the game page renders instantly.
      getQueryClient().setQueryData(
        GAMES_QUERY_KEYS.retrieve(snapshot.id),
        snapshot,
      );
    },
  });

/**
 * Resolves a join code to its game session (opens the room server-side), then
 * seeds the retrieve cache so the room page renders instantly once navigated.
 */
export const joinByCodeOptions = () =>
  mutationOptions<RetrieveGameSessionResponse, RequesterError, string>({
    mutationKey: GAMES_MUTATION_KEYS.joinByCode(),
    mutationFn: (joinCode) => API.retrieveGameByJoinCode(joinCode),
    onSuccess: (snapshot) => {
      getQueryClient().setQueryData(
        GAMES_QUERY_KEYS.retrieve(snapshot.id),
        snapshot,
      );
    },
  });

interface ClaimSeatVariables {
  uuid: string;
  data: ClaimSeatData;
}

export const claimSeatOptions = () =>
  mutationOptions<ClaimSeatResponse, RequesterError, ClaimSeatVariables>({
    mutationKey: GAMES_MUTATION_KEYS.claimSeat(),
    mutationFn: (variables) => API.claimSeat(variables.uuid, variables.data),
    onSuccess: (snapshot) => {
      getQueryClient().setQueryData(
        GAMES_QUERY_KEYS.retrieve(snapshot.id),
        snapshot,
      );
    },
  });
