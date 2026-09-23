'use client';

import {
  HAND_EVENT_LABELS,
  humaniseAction,
  STREET_LABELS,
} from '@constants/games';
import type { useGameSession } from '@hooks/use-game-session';
import {
  ChipModel,
  GameMode,
  GameSessionStatus,
  HandStatus,
  ParticipantRole,
  ParticipantStatus,
  RoundStatus,
  type ActionDef,
  type AmountForm,
  type HandPayout,
  type LegalAction,
  type ParticipantSnapshot,
  type PotSnapshot,
  type Street,
  type TableStakes,
} from '@tokenizer/shared/types';
import { useMemo } from 'react';

export type TablePhase =
  | 'lobby'
  | 'betting'
  | 'showdown'
  | 'intermission'
  | 'finished';

export type SeatTone = 'free' | 'seated' | 'mine' | 'folded' | 'all-in' | 'out';

export type SeatStatusLabel =
  | 'folded'
  | 'all-in'
  | 'out'
  | 'away'
  | 'host-played';

export type SeatMarker = 'dealer' | 'small-blind' | 'big-blind';

export interface SeatView {
  seat: ParticipantSnapshot;
  tone: SeatTone;
  isMine: boolean;
  isActive: boolean;
  isHost: boolean;
  isFree: boolean;
  isWinner: boolean;
  marker: Nullable<SeatMarker>;
  committed: number;
  status: Nullable<SeatStatusLabel>;
  caption: React.ReactNode;
}

export interface TableEvent {
  id: string;
  actor: Nullable<string>;
  label: string;
  amount: Optional<number>;
  timestamp: string;
}

export type GameSession = ReturnType<typeof useGameSession>;

export interface ActionOption {
  id: string;
  label: string;
  amountForm: AmountForm;
  grantsInterruption: boolean;
  foldsParticipant: Optional<boolean>;
}

export type TableEnding = 'ended-by-host' | 'abandoned';

export interface TableViewBase {
  phase: TablePhase;
  seats: SeatView[];
  seatCount: number;
  claimedCount: number;

  mySeat: Nullable<ParticipantSnapshot>;
  isHost: boolean;

  activeSeat: Nullable<ParticipantSnapshot>;
  isMyTurn: boolean;
  proxySeat: Nullable<ParticipantSnapshot>;
  canAct: boolean;

  chipModel: ChipModel;

  pots: PotSnapshot[];
  pot: number;
  inPlay: number;
  dealsPlayed: number;
  ending: Nullable<TableEnding>;

  contenders: ParticipantSnapshot[];

  recentEvents: TableEvent[];
  winners: ParticipantSnapshot[];

  canAddSeat: boolean;
}

export interface PokerTableView extends TableViewBase {
  mode: GameMode.Poker;
  legalActions: LegalAction[];
  handNumber: Nullable<number>;
  street: Nullable<Street>;
  streetLabel: Nullable<string>;
  currentBet: number;
  toCall: number;
  stakes: TableStakes;
  payouts: HandPayout[];
}

export interface FreeTableView extends TableViewBase {
  mode: GameMode.Free;
  legalActions: ActionOption[];
  interruptionOpen: boolean;
}

export type TableView = PokerTableView | FreeTableView;

const FEED_LENGTH = 6;

