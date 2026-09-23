'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { WaitingDial } from '@components/game/table/hub/hub-lobby';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type { PokerTableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { formatAmount } from '@lib/amount';

/**
 * Between two hands.
 *
 * Short, and in a good night nobody reads it — but it is the beat where the
 * last pot is announced, and skipping straight from a settled hand to the next
 * deal is how a player ends up richer without ever being told why.
 */

export interface HubIntermissionProps {
  view: PokerTableView;
  actions: TableActions;
}

export const HubIntermission: React.FC<HubIntermissionProps> = ({
  view,
  actions,
}) => {
  const { winners, payouts, isHost, claimedCount, seatCount, inPlay, stakes } =
    view;

  const took = (participantId: string) =>
    payouts.find((payout) => payout.participantId === participantId)?.amount;

  const payoutLine = winners.length
    ? winners
        .map((winner) => {
          const amount = took(winner.id);
          return amount
            ? `${winner.displayName} took ${formatAmount(amount)}`
            : winner.displayName;
        })
        .join(' · ')
    : undefined;

  return (
    <HubShell
      eyebrow="Between hands"
      title={winners.length ? 'Pot settled' : 'Ready to deal'}
      description={payoutLine ?? 'The table is between hands.'}
      facts={[
        { label: 'Seated', value: `${claimedCount}/${seatCount}` },
        {
          label: 'Blinds',
          value: `${stakes.blinds.small}/${stakes.blinds.big}`,
        },
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
            onClick={actions.startHand}
          >
            Deal the next hand
          </Button>
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
