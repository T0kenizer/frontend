import { AmountForm, type ActionDef } from '@tokenizer/shared/types';

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

export interface ActionCatalogEntry extends ActionDef {
  /** The one-liner the creation screen explains the action by. */
  description: string;
  /**
   * Whether the action is on when the form opens. The four that are mirror the
   * server's default preset, so an untouched form creates the same table as
   * creating one without a config at all.
   */
  enabledByDefault: boolean;
}

/**
 * Every action a host can put on the table. The host picks from this list
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
