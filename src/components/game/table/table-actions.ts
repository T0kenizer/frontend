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
