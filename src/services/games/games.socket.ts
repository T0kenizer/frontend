import { NEXT_PUBLIC_API_URL } from '@lib/env';
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
import { GameClientMessage, GameServerEvent } from '@tokenizer/shared/types';
import { io, type Socket } from 'socket.io-client';

export interface GameSocketFailure {
  error: string;
}

export type GameAck<T> = T | GameSocketFailure;

export interface GameActionResult {
  snapshot: GameSnapshot;
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
  [GameServerEvent.ParticipantJoined]: (snapshot: GameSnapshot) => void;
  [GameServerEvent.ParticipantUpdated]: (snapshot: GameSnapshot) => void;
  [GameServerEvent.ParticipantDisconnected]: (
    payload: ParticipantLeftPayload,
  ) => void;
  [GameServerEvent.ParticipantLeft]: (payload: ParticipantLeftPayload) => void;
  [GameServerEvent.HandStarted]: (snapshot: GameSnapshot) => void;
  [GameServerEvent.RoundStarted]: (snapshot: GameSnapshot) => void;
  [GameServerEvent.ActionApplied]: (snapshot: GameSnapshot) => void;
  [GameServerEvent.HandSettled]: (payload: HandSettledPayload) => void;
  [GameServerEvent.RoundResolved]: (payload: RoundResolvedPayload) => void;
  [GameServerEvent.SessionClosed]: (snapshot: GameSnapshot) => void;
  [GameServerEvent.Error]: (payload: GameSocketFailure) => void;
}

interface ClientToServerEvents {
  [GameClientMessage.Attach]: (
    payload: AttachSocketData,
    ack: (response: GameAck<AttachSocketResponse>) => void,
  ) => void;
  [GameClientMessage.UpdateSeat]: (
    payload: UpdateSeatData,
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GameClientMessage.StartHand]: (
    ack: (response: GameAck<GameActionResult>) => void,
  ) => void;
  [GameClientMessage.StartRound]: (
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GameClientMessage.Action]: (
    payload: SubmitActionData,
    ack: (response: GameAck<GameActionResult>) => void,
  ) => void;
  [GameClientMessage.DeclareWinners]: (
    payload: DeclareWinnersData,
    ack: (response: GameAck<Required<GameActionResult>>) => void,
  ) => void;
  [GameClientMessage.Resolve]: (
    payload: ResolveRoundData,
    ack: (response: GameAck<Required<GameActionResult>>) => void,
  ) => void;
  [GameClientMessage.Snapshot]: (
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
  [GameClientMessage.Close]: (
    ack: (response: GameAck<GameSnapshot>) => void,
  ) => void;
}

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createGameSocket(): GameSocket {
  const { origin, pathname } = new URL(NEXT_PUBLIC_API_URL);
  return io(origin, {
    path: `${pathname.replace(/\/+$/, '')}/socket.io`,
    withCredentials: true,
    transports: ['websocket'],
  });
}
