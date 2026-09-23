import {
  AmountForm,
  BettingStructure,
  GameMode,
  HandEventType,
  Street,
  type ActionDef,
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

/** Free Mode Constants */

/**
 * What each mode is worth saying about it beyond its own description. Poker is
 * what Tokenizer is for; the free table is where it started, kept because it
 * can express a game poker cannot — and flagged, because it can equally express
 * one nobody can play.
 */
export const EXPERIMENTAL_MODE_NOTE: Partial<Record<GameMode, string>> = {
  [GameMode.Free]:
    'You write the rules and Tokenizer only counts the chips — it will not ' +
    'stop a game that does not work. Expect it to change.',
};

export interface ActionCatalogEntry extends ActionDef {
  /** The one-liner the creation screen explains the action by. */
  description: string;
  /**
   * Whether the action is on when the form opens. The four that are mirror the
   * server's default free-mode config, so an untouched form creates the same
   * table as opening one on the mode's own defaults.
   */
  enabledByDefault: boolean;
}

/**
 * Every action a host can put on a free table. The host picks from this list
 * rather than writing action definitions, so what reaches `actionCatalog` is
 * always a shape the runtime knows how to apply.
 */
export const ACTION_CATALOG: readonly ActionCatalogEntry[] = [
  {
    id: 'check',
    label: 'Check',
    description: 'Pass the turn on without committing anything.',
    amountForm: AmountForm.None,
    grantsInterruption: false,
    enabledByDefault: true,
  },
  {
    id: 'call',
    label: 'Call',
    description: 'Match the bet currently on the table.',
    amountForm: AmountForm.Constrained,
    grantsInterruption: false,
    enabledByDefault: true,
  },
  {
    id: 'raise',
    label: 'Raise',
    description: 'Go above the bet currently on the table.',
    amountForm: AmountForm.Raise,
    grantsInterruption: false,
    enabledByDefault: true,
  },
  {
    id: 'fold',
    label: 'Fold',
    description: 'Give up the round.',
    amountForm: AmountForm.None,
    grantsInterruption: false,
    foldsParticipant: true,
    enabledByDefault: true,
  },
  {
    id: 'bet',
    label: 'Bet',
    description: 'Open with an amount of their choosing.',
    amountForm: AmountForm.Free,
    grantsInterruption: false,
    enabledByDefault: false,
  },
  {
    id: 'all_in',
    label: 'All in',
    description: 'Push the whole stack at once.',
    amountForm: AmountForm.Constrained,
    grantsInterruption: true,
    enabledByDefault: false,
  },
];

/**
 * The forced bets a host can put at the start of a round. `label` is the
 * identifier the runtime carries; `name` is what the screen calls it.
 */
export const FORCED_BET_KINDS = [
  { label: 'small_blind', name: 'Small blind' },
  { label: 'big_blind', name: 'Big blind' },
  { label: 'ante', name: 'Ante' },
  { label: 'straddle', name: 'Straddle' },
] as const;

/** What a forced bet added from the form opens at. */
export const DEFAULT_FORCED_BET_AMOUNT = 5;

/**
 * How long the others get to cut in, offered as a few round values rather than
 * a free field: the choice is "a beat" or "a moment", not a millisecond count.
 */
export const INTERRUPTION_WINDOWS = [
  { value: 1500, label: '1.5 s' },
  { value: 2500, label: '2.5 s' },
  { value: 4000, label: '4 s' },
] as const;

export const DEFAULT_INTERRUPTION_WINDOW = 2500;

/** `big_blind` / `all-in` → `Big blind` / `All in`, when nothing better exists. */
export const humaniseAction = (definitionId: string): string => {
  const words = definitionId.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
