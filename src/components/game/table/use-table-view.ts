'use client';

import type { useGameSession } from '@hooks/use-game-session';
import {
  ChipModel,
  GameSessionStatus,
  ParticipantRole,
  ParticipantStatus,
  RoundStatus,
  type AmountForm,
  type ParticipantSnapshot,
} from '@tokenizer/shared/types';
import * as React from 'react';

/**
 * Everything the table screen needs to know, read off the snapshot once.
 *
 * The two halves of the screen — the ring of chairs and the panel in the middle
 * — are deliberately dumb about the game: one draws seats, the other draws
 * whatever the current state of play calls for. What decides _which_ state that
 * is lives here, so the question "is it my turn" is answered in one place
 * instead of being re-derived, slightly differently, by every panel that
 * cares.
 */

export type TablePhase =
  /** Nobody has started: seats are still being taken. */
  | 'lobby'
  /** Started, and a round is live. */
  | 'round'
  /** Started, but between rounds — the host deals the next one. */
  | 'intermission'
  /** Over. */
  | 'finished';

/** What a seat is doing, for the puck that draws it. */
export type SeatTone = 'free' | 'seated' | 'mine' | 'folded' | 'out';

/**
 * The one notable thing about a seat's state, or null when there is nothing
 * notable to say.
 *
 * Separate from {@link SeatTone} — which is about how the chair is painted —
 * because this is a fact that has to be _read_: a player who folded is still at
 * the table with their stack in front of them, and dimming their chair by
 * itself does not say so.
 */
export type SeatStatusLabel = 'folded' | 'out' | 'away' | 'host-played';

export interface SeatView {
  seat: ParticipantSnapshot;
  tone: SeatTone;
  /** This client's own chair. */
  isMine: boolean;
  /** Whose turn it is. */
  isActive: boolean;
  isHost: boolean;
  /**
   * Nobody has claimed it — which also means the host is the one playing it. A
   * table never has a seat without a controller, so there is no third state
   * between "someone's chair" and "the host's to play"; it is claimable at the
   * same time, by whoever turns up next.
   */
  isFree: boolean;
  /** Took a pot in the last resolution. */
  isWinner: boolean;
  /** Called out under the name when it matters; null when it does not. */
  status: Nullable<SeatStatusLabel>;
  /** The line under the name, when there is no {@link status} to show. */
  caption: string;
}

/** One line of the feed shown while another player is deciding. */
export interface TableEvent {
  id: string;
  /** Who acted. */
  actor: string;
  /** What they did, in words. */
  label: string;
  amount: Optional<number>;
  timestamp: string;
}

export type GameSession = ReturnType<typeof useGameSession>;

/** One button in the action panel, as the server says it is legal right now. */
export interface ActionOption {
  id: string;
  label: string;
  amountForm: AmountForm;
  grantsInterruption: boolean;
  foldsParticipant: Optional<boolean>;
}

export interface TableView {
  phase: TablePhase;
  seats: SeatView[];
  seatCount: number;
  claimedCount: number;

  /**
   * This client's chair.
   *
   * Nullable only for the instant between the snapshot arriving and the socket
   * saying which seat this token buys. There is no such thing as a spectator
   * here: `/game/:uuid` is gated on holding a seat, and anyone without one is
   * sent to the join flow before the table renders at all.
   */
  mySeat: Nullable<ParticipantSnapshot>;
  isHost: boolean;

  activeSeat: Nullable<ParticipantSnapshot>;
  isMyTurn: boolean;
  /**
   * The empty chair this client (the host) is playing on behalf of, if the turn
   * has landed on one.
   */
  proxySeat: Nullable<ParticipantSnapshot>;
  /** True when this client may submit an action right now. */
  canAct: boolean;
  /** An interruption window is open — anyone may cut in. */
  interruptionOpen: boolean;
  legalActions: ActionOption[];

  /** How every stack at this table should be drawn: a figure, or chips. */
  chipModel: ChipModel;

  /** Chips on the table for the live round. */
  pot: number;
  /** Chips across every stack. */
  inPlay: number;

  /** Newest first, for the panel shown on someone else's turn. */
  recentEvents: TableEvent[];
  /** Who took the last pot. */
  winners: ParticipantSnapshot[];

  /**
   * Whether this client may open another seat right now.
   *
   * The server decides — `canAddSeat` on the snapshot already folds in the
   * seating config, the owner's plan cap and whether every chair is taken — and
   * all that is added here is that it is the host doing the asking.
   */
  canAddSeat: boolean;
}

