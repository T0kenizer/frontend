import { RequesterError } from '@lib/requester';
import {
  GAMES_QUERY_KEYS,
  retrieveGameOptions,
} from '@services/games/games.options';
import {
  createGameSocket,
  GAME_CLIENT_MESSAGES,
  GAME_SERVER_EVENTS,
  type GameAck,
  type GameActionResult,
  type GameSocket,
  type GameSocketFailure,
  type RoundResolvedPayload,
} from '@services/games/games.socket';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { GameSnapshot, RoundResolution } from '@tokenizer/shared/types';
import * as React from 'react';

const ACK_TIMEOUT_MS = 10_000;

export interface UseGameSessionParams {
  /** The game session uuid; undefined while unknown (query disabled). */
  gameId: Optional<string>;
  /** External identity: authenticated user uuid or an anonymous client id. */
  externalId: Optional<string>;
  /** Gate the whole connection (e.g. while the auth session is loading). */
  enabled?: boolean;
}

export interface JoinSeatParams {
  /** Explicit override; omit to fall back to the account/config default. */
  displayName?: string;
  /** Seat to claim; omit to take the first free one. */
  seatIndex?: number;
  /** A captured JPEG data-URL; omit to fall back to the account avatar. */
  photo?: string;
}

function unwrapAck<T>(response: GameAck<T>): T {
  if (response && typeof response === 'object' && 'error' in response) {
    throw new Error((response as GameSocketFailure).error);
  }
  return response as T;
}

/**
 * Live connection to a game room.
 *
 * 1. Fetches the game state over REST — this lazily (re)opens the room server-side
 *    and returns the snapshot carrying the join code.
 * 2. Once the join code is known, opens the Socket.IO connection and streams the
 *    room state — this does NOT claim a seat: the caller sees the table
 *    (free/occupied seats) before committing to one.
 * 3. Call `join()` once the visitor picked a seat, a display name and (optionally)
 *    a photo — this emits `game:join`, which binds the socket to the room and
 *    claims the seat. Every `game:*` broadcast after that refreshes the
 *    react-query cache, so `snapshot` is always the latest server state.
 */
