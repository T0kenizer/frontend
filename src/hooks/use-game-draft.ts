'use client';

import {
  ACTION_CATALOG,
  DEFAULT_FORCED_BET_AMOUNT,
  DEFAULT_INITIAL_BALANCE,
  DEFAULT_INTERRUPTION_WINDOW,
  FORCED_BET_KINDS,
  MAX_SEATS,
  MIN_SEATS,
} from '@constants/games';
import {
  ChipModel,
  Direction,
  EndResolution,
  PayoutMode,
  PotMode,
  TurnRegime,
  type GameConfig,
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

export interface ForcedBetDraft {
  key: string;
  /** One of {@link FORCED_BET_KINDS}' labels. */
  label: string;
  amount: number;
  seatOffset: number;
}

/**
 * Everything the creation screen holds. It is deliberately not a `GameConfig`:
 * a draft carries half-typed names, a per-seat toggle and an interruption
 * window that only matters under one regime, none of which the API knows about.
 * {@link buildGameConfig} is where the two meet.
 */
export interface GameDraft {
  name: string;
  seats: SeatDraft[];
  defaultInitialBalance: number;
  perSeatStacks: boolean;
  allowMidGameClaims: boolean;
  chipModel: ChipModel;
  potMode: PotMode;
  payoutMode: PayoutMode;
  forcedBets: ForcedBetDraft[];
  /** Ids of the enabled actions, in {@link ACTION_CATALOG} order. */
  enabledActions: string[];
  regime: TurnRegime;
  direction: Direction;
  interruptionWindow: number;
  resolution: EndResolution;
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
    seats: Array.from({ length: 4 }, (_, index) =>
      createSeat(`Seat ${index + 1}`),
    ),
    defaultInitialBalance: DEFAULT_INITIAL_BALANCE,
    perSeatStacks: false,
    allowMidGameClaims: true,
    chipModel: ChipModel.AbstractBalance,
    potMode: PotMode.Single,
    payoutMode: PayoutMode.WinnerTakesAll,
    forcedBets: [
      { key: nextKey('bet'), label: 'small_blind', amount: 5, seatOffset: 0 },
      { key: nextKey('bet'), label: 'big_blind', amount: 10, seatOffset: 1 },
    ],
    enabledActions: ACTION_CATALOG.filter(
      (action) => action.enabledByDefault,
    ).map((action) => action.id),
    regime: TurnRegime.Sequential,
    direction: Direction.Clockwise,
    interruptionWindow: DEFAULT_INTERRUPTION_WINDOW,
    resolution: EndResolution.Automatic,
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
export function buildGameConfig(draft: GameDraft): GameConfig {
  const isInterruptible = draft.regime === TurnRegime.SequentialInterruptible;
  const isAutomatic = draft.resolution === EndResolution.Automatic;

  return {
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
    },
    economy: {
      potMode: draft.potMode,
      chipModel: draft.chipModel,
      payoutMode: draft.payoutMode,
      forcedBets: draft.forcedBets.map((bet) => ({
        label: bet.label,
        amount: bet.amount,
        seatOffset: bet.seatOffset,
      })),
    },
    // Spelled out rather than spread: the catalog entries carry the copy the
    // form explains them by, which is ours and not the runtime's.
    actionCatalog: ACTION_CATALOG.filter((action) =>
      draft.enabledActions.includes(action.id),
    ).map((action) => ({
      id: action.id,
      label: action.label,
      amountForm: action.amountForm,
      grantsInterruption: action.grantsInterruption,
      ...(action.foldsParticipant ? { foldsParticipant: true } : {}),
    })),
    turnPolicy: {
      regime: draft.regime,
      direction: draft.direction,
      interruptionWindow: isInterruptible ? draft.interruptionWindow : null,
    },
    endPolicy: {
      resolution: draft.resolution,
      conditions: isAutomatic
        ? [{ type: 'LAST_PLAYER_STANDING', params: null }]
        : [],
    },
  };
}

/**
 * Everything wrong with the draft, worst first — one line at a time, because a
 * host fixing a table does not need a list, they need the next thing to fix.
 */
export function reviewDraft(draft: GameDraft): DraftReview {
  const names = draft.seats.map((seat) => seat.displayName.trim());

  const blocker = names.some((name) => !name)
    ? 'Every seat needs a name.'
    : new Set(names.map((name) => name.toLowerCase())).size !== names.length
      ? 'Two seats share the same name — players will not know where to sit.'
      : draft.seats.length < MIN_SEATS
        ? `A table needs at least ${MIN_SEATS} seats.`
        : !draft.enabledActions.length
          ? 'No action is on: players would have nothing to do on their turn.'
          : draft.forcedBets.some((bet) => bet.seatOffset >= draft.seats.length)
            ? 'An opening bet is owed by a seat that no longer exists.'
            : draft.forcedBets.some((bet) => bet.amount < 1)
              ? 'An opening bet has no amount.'
              : null;

  const advice = draft.forcedBets.some(
    (bet) => bet.amount > draft.defaultInitialBalance / 4,
  )
    ? 'An opening bet is over a quarter of the starting stack — stacks will melt fast.'
    : null;

  return { blocker, advice };
}

export interface GameDraftController {
  draft: GameDraft;
  /** The draft as the API takes it. */
  config: GameConfig;
  review: DraftReview;
  totalInPlay: number;
  patch: (changes: Partial<GameDraft>) => void;
  addSeat: (displayName: string) => void;
  renameSeat: (key: string, displayName: string) => void;
  setSeatStack: (key: string, stack: Nullable<number>) => void;
  removeSeat: (key: string) => void;
  setDefaultStack: (stack: number) => void;
  setPerSeatStacks: (on: boolean) => void;
  toggleAction: (id: string) => void;
  addForcedBet: () => void;
  updateForcedBet: (
    key: string,
    changes: Partial<Omit<ForcedBetDraft, 'key'>>,
  ) => void;
  removeForcedBet: (key: string) => void;
}

/**
 * The state behind the creation screen.
 *
 * It owns the rules that span two parts of the form — removing a seat that a
 * blind was owed by, raising the default stack under seats that were following
 * it — so no section has to know what another one is holding.
 */
/**
 * @param maxSeats Seats a table may open with, capped by the host's plan;
 *   defaults to the hard ceiling the API itself enforces.
 */
export function useGameDraft(
  maxSeats: number = MAX_SEATS,
): GameDraftController {
  const [draft, setDraft] = React.useState<GameDraft>(createInitialDraft);

  const patch = React.useCallback(
    (changes: Partial<GameDraft>) =>
      setDraft((current) => ({ ...current, ...changes })),
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
    setDraft((current) => {
      if (current.seats.length <= MIN_SEATS) return current;

      const seats = current.seats.filter((seat) => seat.key !== key);

      return {
        ...current,
        seats,
        // A blind owed by the seat that just left has to land somewhere, and
        // the last remaining seat is the only answer that is always valid.
        forcedBets: current.forcedBets.map((bet) => ({
          ...bet,
          seatOffset: Math.min(bet.seatOffset, seats.length - 1),
        })),
      };
    });
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

  const toggleAction = React.useCallback((id: string) => {
    setDraft((current) => ({
      ...current,
      enabledActions: current.enabledActions.includes(id)
        ? current.enabledActions.filter((actionId) => actionId !== id)
        : ACTION_CATALOG.filter(
            (action) =>
              action.id === id || current.enabledActions.includes(action.id),
          ).map((action) => action.id),
    }));
  }, []);

  const addForcedBet = React.useCallback(() => {
    setDraft((current) => ({
      ...current,
      forcedBets: [
        ...current.forcedBets,
        {
          key: nextKey('bet'),
          label: FORCED_BET_KINDS[2].label,
          amount: DEFAULT_FORCED_BET_AMOUNT,
          seatOffset: Math.min(
            current.forcedBets.length,
            current.seats.length - 1,
          ),
        },
      ],
    }));
  }, []);

  const updateForcedBet = React.useCallback(
    (key: string, changes: Partial<Omit<ForcedBetDraft, 'key'>>) => {
      setDraft((current) => ({
        ...current,
        forcedBets: current.forcedBets.map((bet) =>
          bet.key === key ? { ...bet, ...changes } : bet,
        ),
      }));
    },
    [],
  );

  const removeForcedBet = React.useCallback((key: string) => {
    setDraft((current) => ({
      ...current,
      forcedBets: current.forcedBets.filter((bet) => bet.key !== key),
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
    toggleAction,
    addForcedBet,
    updateForcedBet,
    removeForcedBet,
  };
}
