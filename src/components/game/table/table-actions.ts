/**
 * What the centre panel is allowed to do.
 *
 * Every panel takes this one object rather than a hand-picked set of callbacks,
 * so adding a control to a state of the game does not mean threading a new prop
 * through the ring, the hub and the shell to reach it. The panels stay pure:
 * they decide what to offer, never how to carry it out.
 */
export interface TableActions {
  /** Host: deal the next round. */
  startRound: () => void;
  /**
   * Play the named action.
   *
   * `targetParticipantId` names the unclaimed seat the host is playing on
   * behalf of; omitted, the action is for the caller's own chair. The server
   * refuses a target from anyone but the host, and refuses one at a seat
   * somebody has since claimed.
   */
  submitAction: (
    definitionId: string,
    amount?: number,
    targetParticipantId?: string,
  ) => void;
  /** Host: settle the round on the named winners. */
  resolveRound: (winnerIds?: string[]) => void;
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
