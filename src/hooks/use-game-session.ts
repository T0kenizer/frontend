import { RequesterError } from '@lib/requester';
import * as API from '@services/games/games.api';
import {
  GAMES_QUERY_KEYS,
  retrieveGameOptions,
} from '@services/games/games.options';
import {
  createGameSocket,
  type GameAck,
  type GameActionResult,
  type GameSocket,
  type GameSocketFailure,
  type HandSettledPayload,
  type RoundResolvedPayload,
} from '@services/games/games.socket';
import {
  clearPlayerToken,
  readPlayerToken,
  writePlayerToken,
} from '@services/games/games.tokens';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GameClientMessage,
  GameServerEvent,
  type GameResolution,
  type GameSnapshot,
  type PokerAction,
  type PotAward,
} from '@tokenizer/shared/types';
import { isGameOver } from '@tokenizer/shared/utils/games.utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ACK_TIMEOUT_MS = 10_000;

const CLOSED_LINGER_MS = 2_000;

type ClosedSessionStub = Pick<GameSnapshot, 'id' | 'status'>;

export interface UseGameSessionParams {
  gameId: Optional<string>;
  enabled?: boolean;
  spectate?: boolean;
}

export interface JoinSeatParams {
  displayName?: string;
  seatIndex?: number;
  openExtraSeat?: boolean;
}

function unwrapAck<T>(response: GameAck<T>): T {
  if (response && typeof response === 'object' && 'error' in response) {
    throw new Error((response as GameSocketFailure).error);
  }
  return response as T;
}

