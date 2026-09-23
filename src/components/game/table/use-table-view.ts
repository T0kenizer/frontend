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

/**
 * Everything the table screen needs to know, read off the snapshot once.
 *
 * The two halves of the screen — the ring of chairs and the panel in the middle
 * — are deliberately dumb about the game: one draws seats, the other draws
 * whatever the current state of play calls for. What decides _which_ state that
 * is lives here, so the question "is it my turn" is answered in one place
 * instead of being re-derived, slightly differently, by every panel that
 * cares.
 *
 * Nothing here works out what a player may do. The deal decides that — the hand
 * at a poker table, the round at a free one — and sends the answer down in
 * `legalActions`; a client that reasons about the betting alongside the server
 * is a client that eventually offers a button the server then refuses.
 *
 * The view is discriminated on `mode`, exactly as the snapshot it is read from
 * is. Both games have a ring of chairs, a pot and a turn; only one of them has
 * streets, blinds and a showdown, and a single view carrying both would leave
 * every panel guessing which of its fields mean anything today.
 */

export type TablePhase =
  /** Nobody has dealt: seats are still being taken. */
  | 'lobby'
  /** A deal is live and somebody owes an action. */
  | 'betting'
  /** Poker only: the betting is finished and the table has to call who won. */
  | 'showdown'
  /** Started, but between deals — the host opens the next one. */
  | 'intermission'
  /** Over. */
  | 'finished';

/** What a seat is doing, for the puck that draws it. */
export type SeatTone = 'free' | 'seated' | 'mine' | 'folded' | 'all-in' | 'out';

/**
 * The one notable thing about a seat's state, or null when there is nothing
 * notable to say.
 *
 * Separate from {@link SeatTone} — which is about how the chair is painted —
 * because this is a fact that has to be _read_: a player who folded is still at
 * the table with their stack in front of them, and dimming their chair by
 * itself does not say so.
 */
export type SeatStatusLabel =
  | 'folded'
  | 'all-in'
  | 'out'
  | 'away'
  | 'host-played';

/** The seat's job this hand, drawn as a marker on the chair. Poker only. */
export type SeatMarker = 'dealer' | 'small-blind' | 'big-blind';

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
  /** Took a pot in the last settlement. */
  isWinner: boolean;
  /**
   * What this seat is holding this hand: the button, or a blind. Always null at
   * a free table — it has no button to hold.
   */
  marker: Nullable<SeatMarker>;
  /** What it has put into the pot on the street being played. */
  committed: number;
  /** Called out under the name when it matters; null when it does not. */
  status: Nullable<SeatStatusLabel>;
  /** The line under the name, when there is no {@link status} to show. */
  caption: string;
}

/** One line of the feed shown while another player is deciding. */
export interface TableEvent {
  id: string;
  /** Who acted; null for something the table itself did. */
  actor: Nullable<string>;
  /** What they did, in words. */
  label: string;
  amount: Optional<number>;
  timestamp: string;
}

export type GameSession = ReturnType<typeof useGameSession>;

/**
 * One button in a free table's action panel, as the server says it is legal
 * right now — which at a free table means "the host put it in the catalog", not
 * "the rules allow it".
 */
export interface ActionOption {
  id: string;
  label: string;
  amountForm: AmountForm;
  grantsInterruption: boolean;
  foldsParticipant: Optional<boolean>;
}

/**
 * How a table stopped, once it has. Null while it is still being played.
 *
 * The two are not the same ending and the recap does not word them the same
 * way: one is a host calling time, the other is a room that emptied out and was
 * reclaimed. Telling a table it was "ended" when in truth everybody had already
 * left would be the app taking credit for a night that fizzled.
 */
export type TableEnding = 'ended-by-host' | 'abandoned';

/** What is true of a table whatever is being played at it. */
export interface TableViewBase {
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

  /** How every stack at this table should be drawn: a figure, or chips. */
  chipModel: ChipModel;

  /** The pots of the live deal, in the order they formed. */
  pots: PotSnapshot[];
  /** Chips on the table for the live deal. */
  pot: number;
  /** Chips across every stack. */
  inPlay: number;
  /** How many deals the table got through — hands, or free rounds. */
  dealsPlayed: number;
  /** How it stopped, once it has; null while it is still going. */
  ending: Nullable<TableEnding>;

  /** Still contesting the pot, in seat order — who a settlement chooses from. */
  contenders: ParticipantSnapshot[];

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

export interface PokerTableView extends TableViewBase {
  mode: GameMode.Poker;
  /** Exactly the moves the server called legal for the seat on turn. */
  legalActions: LegalAction[];
  /** Which hand of the night this is, and which betting round it is on. */
  handNumber: Nullable<number>;
  street: Nullable<Street>;
  streetLabel: Nullable<string>;
  /** What every seat must have in on this street to stay. */
  currentBet: number;
  /** What the acting seat still owes to stay in; 0 when a check is free. */
  toCall: number;
  /** What the table plays for. */
  stakes: TableStakes;
  /** What each winner took of the last pot, side pots included. */
  payouts: HandPayout[];
}

export interface FreeTableView extends TableViewBase {
  mode: GameMode.Free;
  /** Exactly the catalog entries the server called legal for the seat on turn. */
  legalActions: ActionOption[];
  /** An interruption window is open — anyone seated may cut in. */
  interruptionOpen: boolean;
}

export type TableView = PokerTableView | FreeTableView;

/** How many past events the summary panel shows before it starts scrolling. */
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

    /** Everything the two games answer the same way. */
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

    /**
     * The chairs, drawn from what the deal says about each of them. Taken as
     * parameters rather than read off a closure, because "whose turn is it" and
     * "what has this seat put in" are the two facts each mode answers its own
     * way.
     */
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

      // An unclaimed chair still takes its turn — the host plays it, because
      // there is nobody else to. Whether that is *this* client is what decides
      // if the action panel opens or the summary does.
      const proxySeat =
        isHost && activeSeat && !activeSeat.claimed ? activeSeat : null;

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

    // Not while an interruption window is open: that window belongs to nobody's
    // turn, so a host cutting in is cutting in as themselves. Leaving the proxy
    // set there would quietly spend the empty chair's stack on a move the host
    // made for their own.
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
        // A free round pools straight into the pot: nothing tracks what a seat
        // has in on "this street", because it has no streets to have it on.
        committedOf: () => 0,
        markerOf: () => null,
        winnerIds,
      }),

      activeSeat,
      isMyTurn,
      proxySeat,
      // While a window is open the rule flips: anyone seated may cut in, the
      // player whose turn it was included, and the only legal moves are the
      // interrupting ones (which the server has already filtered the list to).
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

/**
 * A finished session was called time on; an abandoned one ran out of people.
 * Every other status is a table still being played.
 */
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
}): string => {
  // Two facts about an empty chair, and a player needs both: the host is
  // playing it, and it is still there for the taking. "Empty" alone was a lie
  // — it implied the seat sits out, when in truth it has been dealt in since
  // the first deal.
  if (isFree)
    return phase === 'finished' ? 'Never claimed' : 'Free · host plays';
  if (seat.status === ParticipantStatus.Eliminated) return 'Out';
  if (seat.status === ParticipantStatus.Folded) return 'Folded';
  if (seat.status === ParticipantStatus.AllIn) return 'All in';
  if (!seat.connected) return 'Away';
  return phase === 'lobby' ? 'Seated' : 'In play';
};
