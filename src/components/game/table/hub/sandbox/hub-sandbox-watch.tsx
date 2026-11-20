'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { EventFeed } from '@components/game/table/hub/hub-feed';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type { SandboxTableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { formatAmount } from '@lib/amount';

/**
 * Somebody else is deciding, in a sandbox.
 *
 * The same answer to the same question as poker's watch panel — whose turn, how
 * big the pot, what just happened — with one control poker does not have and
 * cannot need: the host settling the round.
 *
 * It lives here, on the panel shown _during_ the round, because that is when a
 * sandbox round ends. Nothing in the runtime knows the host's game well enough
 * to say the last move has been played; the host does, and this is where they
 * say so.
 */

export interface HubSandboxWatchProps {
  view: SandboxTableView;
  actions: TableActions;
}

export const HubSandboxWatch: React.FC<HubSandboxWatchProps> = ({
  view,
  actions,
}) => {
  const { pot, recentEvents, isHost, mySeat } = view;

  return (
    <HubShell
      facts={[
        { label: 'Pot', value: formatAmount(pot) },
        ...(mySeat
          ? [{ label: 'Your stack', value: formatAmount(mySeat.balance) }]
          : []),
      ]}
    >
      <EventFeed events={recentEvents} emptyLabel="No moves yet." />

      {isHost && (
        <HubStack className="mt-3">
          {actions.error && (
            <FeltNotice tone="error">{actions.error}</FeltNotice>
          )}
          <Button
            variant="line"
            size="sm"
            className="w-full"
            loading={actions.pending === 'resolve'}
            onClick={() => actions.resolveRound()}
          >
            Settle round
          </Button>
        </HubStack>
      )}
    </HubShell>
  );
};
