'use client';

import { EventFeed } from '@components/game/table/hub/hub-feed';
import { HubShell } from '@components/game/table/hub/hub-shell';
import type { PokerTableView } from '@components/game/table/use-table-view';
import { formatAmount } from '@lib/amount';

/**
 * Somebody else is deciding.
 *
 * This is the state the table spends most of its time in, and the easy mistake
 * would be to show nothing — the turn is not yours, so there is nothing to tap.
 * But a player who can see nothing happening cannot tell a table that is
 * thinking from one that has frozen, and will reach for the refresh button. So
 * the middle of the table keeps answering the same question it always answers:
 * what is going on right now.
 *
 * Three things, in the order they are wanted: whose turn it is, how big the pot
 * has got, and what the last few people did.
 */

export interface HubWatchProps {
  view: PokerTableView;
}

export const HubWatch: React.FC<HubWatchProps> = ({ view }) => {
  const { pot, recentEvents, mySeat } = view;

  return (
    <HubShell
      facts={[
        { label: 'Pot', value: formatAmount(pot) },
        {
          label: 'Your stack',
          value: formatAmount(mySeat?.balance ?? 0),
        },
      ]}
    >
      <EventFeed events={recentEvents} emptyLabel="No moves yet." />
    </HubShell>
  );
};