export function useTableView(game: GameSession): Nullable<TableView> {
  const { snapshot, participantId, resolution } = game;

  return useMemo(() => {
    if (!snapshot) return null;

    const seats = [...snapshot.participants].sort(
      (a, b) => a.seatIndex - b.seatIndex,
    );

    const mySeat = participantId
      ? (seats.find((seat) => seat.id === participantId) ?? null)
      : null;
    const isHost = mySeat?.role === ParticipantRole.Host;
    const nameOf = (id: string) =>
      seats.find((seat) => seat.id === id)?.displayName ?? 'Empty seat';

    const isContender = (seat: ParticipantSnapshot) =>
      seat.status === ParticipantStatus.Active ||
      seat.status === ParticipantStatus.AllIn;

    const common = {
      seatCount: seats.length,
      dealsPlayed: snapshot.dealsPlayed,
      ending: endingOf(snapshot.status),
      claimedCount: seats.filter((seat) => seat.claimed).length,
      mySeat,
      isHost,
      chipModel: snapshot.chipModel,
      inPlay: seats.reduce((total, seat) => total + seat.balance, 0),
      contenders: seats.filter(isContender),
      canAddSeat: isHost && snapshot.canAddSeat,
    };

    const seatViewsFor = ({
      phase,
      activeSeat,
      committedOf,
      markerOf,
      winnerIds,
    }: {
      phase: TablePhase;
      activeSeat: Nullable<ParticipantSnapshot>;
      committedOf: (id: string) => number;
      markerOf: (seat: ParticipantSnapshot) => Nullable<SeatMarker>;
      winnerIds: Set<string>;
    }): SeatView[] =>
      seats.map((seat) => {
        const isMine = seat.id === participantId;
        const isFree = !seat.claimed;

        const tone: SeatTone = isFree
          ? 'free'
          : isMine
            ? 'mine'
            : seat.status === ParticipantStatus.Eliminated
              ? 'out'
              : seat.status === ParticipantStatus.Folded
                ? 'folded'
                : seat.status === ParticipantStatus.AllIn
                  ? 'all-in'
                  : 'seated';

        return {
          seat,
          tone,
          isMine,
          isActive: activeSeat?.id === seat.id,
          isHost: seat.role === ParticipantRole.Host,
          isFree,
          isWinner: winnerIds.has(seat.id),
          marker: markerOf(seat),
          committed: committedOf(seat.id),
          status: statusFor({ seat, phase, isFree }),
          caption: captionFor({ seat, phase, isFree }),
        };
      });

    if (snapshot.mode === GameMode.Poker) {
      const hand = snapshot.currentHand;
      const isBetting = hand?.status === HandStatus.Betting;
      const isShowdown = hand?.status === HandStatus.Showdown;

      const phase: TablePhase =
        snapshot.status === GameSessionStatus.Lobby
          ? 'lobby'
          : snapshot.status === GameSessionStatus.Running
            ? isBetting
              ? 'betting'
              : isShowdown
                ? 'showdown'
                : 'intermission'
            : 'finished';

      const activeSeat =
        isBetting && hand.betting.activeParticipant
          ? (seats.find((seat) => seat.id === hand.betting.activeParticipant) ??
            null)
          : null;

      const isMyTurn = !!mySeat && activeSeat?.id === mySeat.id;

      const proxySeat =
        isHost && activeSeat && !activeSeat.connected ? activeSeat : null;

      const currentBet = hand?.betting.currentBet ?? 0;
      const committedOf = (id: string) => hand?.betting.committed[id] ?? 0;
      const actingSeat = proxySeat ?? (isMyTurn ? mySeat : null);

      const recentEvents: TableEvent[] = hand
        ? [...hand.events]
            .reverse()
            .slice(0, FEED_LENGTH)
            .map((event) => ({
              id: event.id,
              actor: event.participantId ? nameOf(event.participantId) : null,
              label: event.participantId
                ? HAND_EVENT_LABELS[event.type]
                : `${STREET_LABELS[event.street]} ${HAND_EVENT_LABELS[event.type]}`,
              amount: event.amount,
              timestamp: event.timestamp,
            }))
        : [];

      const settledThisHand =
        resolution?.mode === GameMode.Poker && resolution.handId === hand?.id;
      const winnerIds = new Set(
        settledThisHand ? (resolution?.winners ?? []) : [],
      );

      return {
        ...common,
        mode: GameMode.Poker,
        phase,
        seats: seatViewsFor({
          phase,
          activeSeat,
          committedOf,
          markerOf: (seat) =>
            !hand
              ? null
              : seat.id === hand.dealerParticipant
                ? 'dealer'
                : seat.id === hand.smallBlindParticipant
                  ? 'small-blind'
                  : seat.id === hand.bigBlindParticipant
                    ? 'big-blind'
                    : null,
          winnerIds,
        }),

        activeSeat,
        isMyTurn,
        proxySeat,
        canAct: isBetting && (isMyTurn || !!proxySeat),
        legalActions: isBetting ? hand.betting.legalActions : [],

        handNumber: hand?.handNumber ?? null,
        street: hand?.street ?? null,
        streetLabel: hand ? STREET_LABELS[hand.street] : null,
        currentBet,
        toCall: actingSeat
          ? Math.max(0, currentBet - committedOf(actingSeat.id))
          : 0,
        stakes: snapshot.stakes,

        pots: hand?.pots ?? [],
        pot: hand?.pots.reduce((total, pot) => total + pot.amount, 0) ?? 0,

        recentEvents,
        winners: seats.filter((seat) => winnerIds.has(seat.id)),
        payouts:
          settledThisHand && resolution?.mode === GameMode.Poker
            ? resolution.payouts
            : [],
      };
    }

    const round = snapshot.currentRound;
    const isRoundLive = round?.status === RoundStatus.InProgress;

    const phase: TablePhase =
      snapshot.status === GameSessionStatus.Lobby
        ? 'lobby'
        : snapshot.status === GameSessionStatus.Running
          ? isRoundLive
            ? 'betting'
            : 'intermission'
          : 'finished';

    const activeSeat = isRoundLive
      ? (seats.find((seat) => seat.id === round.turn.activeParticipant) ?? null)
      : null;

    const isMyTurn = !!mySeat && activeSeat?.id === mySeat.id;
    const interruptionOpen = isRoundLive && round.turn.interruptionOpen;

    const proxySeat =
      isHost && activeSeat && !activeSeat.claimed && !interruptionOpen
        ? activeSeat
        : null;

    const labelOf = (definitionId: string) =>
      round?.turn.legalActions.find((action) => action.id === definitionId)
        ?.label ?? humaniseAction(definitionId);

    const recentEvents: TableEvent[] = round
      ? [...round.actionLog]
          .reverse()
          .slice(0, FEED_LENGTH)
          .map((action) => ({
            id: action.id,
            actor: nameOf(action.participantId),
            label: labelOf(action.definitionId),
            amount: action.amount,
            timestamp: action.timestamp,
          }))
      : [];

    const settledThisRound =
      resolution?.mode === GameMode.Free && resolution.roundId === round?.id;
    const winnerIds = new Set(
      settledThisRound ? (resolution?.winners ?? []) : [],
    );

    return {
      ...common,
      mode: GameMode.Free,
      phase,
      seats: seatViewsFor({
        phase,
        activeSeat,
        committedOf: () => 0,
        markerOf: () => null,
        winnerIds,
      }),

      activeSeat,
      isMyTurn,
      proxySeat,
      canAct:
        isRoundLive && (interruptionOpen ? !!mySeat : isMyTurn || !!proxySeat),
      interruptionOpen,
      legalActions: isRoundLive
        ? round.turn.legalActions.map(toActionOption)
        : [],

      pots: round?.pots ?? [],
      pot: round?.pots.reduce((total, pot) => total + pot.amount, 0) ?? 0,

      recentEvents,
      winners: seats.filter((seat) => winnerIds.has(seat.id)),
    };
  }, [snapshot, participantId, resolution]);
}

