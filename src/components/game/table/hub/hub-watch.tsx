'use client';

import { EventFeed, ThinkingPulse } from '@components/game/table/hub/hub-feed';
import { HubShell } from '@components/game/table/hub/hub-shell';
import type { PokerTableView } from '@components/game/table/use-table-view';
import { formatAmount } from '@lib/amount';
import * as React from 'react';

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
  const { activeSeat, pot, recentEvents, mySeat, streetLabel } = view;

  // The seat's name comes off the snapshot either way; what an unclaimed one
  // adds is who is actually pushing its chips.
  const waitingOn = !activeSeat
    ? 'the table'
    : activeSeat.claimed
      ? activeSeat.displayName
      : `${activeSeat.displayName} · the host`;

  return (
    <HubShell
      eyebrow={streetLabel ?? 'In progress'}
      title={`${waitingOn} to act`}
      description={
        activeSeat && !activeSeat.claimed
          ? 'Nobody claimed that chair, so the host is playing it.'
          : undefined
      }
      facts={[
        { label: 'Pot', value: formatAmount(pot) },
        {
          label: 'Your stack',
          value: formatAmount(mySeat?.balance ?? 0),
        },
      ]}
      footnote="You will be prompted here when it is your turn."
    >
      <ThinkingPulse name={waitingOn} />

      <EventFeed
        events={recentEvents}
        emptyLabel="The hand has just been dealt. No moves yet."
      />
    </HubShell>
  );
};
