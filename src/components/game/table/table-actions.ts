import type { PokerAction, PotAward } from '@tokenizer/shared/types';

/**
 * What the centre panel is allowed to do.
 *
 * Every panel takes this one object rather than a hand-picked set of callbacks,
 * so adding a control to a state of the game does not mean threading a new prop
 * through the ring, the hub and the shell to reach it. The panels stay pure:
 * they decide what to offer, never how to carry it out.
 */
export interface TableActions {
  /** Host: deal the next hand. */
  startHand: () => void;
  /**
   * Play a move.
   *
   * `amount` is the **total** the seat will have committed on this street — the
   * same convention the server states its `min`/`max` in, so a raise never has
   * to be converted on the way out.
   *
   * `targetParticipantId` names the unclaimed seat the host is playing on
   * behalf of; omitted, the move is for the caller's own chair. The server
   * refuses a target from anyone but the host, and refuses one at a seat
   * somebody has since claimed.
   */
  submitAction: (
    action: PokerAction,
    amount?: number,
    targetParticipantId?: string,
  ) => void;
  /** Host: settle the showdown, one award per pot. */
  declareWinners: (awards: PotAward[]) => void;
  /** Host: close the table for good. */
  closeGame: () => void;
  /** Open the form that renames this client's chair. */
  renameSeat: () => void;
  /** Host: open a further seat at a full table. */
  addSeat: () => void;
  /** Put the join code where someone else can get at it. */
  shareTable: () => void;

  /**
   * Which control is mid-flight, so it alone shows a spinner. A boolean would
   * spin every button on the panel for one tap.
   */
  pending: Nullable<string>;
  /** The last thing the server refused, if it has refused anything. */
  error: Nullable<string>;
}