/** `big_blind` / `all-in` → `Big blind` / `All in`, when nothing better exists. */
export const humaniseAction = (definitionId: string): string => {
  const words = definitionId.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** How many past actions the summary panel shows before it starts scrolling. */
const FEED_LENGTH = 6;

export function useTableView(game: GameSession): Nullable<TableView> {
  const { snapshot, participantId, resolution } = game;

  return React.useMemo(() => {
    if (!snapshot) return null;

    const seats = [...snapshot.participants].sort(
      (a, b) => a.seatIndex - b.seatIndex,
    );

    const mySeat = participantId
      ? (seats.find((seat) => seat.id === participantId) ?? null)
      : null;
    const isHost = mySeat?.role === ParticipantRole.Host;

    const round = snapshot.currentRound;
    const isRoundLive = round?.status === RoundStatus.InProgress;

    const phase: TablePhase =
      snapshot.status === GameSessionStatus.Lobby
        ? 'lobby'
        : snapshot.status === GameSessionStatus.Running
          ? isRoundLive
            ? 'round'
            : 'intermission'
          : 'finished';

    const activeSeat = isRoundLive
      ? (seats.find((seat) => seat.id === round.turn.activeParticipant) ?? null)
      : null;

    const isMyTurn = !!mySeat && activeSeat?.id === mySeat.id;
    const interruptionOpen = isRoundLive && round.turn.interruptionOpen;

    // An unclaimed chair still takes its turn — the host plays it, because
    // there is nobody else to. Whether that is *this* client is what decides
    // if the action panel opens or the summary does.
    //
    // Not while an interruption window is open, though: that window belongs to
    // nobody's turn, so a host cutting in is cutting in as themselves. Leaving
    // the proxy set there would have quietly spent the empty chair's stack on
    // a move the host made for their own.
    const isProxiedTurn =
      !!activeSeat && !activeSeat.claimed && !interruptionOpen;
    const proxySeat = isHost && isProxiedTurn ? activeSeat : null;

    // While a window is open the rule flips: anyone seated may cut in, the
    // player whose turn it was included, and the only legal moves are the
    // interrupting ones (which the server has already filtered the list to).
    const canAct =
      isRoundLive && (interruptionOpen ? !!mySeat : isMyTurn || !!proxySeat);

    const legalActions: ActionOption[] = isRoundLive
      ? round.turn.legalActions.map((action) => ({
          id: action.id,
          label: action.label,
          amountForm: action.amountForm,
          grantsInterruption: action.grantsInterruption,
          foldsParticipant: action.foldsParticipant,
        }))
      : [];

    const nameOf = (id: string) =>
      seats.find((seat) => seat.id === id)?.displayName ?? 'Empty seat';

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

    const winnerIds = new Set(
      resolution?.roundId === round?.id ? (resolution?.winners ?? []) : [],
    );

    const seatViews: SeatView[] = seats.map((seat) => {
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
              : 'seated';

      return {
        seat,
        tone,
        isMine,
        isActive: activeSeat?.id === seat.id,
        isHost: seat.role === ParticipantRole.Host,
        isFree,
        isWinner: winnerIds.has(seat.id),
        status: statusFor({ seat, phase, isFree }),
        caption: captionFor({ seat, phase, isFree }),
      };
    });

    return {
      phase,
      seats: seatViews,
      seatCount: seats.length,
      claimedCount: seats.filter((seat) => seat.claimed).length,

      mySeat,
      isHost,

      activeSeat,
      isMyTurn,
      proxySeat,
      canAct,
      interruptionOpen,
      legalActions,

      chipModel: snapshot.chipModel,

      pot: round?.pots.reduce((total, pot) => total + pot.amount, 0) ?? 0,
      inPlay: seats.reduce((total, seat) => total + seat.balance, 0),

      recentEvents,
      winners: seats.filter((seat) => winnerIds.has(seat.id)),

      canAddSeat: isHost && snapshot.canAddSeat,
    };
  }, [snapshot, participantId, resolution]);
}

/**
 * The status worth calling out, if any.
 *
 * Ordered by what a player most needs to know about that chair right now: gone
 * for good beats out of this hand, which beats a dropped connection.
 */
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
}): string => {
  // Two facts about an empty chair, and a player needs both: the host is
  // playing it, and it is still there for the taking. "Empty" alone was a lie
  // — it implied the seat sits out, when in truth it has been dealt in since
  // round one.
  if (isFree)
    return phase === 'finished' ? 'Never claimed' : 'Free · host plays';
  if (seat.status === ParticipantStatus.Eliminated) return 'Out';
  if (seat.status === ParticipantStatus.Folded) return 'Folded';
  if (!seat.connected) return 'Away';
  return phase === 'lobby' ? 'Seated' : 'In play';
};
