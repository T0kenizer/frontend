'use client';

import {
  DEFAULT_BIG_BLIND,
  DEFAULT_INITIAL_BALANCE,
  DEFAULT_SMALL_BLIND,
  MAX_SEATS,
  MIN_SEATS,
} from '@constants/games';
import {
  BettingStructure,
  ChipModel,
  GameMode,
  type PokerGameConfig,
} from '@tokenizer/shared/types';
import * as React from 'react';

/**
 * A seat as the host is still shaping it. It carries its own key because a seat
 * is renamed and reordered while it is being drafted, so neither its name nor
 * its index is stable enough to identify it.
 */
export interface SeatDraft {
  key: string;
  displayName: string;
  /** Read only while `perSeatStacks` is on; null means "the table default". */
  initialBalance: Nullable<number>;
}

/**
 * Everything the creation screen holds.
 *
 * It is deliberately not a `GameConfig`: a draft carries half-typed names and a
 * per-seat toggle the API knows nothing about. What it does share with the API
 * is the shape of the decision — a mode, and that mode's own parameters — so
 * there is no field here that poker has no use for. {@link buildGameConfig} is
 * where the two meet.
 */
export interface GameDraft {
  name: string;
  /** The game being set up. Everything below it is that game's own. */
  mode: GameMode;
  seats: SeatDraft[];
  defaultInitialBalance: number;
  perSeatStacks: boolean;
  allowMidGameClaims: boolean;
  /**
   * Whether the host may open further seats once every declared one is taken.
   * Capped by the plan on top, like the seat count itself.
   */
  allowExtraSeats: boolean;

  /** Poker parameters. */
  smallBlind: number;
  bigBlind: number;
  /** Posted by every seat before the blinds; 0 for no ante. */
  ante: number;
  bettingStructure: BettingStructure;
  chipModel: ChipModel;
}

/** What stops the table from opening, and what merely deserves a word. */
export interface DraftReview {
  blocker: Nullable<string>;
  advice: Nullable<string>;
}

let sequence = 0;

/** Keys only ever live in this client's memory, so a counter is enough. */
const nextKey = (prefix: string) => `${prefix}-${++sequence}`;

const createSeat = (displayName: string): SeatDraft => ({
  key: nextKey('seat'),
  displayName,
  initialBalance: null,
});

export function createInitialDraft(): GameDraft {
  return {
    name: '',
    mode: GameMode.Poker,
    seats: Array.from({ length: 4 }, (_, index) =>
      createSeat(`Seat ${index + 1}`),
    ),
    defaultInitialBalance: DEFAULT_INITIAL_BALANCE,
    perSeatStacks: false,
    allowMidGameClaims: true,
    allowExtraSeats: true,
    smallBlind: DEFAULT_SMALL_BLIND,
    bigBlind: DEFAULT_BIG_BLIND,
    ante: 0,
    bettingStructure: BettingStructure.NoLimit,
    chipModel: ChipModel.AbstractBalance,
  };
}

/** What a seat actually starts on, whichever way the stacks are being set. */
export const seatStack = (draft: GameDraft, seat: SeatDraft): number =>
  draft.perSeatStacks && seat.initialBalance !== null
    ? seat.initialBalance
    : draft.defaultInitialBalance;

export const totalInPlay = (draft: GameDraft): number =>
  draft.seats.reduce((total, seat) => total + seatStack(draft, seat), 0);

/** The draft as the API takes it. */
export function buildGameConfig(draft: GameDraft): PokerGameConfig {
  return {
    mode: GameMode.Poker,
    seating: {
      seats: draft.seats.map((seat) => ({
        displayName: seat.displayName.trim(),
        // Omitted rather than repeated: a seat with no stack of its own keeps
        // following the table default, including when that default changes.
        ...(draft.perSeatStacks && seat.initialBalance !== null
          ? { initialBalance: seat.initialBalance }
          : {}),
      })),
      defaultInitialBalance: draft.defaultInitialBalance,
      allowMidGameClaims: draft.allowMidGameClaims,
      allowExtraSeats: draft.allowExtraSeats,
    },
    rules: {
      blinds: { small: draft.smallBlind, big: draft.bigBlind },
      ante: draft.ante,
      bettingStructure: draft.bettingStructure,
      chipModel: draft.chipModel,
    },
  };
}

/**
 * Everything wrong with the draft, worst first — one line at a time, because a
 * host fixing a table does not need a list, they need the next thing to fix.
 */
