import { getQueryClient } from '@lib/query-client';
import { RequesterError } from '@lib/requester';
import * as API from '@services/games/games.api';
import { writePlayerToken } from '@services/games/games.tokens';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { JOIN_CODE_REGEX } from '@tokenizer/shared/constants/games.constants';
import {
  ClaimSeatData,
  ClaimSeatResponse,
  CreateGameSessionData,
  CreateGameSessionResponse,
  JoinByCodeResponse,
  ListGameTemplatesResponse,
  RetrieveGameSessionResponse,
  RetrieveRoomByCodeResponse,
} from '@tokenizer/shared/types';

export const GAMES_QUERY_KEYS = {
  retrieve: (uuid: string) => ['games', 'retrieve', uuid] as const,
  roomByCode: (code: string) => ['games', 'roomByCode', code] as const,
  templates: () => ['games', 'templates'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const GAMES_MUTATION_KEYS = {
  create: () => ['games', 'create'] as const,
  join: () => ['games', 'join'] as const,
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
    gcTime: 5 * 60 * 1000,
  });

/**
 * The public view behind a dictated code, for confirming the room before
 * committing to it. Never cached long: a code is short-lived by design.
 */
export const roomByCodeOptions = (code: Optional<string>) =>
  queryOptions<RetrieveRoomByCodeResponse, RequesterError>({
    queryKey: GAMES_QUERY_KEYS.roomByCode(code ?? ''),
    queryFn: () => API.retrieveRoomByCode(code!),
    enabled: !!code && JOIN_CODE_REGEX.test(code),
    staleTime: 10_000,
    retry: false, // the endpoint is tightly rate-limited; do not hammer it
  });

/** The server's templates. Static enough to cache for the whole session. */
export const listGameTemplatesOptions = () =>
  queryOptions<ListGameTemplatesResponse, RequesterError>({
    queryKey: GAMES_QUERY_KEYS.templates(),
    queryFn: API.listGameTemplates,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const createGameOptions = () =>
  mutationOptions<
    CreateGameSessionResponse,
    RequesterError,
    CreateGameSessionData
  >({
    mutationKey: GAMES_MUTATION_KEYS.create(),
    mutationFn: (variables) => API.createGame(variables),
    onSuccess: (result) => {
      // Creating a game seats the owner, so it hands back a token like a join.
      writePlayerToken(result.snapshot.id, result.token);
      getQueryClient().setQueryData(
        GAMES_QUERY_KEYS.retrieve(result.snapshot.id),
        result.snapshot,
      );
    },
  });

/**
 * Resolves a dictated code to a session uuid. That uuid is all the caller
 * needs: it is what the room page, the REST calls and the socket are keyed by.
 */
export const joinByCodeOptions = () =>
  mutationOptions<JoinByCodeResponse, RequesterError, string>({
    mutationKey: GAMES_MUTATION_KEYS.joinByCode(),
    mutationFn: (code) => API.joinByCode(code),
  });

interface JoinGameVariables {
  uuid: string;
  data: ClaimSeatData;
}

export const joinGameOptions = () =>
  mutationOptions<ClaimSeatResponse, RequesterError, JoinGameVariables>({
    mutationKey: GAMES_MUTATION_KEYS.join(),
    mutationFn: (variables) => API.joinGame(variables.uuid, variables.data),
    onSuccess: (result) => {
      writePlayerToken(result.snapshot.id, result.token);
      getQueryClient().setQueryData(
        GAMES_QUERY_KEYS.retrieve(result.snapshot.id),
        result.snapshot,
      );
    },
  });
