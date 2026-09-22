'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { AddSeatButton } from '@components/game/table/hub/add-seat-button';
import { WaitingDial } from '@components/game/table/hub/hub-lobby';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type { TableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { formatAmount } from '@lib/amount';
import * as React from 'react';

/**
 * Between two rounds.
 *
 * Short, and in a good night nobody reads it — but it is the beat where the
 * last pot is announced, and skipping straight from a resolved round to the
 * next deal is how a player ends up richer without ever being told why.
 */

export interface HubIntermissionProps {
  view: TableView;
  actions: TableActions;
}

export const HubIntermission: React.FC<HubIntermissionProps> = ({
  view,
  actions,
}) => {
  const { winners, isHost, claimedCount, seatCount, inPlay } = view;

  const payoutLine = winners.length
    ? winners.length === 1
      ? `${winners[0].displayName} took the pot.`
      : `${winners.map((winner) => winner.displayName).join(' and ')} split the pot.`
    : undefined;

  return (
    <HubShell
      eyebrow="Between rounds"
      title={winners.length ? 'Pot settled' : 'Ready to deal'}
      description={payoutLine ?? 'The table is between rounds.'}
      facts={[
        { label: 'Seated', value: `${claimedCount}/${seatCount}` },
        { label: 'In play', value: formatAmount(inPlay) },
      ]}
      footnote={
        isHost
          ? 'Empty chairs are dealt in too — you play them when their turn comes.'
          : undefined
      }
    >
      {actions.error && (
        <FeltNotice tone="error" className="mb-3 text-left">
          {actions.error}
        </FeltNotice>
      )}

      {isHost ? (
        <HubStack>
          <Button
            variant="felt-inverse"
            size="xl"
            className="w-full"
            loading={actions.pending === 'start'}
            onClick={actions.startRound}
          >
            Deal the next round
          </Button>
          <AddSeatButton view={view} actions={actions} />
          <Button
            variant="line"
            size="lg"
            className="w-full"
            loading={actions.pending === 'close'}
            onClick={actions.closeGame}
          >
            End the game
          </Button>
        </HubStack>
      ) : (
        <WaitingDial label="Waiting for the next deal" />
      )}
    </HubShell>
  );
};