export function reviewDraft(draft: GameDraft): DraftReview {
  const names = draft.seats.map((seat) => seat.displayName.trim());
  const shortestStack = Math.min(
    ...draft.seats.map((seat) => seatStack(draft, seat)),
  );

  const blocker = names.some((name) => !name)
    ? 'Every seat needs a name.'
    : new Set(names.map((name) => name.toLowerCase())).size !== names.length
      ? 'Two seats share the same name — players will not know where to sit.'
      : draft.seats.length < MIN_SEATS
        ? `A table needs at least ${MIN_SEATS} seats.`
        : draft.smallBlind < 1 || draft.bigBlind < 1
          ? 'Both blinds need an amount.'
          : draft.bigBlind < draft.smallBlind
            ? 'The big blind cannot be smaller than the small blind.'
            : shortestStack <= draft.bigBlind
              ? 'A stack has to be worth more than the big blind it posts.'
              : null;

  // A twentieth of a stack per hand is the point where a night starts running
  // itself. Worth saying, never worth refusing.
  const cost =
    draft.bigBlind + draft.smallBlind + draft.ante * draft.seats.length;
  const advice =
    cost > draft.defaultInitialBalance / 10
      ? 'The blinds are steep against these stacks — the table will move fast.'
      : null;

  return { blocker, advice };
}

export interface GameDraftController {
  draft: GameDraft;
  /** The draft as the API takes it. */
  config: PokerGameConfig;
  review: DraftReview;
  totalInPlay: number;
  patch: (changes: Partial<GameDraft>) => void;
  addSeat: (displayName: string) => void;
  renameSeat: (key: string, displayName: string) => void;
  setSeatStack: (key: string, stack: Nullable<number>) => void;
  removeSeat: (key: string) => void;
  setDefaultStack: (stack: number) => void;
  setPerSeatStacks: (on: boolean) => void;
}

/**
 * The state behind the creation screen.
 *
 * It owns the rules that span two parts of the form — raising the default stack
 * under seats that were following it, keeping the blinds in step with one
 * another — so no section has to know what another one is holding.
 *
 * @param maxSeats Seats a table may open with, capped by the host's plan;
 *   defaults to the hard ceiling the API itself enforces.
 */
export function useGameDraft(
  maxSeats: number = MAX_SEATS,
): GameDraftController {
  const [draft, setDraft] = React.useState<GameDraft>(createInitialDraft);

  const patch = React.useCallback(
    (changes: Partial<GameDraft>) =>
      setDraft((current) => {
        const next = { ...current, ...changes };
        // The big blind follows the small one up rather than quietly becoming
        // illegal under it; a host who wants them apart still sets it after.
        if (
          changes.smallBlind !== undefined &&
          changes.bigBlind === undefined
        ) {
          next.bigBlind = Math.max(next.bigBlind, changes.smallBlind);
        }
        return next;
      }),
    [],
  );

  const addSeat = React.useCallback(
    (displayName: string) => {
      const name = displayName.trim();
      if (!name) return;

      setDraft((current) =>
        current.seats.length >= maxSeats
          ? current
          : { ...current, seats: [...current.seats, createSeat(name)] },
      );
    },
    [maxSeats],
  );

  const renameSeat = React.useCallback((key: string, displayName: string) => {
    setDraft((current) => ({
      ...current,
      seats: current.seats.map((seat) =>
        seat.key === key ? { ...seat, displayName } : seat,
      ),
    }));
  }, []);

  const setSeatStack = React.useCallback(
    (key: string, stack: Nullable<number>) => {
      setDraft((current) => ({
        ...current,
        seats: current.seats.map((seat) =>
          seat.key === key ? { ...seat, initialBalance: stack } : seat,
        ),
      }));
    },
    [],
  );

  const removeSeat = React.useCallback((key: string) => {
    setDraft((current) =>
      current.seats.length <= MIN_SEATS
        ? current
        : {
            ...current,
            seats: current.seats.filter((seat) => seat.key !== key),
          },
    );
  }, []);

  const setDefaultStack = React.useCallback((stack: number) => {
    setDraft((current) => ({
      ...current,
      defaultInitialBalance: stack,
      // Seats that were sitting on the old default were following it rather
      // than choosing it, so they follow it here too.
      seats: current.seats.map((seat) =>
        seat.initialBalance === current.defaultInitialBalance
          ? { ...seat, initialBalance: stack }
          : seat,
      ),
    }));
  }, []);

  const setPerSeatStacks = React.useCallback((on: boolean) => {
    setDraft((current) => ({
      ...current,
      perSeatStacks: on,
      // Turning it on opens every seat on the table default, so the switch
      // shows what it is about to let the host change; turning it off drops
      // the per-seat values rather than keeping them out of sight.
      seats: current.seats.map((seat) => ({
        ...seat,
        initialBalance: on
          ? (seat.initialBalance ?? current.defaultInitialBalance)
          : null,
      })),
    }));
  }, []);

  const config = React.useMemo(() => buildGameConfig(draft), [draft]);
  const review = React.useMemo(() => reviewDraft(draft), [draft]);
  const total = React.useMemo(() => totalInPlay(draft), [draft]);

  return {
    draft,
    config,
    review,
    totalInPlay: total,
    patch,
    addSeat,
    renameSeat,
    setSeatStack,
    removeSeat,
    setDefaultStack,
    setPerSeatStacks,
  };
}
