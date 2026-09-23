import {
  AmountForm,
  BettingStructure,
  GameMode,
  HandEventType,
  Street,
  type ActionDef,
} from '@tokenizer/shared/types';

export const SEAT_DISPLAY_NAME_MAX_LENGTH = 60;

export const GAME_NAME_MAX_LENGTH = 60;

export const DEFAULT_INITIAL_BALANCE = 1000;

export const INITIAL_BALANCE_STEP = 100;

export const DEFAULT_SMALL_BLIND = 5;
export const DEFAULT_BIG_BLIND = 10;

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

export const STREET_LABELS: Record<Street, string> = {
  [Street.Preflop]: 'Pre-flop',
  [Street.Flop]: 'Flop',
  [Street.Turn]: 'Turn',
  [Street.River]: 'River',
};

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

export const EXPERIMENTAL_MODE_NOTE: Partial<Record<GameMode, string>> = {
  [GameMode.Free]:
    'You write the rules and Tokenizer only counts the chips — it will not ' +
    'stop a game that does not work. Expect it to change.',
};

export interface ActionCatalogEntry extends ActionDef {
  description: string;
  enabledByDefault: boolean;
}

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

export const FORCED_BET_KINDS = [
  { label: 'small_blind', name: 'Small blind' },
  { label: 'big_blind', name: 'Big blind' },
  { label: 'ante', name: 'Ante' },
  { label: 'straddle', name: 'Straddle' },
] as const;

export const DEFAULT_FORCED_BET_AMOUNT = 5;

export const INTERRUPTION_WINDOWS = [
  { value: 1500, label: '1.5 s' },
  { value: 2500, label: '2.5 s' },
  { value: 4000, label: '4 s' },
] as const;

export const DEFAULT_INTERRUPTION_WINDOW = 2500;

export const humaniseAction = (definitionId: string): string => {
  const words = definitionId.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
