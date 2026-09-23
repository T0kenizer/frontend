import { RequesterError } from '@lib/requester';
import * as API from '@services/games/games.api';
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
  type HandSettledPayload,
  type RoundResolvedPayload,
} from '@services/games/games.socket';
import {
  clearPlayerToken,
  readPlayerToken,
  writePlayerToken,
} from '@services/games/games.tokens';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  GameResolution,
  GameSnapshot,
  PokerAction,
  PotAward,
} from '@tokenizer/shared/types';
import { GameSessionStatus } from '@tokenizer/shared/types';
import * as React from 'react';

const ACK_TIMEOUT_MS = 10_000;

/**
 * How long the socket lingers after the table has ended.
 *
 * Long enough for the host's own `game:close` ack to land — they receive the
 * broadcast before the reply to their own call — and short enough that the
 * server reclaims the room while the recap is still on screen. Nothing depends
 * on it: the room has a backstop of its own, and this only spares it the wait.
 */
const CLOSED_LINGER_MS = 2_000;

/** What `SESSION_CLOSED` carries when there was no table left to describe. */
type ClosedSessionStub = Pick<GameSnapshot, 'id' | 'status'>;

export interface UseGameSessionParams {
  /** The game session uuid; undefined while unknown (query disabled). */
  gameId: Optional<string>;
  /** Gate the whole connection (e.g. while the auth session is loading). */
  enabled?: boolean;
}

export interface JoinSeatParams {
  /** Explicit override; omit to fall back to the account/config default. */
  displayName?: string;
  /** Seat to claim; omit to take the first free one. */
  seatIndex?: number;
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
 * 1. Fetches the game over REST, which opens the room server-side.
 * 2. If a player token for this game is already stored, replays it: the seat comes
 *    back, which is what makes a page refresh a non-event rather than a
 *    departure. Otherwise the visitor watches the table until they call
 *    `join()` and pick a seat.
 * 3. With a token in hand, attaches the socket (`game:attach`) and streams the
 *    room. Every `game:*` broadcast refreshes the react-query cache, so
 *    `snapshot` is always the latest server state.
 *
 * The token is the only identity the client holds. Nothing here sends a user id
 * or a seat index to prove who it is.
 */
export function useGameSession(params: UseGameSessionParams) {
  const { gameId, enabled = true } = params;

  const queryClient = useQueryClient();
  const socketRef = React.useRef<Nullable<GameSocket>>(null);
  // The stored token is read inside the socket effect, not mirrored into
  // state: reading localStorage during render is unsafe under SSR, and a
  // synchronous setState in an effect only to copy it there would cascade a
  // render for nothing. This counter is what re-runs the effect when the token
  // actually changes — a join, or a token the server refused.
  const [tokenVersion, setTokenVersion] = React.useState(0);
  const [participantId, setParticipantId] =
    React.useState<Nullable<string>>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isAttached, setIsAttached] = React.useState(false);
  const [socketError, setSocketError] = React.useState<Nullable<string>>(null);
  // The last settlement, whichever game settled it: discriminated on `mode`,
  // like the snapshot it belongs to.
  const [resolution, setResolution] =
    React.useState<Nullable<GameResolution>>(null);

  const query = useQuery(retrieveGameOptions(enabled ? gameId : undefined));

  const setSnapshot = React.useCallback(
    (snapshot: GameSnapshot) => {
      queryClient.setQueryData(
        GAMES_QUERY_KEYS.retrieve(snapshot.id),
        snapshot,
      );
    },
    [queryClient],
  );

