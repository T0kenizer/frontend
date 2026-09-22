'use client';

import type { TableActions } from '@components/game/table/table-actions';
import type { TableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { UserPlus } from 'lucide-react';
import * as React from 'react';

/**
 * "One more chair" — the answer to somebody turning up at a table that is
 * already full.
 *
 * It renders nothing at all unless the server says the seat may be opened,
 * which is the whole point of `canAddSeat` coming down on the snapshot: the
 * three conditions behind it (the host set the table up to allow it, every
 * existing chair is taken, and their plan has room) are not things a client can
 * work out, and a button that appears and then fails is worse than one that was
 * never there.
 *
 * Shown in the lobby and between rounds, because those are the two moments a
 * seat can actually be added — mid-round it would join a rotation that has
 * already passed it.
 */
export const AddSeatButton: React.FC<{
  view: TableView;
  actions: TableActions;
}> = ({ view, actions }) => {
  if (!view.canAddSeat) return null;

  return (
    <Button
      variant="line"
      className="w-full"
      loading={actions.pending === 'add-seat'}
      onClick={actions.addSeat}
    >
      <UserPlus />
      Add a seat
    </Button>
  );
};
