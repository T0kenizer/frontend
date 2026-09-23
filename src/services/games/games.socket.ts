import { NEXT_PUBLIC_API_URL } from '@lib/env';
import {
  GAME_CLIENT_MESSAGES,
  GAME_SERVER_EVENTS,
} from '@tokenizer/shared/constants/games.constants';
import type {
  AttachSocketData,
  AttachSocketResponse,
  DeclareWinnersData,
  GameResolution,
  GameSnapshot,
  HandResolution,
  ResolveRoundData,
  RoundResolution,
  SubmitActionData,
  UpdateSeatData,
} from '@tokenizer/shared/types';
import { io, type Socket } from 'socket.io-client';

/** Failed acks come back as `{ error }` instead of the expected payload. */
export interface GameSocketFailure {
  error: string;
}

export type GameAck<T> = T | GameSocketFailure;

export interface GameActionResult {
  snapshot: GameSnapshot;
  /** Present when the move settled the deal — a poker hand or a free round. */
  resolution?: GameResolution;
}

export type HandSettledPayload = GameSnapshot & {
  resolution: HandResolution;
};

export type RoundResolvedPayload = GameSnapshot & {
  resolution: RoundResolution;
};

export type ParticipantLeftPayload = GameSnapshot & {
  participantId: string;
};

/** Server → room broadcasts (see `GameRuntimeGateway`). */
interface ServerToClientEvents {
  [GAME_SERVER_EVENTS.PARTICIPANT_JOINED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.PARTICIPANT_UPDATED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.PARTICIPANT_DISCONNECTED]: (
    payload: ParticipantLeftPayload,
  ) => void;
  [GAME_SERVER_EVENTS.PARTICIPANT_LEFT]: (
    payload: ParticipantLeftPayload,
  ) => void;
  [GAME_SERVER_EVENTS.HAND_STARTED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.ROUND_STARTED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.ACTION_APPLIED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.HAND_SETTLED]: (payload: HandSettledPayload) => void;
  [GAME_SERVER_EVENTS.ROUND_RESOLVED]: (payload: RoundResolvedPayload) => void;
  [GAME_SERVER_EVENTS.SESSION_CLOSED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.ERROR]: (payload: GameSocketFailure) => void;
}

/**
 * Client → server messages, acked with the fresh snapshot (or `{ error }`).
 *
 * Only `game:attach` carries an identity, and it carries a token the server
 * signed. Every other message is authorised from what the socket was bound to
 * at attach, so none of them names a game or a seat.
 */
interface ClientToServerEvents {
  [GAME_CLIENT_MESSAGES.ATTACH]: (
    payload: AttachSocketData,
    ack: (response: GameAck<AttachSocketResponse>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.UPDATE_SEAT]: (
    payload: UpdateSeatData,
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.START_HAND]: (
    ack: (response: GameAck<GameActionResult>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.START_ROUND]: (
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.ACTION]: (
    payload: SubmitActionData,
    ack: (response: GameAck<GameActionResult>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.DECLARE_WINNERS]: (
    payload: DeclareWinnersData,
    ack: (response: GameAck<Required<GameActionResult>>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.RESOLVE]: (
    payload: ResolveRoundData,
    ack: (response: GameAck<Required<GameActionResult>>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.SNAPSHOT]: (
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.CLOSE]: (
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
}

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Opens a Socket.IO connection to the backend gateway. One socket per game page
 * is enough: `game:attach` binds it to the room named by the session uuid.
 */
export function createGameSocket(): GameSocket {
  return io(NEXT_PUBLIC_API_URL, {
    withCredentials: true,
    transports: ['websocket'],
  });
}

export { GAME_CLIENT_MESSAGES, GAME_SERVER_EVENTS };
