'use client';

import { EventFeed, ThinkingPulse } from '@components/game/table/hub/hub-feed';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type { FreeTableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { formatAmount } from '@lib/amount';

/**
 * Somebody else is deciding, at a free table.
 *
 * The same answer to the same question as poker's watch panel — whose turn, how
 * big the pot, what just happened — with one control poker does not have and
 * cannot need: the host settling the round.
 *
 * It lives here, on the panel shown _during_ the round, because that is when a
 * free round ends. Nothing in the runtime knows the host's game well enough to
 * say the last move has been played; the host does, and this is where they say
 * so.
 */

export interface HubFreeWatchProps {
  view: FreeTableView;
  actions: TableActions;
}

export const HubFreeWatch: React.FC<HubFreeWatchProps> = ({
  view,
  actions,
}) => {
  const { activeSeat, pot, recentEvents, isHost, mySeat } = view;

  // The seat's name comes off the snapshot either way; what an unclaimed one
  // adds is who is actually pushing its chips.
  const waitingOn = !activeSeat
    ? 'the table'
    : activeSeat.claimed
      ? activeSeat.displayName
      : `${activeSeat.displayName} · the host`;

  return (
    <HubShell
      eyebrow="In progress"
      title={`${waitingOn} to act`}
      description={
        activeSeat && !activeSeat.claimed
          ? 'Nobody claimed that chair, so the host is playing it.'
          : undefined
      }
      facts={[
        { label: 'Pot', value: formatAmount(pot) },
        { label: 'Your stack', value: formatAmount(mySeat?.balance ?? 0) },
      ]}
      footnote="You will be prompted here when it is your turn."
    >
      <ThinkingPulse name={waitingOn} />

      <EventFeed
        events={recentEvents}
        emptyLabel="The round has just opened. No moves yet."
      />

      {isHost && (
        <HubStack className="mt-3">
          <Button
            variant="line"
            size="sm"
            className="w-full"
            loading={actions.pending === 'resolve'}
            onClick={() => actions.resolveRound()}
          >
            Settle this round
          </Button>
        </HubStack>
      )}
    </HubShell>
  );
};
