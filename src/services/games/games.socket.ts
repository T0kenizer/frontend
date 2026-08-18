import { NEXT_PUBLIC_API_URL } from '@lib/env';
import {
  GAME_CLIENT_MESSAGES,
  GAME_SERVER_EVENTS,
} from '@tokenizer/shared/constants/games.constants';
import type {
  ClaimSeatData,
  GameConfig,
  GameSnapshot,
  ResolveRoundData,
  RoundResolution,
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
  resolution?: RoundResolution;
}

export type RoundResolvedPayload = GameSnapshot & {
  resolution: RoundResolution;
};

/** Server → room broadcasts (see `GameRuntimeGateway`). */
interface ServerToClientEvents {
  [GAME_SERVER_EVENTS.PARTICIPANT_JOINED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.PARTICIPANT_UPDATED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.ROUND_STARTED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.ACTION_APPLIED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.ROUND_RESOLVED]: (payload: RoundResolvedPayload) => void;
  [GAME_SERVER_EVENTS.SESSION_CLOSED]: (snapshot: GameSnapshot) => void;
  [GAME_SERVER_EVENTS.ERROR]: (payload: GameSocketFailure) => void;
}

/** Client → server messages, acked with the fresh snapshot (or `{ error }`). */
interface ClientToServerEvents {
  [GAME_CLIENT_MESSAGES.CREATE]: (
    payload: { externalId: string; config?: GameConfig },
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.JOIN]: (
    payload: ClaimSeatData & { joinCode: string },
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.UPDATE_SEAT]: (
    payload: Omit<UpdateSeatData, 'externalId'> & { joinCode: string },
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.START_ROUND]: (
    payload: { joinCode: string },
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.ACTION]: (
    payload: { joinCode: string; definitionId: string; amount?: number },
    ack: (response: GameAck<GameActionResult>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.RESOLVE]: (
    payload: ResolveRoundData & { joinCode: string },
    ack: (response: GameAck<Required<GameActionResult>>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.SNAPSHOT]: (
    payload: { joinCode: string },
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GAME_CLIENT_MESSAGES.CLOSE]: (
    payload: { joinCode: string },
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
}

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Opens a Socket.IO connection to the backend gateway. One socket per game page
 * is enough: the server maps the socket to its room on `game:join`.
 */
export function createGameSocket(): GameSocket {
  return io(NEXT_PUBLIC_API_URL, {
    withCredentials: true,
    transports: ['websocket'],
  });
}

export { GAME_CLIENT_MESSAGES, GAME_SERVER_EVENTS };