export function useGameSession(params: UseGameSessionParams) {
  const { gameId, externalId, enabled = true } = params;

  const queryClient = useQueryClient();
  const socketRef = React.useRef<Nullable<GameSocket>>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isJoined, setIsJoined] = React.useState(false);
  const [socketError, setSocketError] = React.useState<Nullable<string>>(null);
  const [resolution, setResolution] =
    React.useState<Nullable<RoundResolution>>(null);

  // 1. REST fetch: opens the room server-side and yields its join code.
  const query = useQuery(retrieveGameOptions(enabled ? gameId : undefined));
  const joinCode = query.data?.joinCode;

  const setSnapshot = React.useCallback(
    (snapshot: GameSnapshot) => {
      queryClient.setQueryData(
        GAMES_QUERY_KEYS.retrieve(snapshot.id),
        snapshot,
      );
    },
    [queryClient],
  );

  // 2. Join code known → open the socket and stream the state. A visitor who
  // already occupies a seat (the host, or a returning player) is silently
  // re-joined so the socket's identity is bound — an idempotent re-claim,
  // server-side. A visitor with no seat yet stays unbound until they pick one
  // through `join()`.
  React.useEffect(() => {
    if (!enabled || !joinCode || !externalId) return;

    const socket = createGameSocket();
    socketRef.current = socket;

    const handleResolved = (payload: RoundResolvedPayload) => {
      const { resolution: roundResolution, ...snapshot } = payload;
      setResolution(roundResolution);
      setSnapshot(snapshot);
    };

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketError(null);

      const existingSeat = queryClient
        .getQueryData<GameSnapshot>(GAMES_QUERY_KEYS.retrieve(gameId ?? ''))
        ?.participants.find((p) => p.controller === externalId);
      if (existingSeat) {
        // Re-claim as-is: no override, the already-resolved name/photo stays.
        socket.emit(
          GAME_CLIENT_MESSAGES.JOIN,
          {
            joinCode,
            externalId,
            seatIndex: existingSeat.seatIndex,
          },
          (response) => {
            if (
              response &&
              typeof response === 'object' &&
              'error' in response
            ) {
              setSocketError(response.error);
              return;
            }
            setSnapshot(response);
            setIsJoined(true);
          },
        );
      }
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsJoined(false);
    });
    socket.on(GAME_SERVER_EVENTS.PARTICIPANT_JOINED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.PARTICIPANT_UPDATED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.ROUND_STARTED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.ACTION_APPLIED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.ROUND_RESOLVED, handleResolved);
    socket.on(GAME_SERVER_EVENTS.SESSION_CLOSED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.ERROR, ({ error }) => setSocketError(error));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsJoined(false);
    };
  }, [enabled, joinCode, externalId, gameId, queryClient, setSnapshot]);

  /** Connected socket with an ack timeout, or throws. */
  const liveSocket = React.useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      throw new Error('The game socket is not connected');
    }
    return socket.timeout(ACK_TIMEOUT_MS);
  }, []);

  /** Claims a seat: picked by the visitor, with a name and optional photo. */
  const join = React.useCallback(
    async (seat: JoinSeatParams): Promise<GameSnapshot> => {
      if (!externalId) throw new Error('Missing external identity');
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.JOIN,
        {
          joinCode: joinCode!,
          externalId,
          displayName: seat.displayName,
          seatIndex: seat.seatIndex,
          photo: seat.photo,
        },
      );
      const snapshot = unwrapAck(response);
      setIsJoined(true);
      return snapshot;
    },
    [liveSocket, joinCode, externalId],
  );

  /** Renames/re-photos the seat already claimed by this identity. */
  const updateSeat = React.useCallback(
    async (data: {
      displayName?: Nullable<string>;
      photo?: Nullable<string>;
    }): Promise<GameSnapshot> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.UPDATE_SEAT,
        { joinCode: joinCode!, ...data },
      );
      return unwrapAck(response);
    },
    [liveSocket, joinCode],
  );

  /** Host only: starts a round (forced bets applied server-side). */
  const startRound = React.useCallback(async (): Promise<GameSnapshot> => {
    const response = await liveSocket().emitWithAck(
      GAME_CLIENT_MESSAGES.START_ROUND,
      { joinCode: joinCode! },
    );
    return unwrapAck(response);
  }, [liveSocket, joinCode]);

  const submitAction = React.useCallback(
    async (
      definitionId: string,
      amount?: number,
    ): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.ACTION,
        { joinCode: joinCode!, definitionId, amount },
      );
      return unwrapAck(response);
    },
    [liveSocket, joinCode],
  );

  /** Host only: manual round resolution. */
  const resolveRound = React.useCallback(
    async (winnerExternalIds?: string[]): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.RESOLVE,
        { joinCode: joinCode!, winnerExternalIds },
      );
      return unwrapAck(response);
    },
    [liveSocket, joinCode],
  );

  /** Host only: closes the session for good. */
  const closeGame = React.useCallback(async (): Promise<GameSnapshot> => {
    const response = await liveSocket().emitWithAck(
      GAME_CLIENT_MESSAGES.CLOSE,
      {
        joinCode: joinCode!,
      },
    );
    return unwrapAck(response);
  }, [liveSocket, joinCode]);

  return {
    /** Latest server state, live-updated through the socket. */
    snapshot: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Nullable<RequesterError>) ?? null,
    refetch: query.refetch,

    /** Socket lifecycle */
    isConnected,
    isJoined,
    socketError,

    /** Last round resolution broadcast, if any. */
    resolution,

    /** Claims a seat picked by the visitor. */
    join,
    /** Renames/re-photos the seat already claimed by this identity. */
    updateSeat,

    /** Gameplay actions (acked over the socket). */
    startRound,
    submitAction,
    resolveRound,
    closeGame,
  };
}
