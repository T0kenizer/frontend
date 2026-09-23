import {
  BettingStructure,
  HandEventType,
  Street,
} from '@tokenizer/shared/types';

/**
 * How many slots the code input lays out.
 *
 * The authority on the shape of a code is `joinCodeSchema` in
 * `@tokenizer/shared`, which is what the API validates against; this is only
 * how many boxes to draw. Kept as a named constant so the OTP input, its
 * `maxLength` and the auto-submit threshold can never drift from one another.
 */
export const JOIN_CODE_LENGTH = 6;

/**
 * Cap on the name a player takes a seat under, mirroring `claimSeatDataSchema`.
 * Enforced here only so the input stops accepting characters the API would
 * reject after the round trip.
 */
export const SEAT_DISPLAY_NAME_MAX_LENGTH = 60;

/** Cap on a game's name, mirroring `createGameSessionDataSchema`. */
export const GAME_NAME_MAX_LENGTH = 60;

/**
 * How many seats a table may be opened with, mirroring `seatingPolicySchema`.
 * Enforced here only so the creation form stops where the API would.
 */
export const MIN_SEATS = 2;
export const MAX_SEATS = 32;

/** The stack a seat starts on when the host does not say otherwise. */
export const DEFAULT_INITIAL_BALANCE = 1000;

/** How much one press of the stack stepper moves it. */
export const INITIAL_BALANCE_STEP = 100;

/** The stakes a poker table opens on, mirroring the server's own defaults. */
export const DEFAULT_SMALL_BLIND = 5;
export const DEFAULT_BIG_BLIND = 10;

/**
 * What each betting structure does, in the words a host picks it by. The value
 * is the rule; the hint is why it changes the night.
 */
export const BETTING_STRUCTURES = [
  {
    value: BettingStructure.NoLimit,
    label: 'No limit',
    hint: 'Any bet up to the whole stack. Every hand can be for everything.',
  },
  {
    value: BettingStructure.PotLimit,
    label: 'Pot limit',
    hint: 'A bet is capped at the size of the pot. Stacks build rather than vanish.',
  },
  {
    value: BettingStructure.FixedLimit,
    label: 'Fixed limit',
    hint: 'Bets come in one fixed step, doubled from the turn, four to a street.',
  },
] as const;

/** The betting rounds, as they are announced at the table. */
export const STREET_LABELS: Record<Street, string> = {
  [Street.Preflop]: 'Pre-flop',
  [Street.Flop]: 'Flop',
  [Street.Turn]: 'Turn',
  [Street.River]: 'River',
};

/** Everything the hand log can say, in words rather than constants. */
export const HAND_EVENT_LABELS: Record<HandEventType, string> = {
  [HandEventType.Ante]: 'Ante',
  [HandEventType.SmallBlind]: 'Small blind',
  [HandEventType.BigBlind]: 'Big blind',
  [HandEventType.Fold]: 'Folded',
  [HandEventType.Check]: 'Checked',
  [HandEventType.Call]: 'Called',
  [HandEventType.Bet]: 'Bet',
  [HandEventType.Raise]: 'Raised to',
  [HandEventType.AllIn]: 'All in',
  [HandEventType.StreetDealt]: 'dealt',
};
