import type { PokerAction, PotAward } from '@tokenizer/shared/types';

export interface TableActions {
  startHand: () => void;
  startRound: () => void;
  submitAction: (
    action: PokerAction,
    amount?: number,
    targetParticipantId?: string,
  ) => void;
  submitCatalogAction: (
    definitionId: string,
    amount?: number,
    targetParticipantId?: string,
  ) => void;
  declareWinners: (awards: PotAward[]) => void;
  resolveRound: (winnerIds?: string[]) => void;
  closeGame: () => void;
  renameSeat: () => void;
  shareTable: () => void;

  pending: Nullable<string>;
  error: Nullable<string>;
}

const noop = () => {};

/**
 * Nothing to press: a spectator has no seat, so every panel shows its waiting
 * state and none of these is ever called.
 */
export const NO_TABLE_ACTIONS: TableActions = {
  startHand: noop,
  startRound: noop,
  submitAction: noop,
  submitCatalogAction: noop,
  declareWinners: noop,
  resolveRound: noop,
  closeGame: noop,
  renameSeat: noop,
  shareTable: noop,
  pending: null,
  error: null,
};