const endingOf = (status: GameSessionStatus): Nullable<TableEnding> =>
  status === GameSessionStatus.Finished
    ? 'ended-by-host'
    : status === GameSessionStatus.Abandoned
      ? 'abandoned'
      : null;

const toActionOption = (action: ActionDef): ActionOption => ({
  id: action.id,
  label: action.label,
  amountForm: action.amountForm,
  grantsInterruption: action.grantsInterruption,
  foldsParticipant: action.foldsParticipant,
});

const statusFor = ({
  seat,
  phase,
  isFree,
}: {
  seat: ParticipantSnapshot;
  phase: TablePhase;
  isFree: boolean;
}): Nullable<SeatStatusLabel> => {
  if (isFree) return phase === 'finished' ? null : 'host-played';
  if (seat.status === ParticipantStatus.Eliminated) return 'out';
  if (seat.status === ParticipantStatus.Folded) return 'folded';
  if (seat.status === ParticipantStatus.AllIn) return 'all-in';
  if (!seat.connected) return 'away';
  return null;
};

const captionFor = ({
  seat,
  phase,
  isFree,
}: {
  seat: ParticipantSnapshot;
  phase: TablePhase;
  isFree: boolean;
}): React.ReactNode => {
  if (isFree)
    return phase === 'finished' ? 'Never claimed' : 'Free · host plays';
  if (seat.status === ParticipantStatus.Eliminated) return 'Out';
  if (seat.status === ParticipantStatus.Folded) return 'Folded';
  if (seat.status === ParticipantStatus.AllIn) return 'All in';
  if (!seat.connected) return 'Away';
  return phase === 'lobby' ? 'Seated' : 'In play';
};