export function useGameSession(params: UseGameSessionParams) {
  const { gameId, enabled = true, spectate = false } = params;

  const queryClient = useQueryClient();
  const socketRef = useRef<Nullable<GameSocket>>(null);
  const [tokenVersion, setTokenVersion] = useState(0);
  const [participantId, setParticipantId] = useState<Nullable<string>>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAttached, setIsAttached] = useState(false);
  const [socketError, setSocketError] = useState<Nullable<string>>(null);
  const [resolution, setResolution] = useState<Nullable<GameResolution>>(null);

  const query = useQuery(retrieveGameOptions(enabled ? gameId : undefined));

  const setSnapshot = useCallback(
    (snapshot: GameSnapshot) => {
      queryClient.setQueryData(
        GAMES_QUERY_KEYS.retrieve(snapshot.id),
        snapshot,
      );
    },
    [queryClient],
  );

  const closeSnapshot = useCallback(
    (payload: GameSnapshot | ClosedSessionStub) => {
      queryClient.setQueryData<GameSnapshot>(
        GAMES_QUERY_KEYS.retrieve(payload.id),
        (current) =>
          'participants' in payload
            ? payload
            : current && { ...current, status: payload.status },
      );
    },
    [queryClient],
  );

  useEffect(() => {
    if (!enabled || !gameId) return;

    const token = spectate ? null : readPlayerToken(gameId);
    if (!spectate && !token) return;

    const socket = createGameSocket();
    socketRef.current = socket;

    const handleSettled = (
      payload: HandSettledPayload | RoundResolvedPayload,
    ) => {
      const { resolution: dealResolution, ...snapshot } = payload;
      setResolution(dealResolution);
      setSnapshot(snapshot as GameSnapshot);
    };

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketError(null);

      if (!token) {
        socket.emit(
          GameClientMessage.Spectate,
          { gameUuid: gameId },
          (response) => {
            if (
              response &&
              typeof response === 'object' &&
              'error' in response
            ) {
              setSocketError(response.error);
              return;
            }
            setSnapshot(response.snapshot);
            setIsAttached(true);
          },
        );
        return;
      }

      socket.emit(
        GameClientMessage.Attach,
        { gameUuid: gameId, token },
        (response) => {
          if (response && typeof response === 'object' && 'error' in response) {
            setSocketError(response.error);
            if (response.status === 401) {
              clearPlayerToken(gameId);
              setParticipantId(null);
              setTokenVersion((version) => version + 1);
            }
            return;
          }
          setSnapshot(response.snapshot);
          setParticipantId(response.participantId);
          setIsAttached(true);
        },
      );
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsAttached(false);
    });
    socket.on(GameServerEvent.ParticipantJoined, setSnapshot);
    socket.on(GameServerEvent.ParticipantUpdated, setSnapshot);
    socket.on(GameServerEvent.ParticipantDisconnected, setSnapshot);
    socket.on(GameServerEvent.ParticipantLeft, setSnapshot);
    socket.on(GameServerEvent.HandStarted, setSnapshot);
    socket.on(GameServerEvent.RoundStarted, setSnapshot);
    socket.on(GameServerEvent.ActionApplied, setSnapshot);
    socket.on(GameServerEvent.HandSettled, handleSettled);
    socket.on(GameServerEvent.RoundResolved, handleSettled);
    socket.on(GameServerEvent.SessionClosed, closeSnapshot);
    socket.on(GameServerEvent.Error, ({ error }) => setSocketError(error));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsAttached(false);
    };
  }, [enabled, gameId, spectate, tokenVersion, setSnapshot, closeSnapshot]);

  const isOver = query.data ? isGameOver(query.data.status) : false;

  useEffect(() => {
    if (!isOver) return;

    const timer = setTimeout(() => {
      socketRef.current?.disconnect();
      setSocketError(null);
    }, CLOSED_LINGER_MS);

    return () => clearTimeout(timer);
  }, [isOver]);

  const reattach = useCallback(() => {
    setSocketError(null);
    setTokenVersion((version) => version + 1);
  }, []);

  const liveSocket = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      throw new Error('The game socket is not connected');
    }
    return socket.timeout(ACK_TIMEOUT_MS);
  }, []);

  const join = useCallback(
    async (seat: JoinSeatParams): Promise<GameSnapshot> => {
      if (!gameId) throw new Error('Missing game id');

      const result = await API.joinGame(gameId, {
        token: readPlayerToken(gameId) ?? undefined,
        displayName: seat.displayName,
        seatIndex: seat.seatIndex,
        openExtraSeat: seat.openExtraSeat,
      });

      writePlayerToken(gameId, result.token);
      setParticipantId(result.participantId);
      setTokenVersion((version) => version + 1);
      setSnapshot(result.snapshot);
      return result.snapshot;
    },
    [gameId, setSnapshot],
  );

  const updateSeat = useCallback(
    async (data: { displayName?: Nullable<string> }): Promise<GameSnapshot> => {
      const response = await liveSocket().emitWithAck(
        GameClientMessage.UpdateSeat,
        data,
      );
      return unwrapAck(response);
    },
    [liveSocket],
  );

  const startHand = useCallback(async (): Promise<GameActionResult> => {
    const response = await liveSocket().emitWithAck(
      GameClientMessage.StartHand,
    );
    const result = unwrapAck(response);
    if (result.resolution) setResolution(result.resolution);
    return result;
  }, [liveSocket]);

  const startRound = useCallback(async (): Promise<GameSnapshot> => {
    const response = await liveSocket().emitWithAck(
      GameClientMessage.StartRound,
    );
    return unwrapAck(response);
  }, [liveSocket]);

  const submitAction = useCallback(
    async (
      action: PokerAction,
      amount?: number,
      targetParticipantId?: string,
    ): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GameClientMessage.Action,
        { action, amount, targetParticipantId },
      );
      return unwrapAck(response);
    },
    [liveSocket],
  );

  const declareWinners = useCallback(
    async (awards: PotAward[]): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GameClientMessage.DeclareWinners,
        { awards },
      );
      return unwrapAck(response);
    },
    [liveSocket],
  );

  const submitCatalogAction = useCallback(
    async (
      definitionId: string,
      amount?: number,
      targetParticipantId?: string,
    ): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GameClientMessage.Action,
        { definitionId, amount, targetParticipantId },
      );
      const result = unwrapAck(response);
      if (result.resolution) setResolution(result.resolution);
      return result;
    },
    [liveSocket],
  );

  const resolveRound = useCallback(
    async (winnerParticipantIds?: string[]): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GameClientMessage.Resolve,
        { winnerParticipantIds },
      );
      const result = unwrapAck(response);
      setResolution(result.resolution);
      return result;
    },
    [liveSocket],
  );

  const closeGame = useCallback(async (): Promise<GameSnapshot> => {
    const response = await liveSocket().emitWithAck(GameClientMessage.Close);
    return unwrapAck(response);
  }, [liveSocket]);

  const mySeat = useMemo(() => {
    if (!participantId) return null;
    return query.data?.participants.find((p) => p.id === participantId) ?? null;
  }, [query.data, participantId]);

  return {
    snapshot: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Nullable<RequesterError>) ?? null,
    refetch: query.refetch,

    isConnected,
    isOver,
    isAttached,
    socketError: isOver ? null : socketError,
    reattach,

    participantId,
    mySeat,

    resolution,

    join,
    updateSeat,

    startHand,
    startRound,
    submitAction,
    submitCatalogAction,
    declareWinners,
    resolveRound,
    closeGame,
  };
}