  // Socket lifecycle. A token stored from an earlier visit is a returning
  // player, not a new one: it is replayed here, which is what turns a page
  // refresh into a reconnection instead of a departure.
  React.useEffect(() => {
    if (!enabled || !gameId) return;

    const token = readPlayerToken(gameId);
    if (!token) return;

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

      socket.emit(
        GAME_CLIENT_MESSAGES.ATTACH,
        { gameUuid: gameId, token },
        (response) => {
          if (response && typeof response === 'object' && 'error' in response) {
            // A token the server refuses is worthless: drop it rather than
            // retry-loop on every reconnect.
            setSocketError(response.error);
            clearPlayerToken(gameId);
            setParticipantId(null);
            setTokenVersion((version) => version + 1);
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
    socket.on(GAME_SERVER_EVENTS.PARTICIPANT_JOINED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.PARTICIPANT_UPDATED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.PARTICIPANT_DISCONNECTED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.PARTICIPANT_LEFT, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.HAND_STARTED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.ACTION_APPLIED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.HAND_SETTLED, handleSettled);
    socket.on(GAME_SERVER_EVENTS.SESSION_CLOSED, setSnapshot);
    socket.on(GAME_SERVER_EVENTS.ERROR, ({ error }) => setSocketError(error));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsAttached(false);
    };
  }, [enabled, gameId, tokenVersion, setSnapshot]);

  /** Connected socket with an ack timeout, or throws. */
  const liveSocket = React.useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      throw new Error('The game socket is not connected');
    }
    return socket.timeout(ACK_TIMEOUT_MS);
  }, []);

  /**
   * Takes a seat. This is an HTTP call, not a socket message: it is where the
   * server decides who the player is (session user, else anonymous) and hands
   * back the token everything afterwards rides on.
   */
  const join = React.useCallback(
    async (seat: JoinSeatParams): Promise<GameSnapshot> => {
      if (!gameId) throw new Error('Missing game id');

      const result = await API.joinGame(gameId, {
        token: readPlayerToken(gameId) ?? undefined,
        displayName: seat.displayName,
        seatIndex: seat.seatIndex,
      });

      writePlayerToken(gameId, result.token);
      setParticipantId(result.participantId);
      // Re-runs the socket effect, which picks the new token up and attaches.
      setTokenVersion((version) => version + 1);
      setSnapshot(result.snapshot);
      return result.snapshot;
    },
    [gameId, setSnapshot],
  );

  /** Renames the seat this token belongs to. */
  const updateSeat = React.useCallback(
    async (data: { displayName?: Nullable<string> }): Promise<GameSnapshot> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.UPDATE_SEAT,
        data,
      );
      return unwrapAck(response);
    },
    [liveSocket],
  );

  /**
   * Host only: opens a further seat once every existing one is taken.
   *
   * Whether this is allowed at all is the snapshot's `canAddSeat` — it folds
   * together the seating config, the plan cap and whether the table is actually
   * full, none of which the client can work out for itself.
   */
  const addSeat = React.useCallback(
    async (data: AddSeatData = {}): Promise<GameSnapshot> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.ADD_SEAT,
        data,
      );
      return unwrapAck(response);
    },
    [liveSocket],
  );

  /**
   * Host only: deals the next hand. The antes and blinds go in server-side, and
   * the deal can settle the hand on the spot when they leave every remaining
   * seat all-in — hence the same shape an action answers with.
   */
  const startHand = React.useCallback(async (): Promise<GameActionResult> => {
    const response = await liveSocket().emitWithAck(
      GAME_CLIENT_MESSAGES.START_HAND,
    );
    const result = unwrapAck(response);
    if (result.resolution) setResolution(result.resolution);
    return result;
  }, [liveSocket]);

  /**
   * Host only, free mode: opens the next round.
   *
   * Nothing can be settled by opening one — a free round ends when the table
   * says so — so unlike a poker deal this answers a bare snapshot.
   */
  const startRound = React.useCallback(async (): Promise<GameSnapshot> => {
    const response = await liveSocket().emitWithAck(
      GAME_CLIENT_MESSAGES.START_ROUND,
    );
    return unwrapAck(response);
  }, [liveSocket]);

  /**
   * Plays an action.
   *
   * `targetParticipantId` is the host acting on behalf of a seat nobody has
   * claimed — a table never has a seat without a controller, so every declared
   * chair plays from round one and the host is who plays the empty ones. The
   * server enforces that: only the host may pass a target, and only at a seat
   * that is still unclaimed.
   */
  const submitAction = React.useCallback(
    async (
      action: PokerAction,
      amount?: number,
      targetParticipantId?: string,
    ): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.ACTION,
        { action, amount, targetParticipantId },
      );
      return unwrapAck(response);
    },
    [liveSocket],
  );

  /**
   * Host only: settles the showdown.
   *
   * One award per pot, because a side pot is a different contest with a
   * different field — the short stack who took the main pot never paid into the
   * one above it.
   */
  const declareWinners = React.useCallback(
    async (awards: PotAward[]): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.DECLARE_WINNERS,
        { awards },
      );
      return unwrapAck(response);
    },
    [liveSocket],
  );

  /**
   * Free mode: plays an action out of the table's own catalog.
   *
   * The same socket message as a poker move, in the other game's vocabulary:
   * the server accepts the one its session is playing and refuses the other,
   * which is why the client never has to decide what a move "really" is.
   */
  const submitCatalogAction = React.useCallback(
    async (
      definitionId: string,
      amount?: number,
      targetParticipantId?: string,
    ): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.ACTION,
        { definitionId, amount, targetParticipantId },
      );
      const result = unwrapAck(response);
      if (result.resolution) setResolution(result.resolution);
      return result;
    },
    [liveSocket],
  );

  /**
   * Host only, free mode: settles the open round.
   *
   * One flat list of winners, not an award per pot: a free table pools into a
   * single pot, so there is only ever one contest to call.
   */
  const resolveRound = React.useCallback(
    async (winnerParticipantIds?: string[]): Promise<GameActionResult> => {
      const response = await liveSocket().emitWithAck(
        GAME_CLIENT_MESSAGES.RESOLVE,
        { winnerParticipantIds },
      );
      const result = unwrapAck(response);
      setResolution(result.resolution);
      return result;
    },
    [liveSocket],
  );

  /**
   * Host only: ends the table for good.
   *
   * The token is deliberately kept. `/game/:uuid` is gated on holding one, and
   * dropping it here sent the host who had just ended their own game straight
   * to the join screen — past the recap everybody else was being shown. It is
   * worthless from this moment either way: the session refuses to re-open.
   */
  const closeGame = React.useCallback(async (): Promise<GameSnapshot> => {
    const response = await liveSocket().emitWithAck(GAME_CLIENT_MESSAGES.CLOSE);
    return unwrapAck(response);
  }, [liveSocket]);

  /** The seat this client holds, recognised through its own token. */
  const mySeat = React.useMemo(() => {
    if (!participantId) return null;
    return query.data?.participants.find((p) => p.id === participantId) ?? null;
  }, [query.data, participantId]);

  return {
    /** Latest server state, live-updated through the socket. */
    snapshot: query.data ?? null,
    isLoading: query.isLoading,
    error: (query.error as Nullable<RequesterError>) ?? null,
    refetch: query.refetch,

    /** Socket lifecycle */
    isConnected,
    isAttached,
    socketError,

    /** This client's seat, or null while it holds none. */
    participantId,
    mySeat,

    /** Last hand settlement broadcast, if any. */
    resolution,

    /** Takes a seat and issues this client's token. */
    join,
    /** Renames the seat this client holds. */
    updateSeat,
    /** Host only: opens a further seat at a full table. */
    addSeat,

    /** Gameplay actions (acked over the socket). */
    startHand,
    submitAction,
    declareWinners,
    closeGame,
  };
}
