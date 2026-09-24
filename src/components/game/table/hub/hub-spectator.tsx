'use client';

import { EventFeed, ThinkingPulse } from '@components/game/table/hub/hub-feed';
import {
  ENDING_COPY,
  Standings,
  standingsOf,
} from '@components/game/table/hub/hub-finished';
import { HubShell } from '@components/game/table/hub/hub-shell';
import type { TableView } from '@components/game/table/use-table-view';
import { formatAmount } from '@lib/amount';
import { GameMode } from '@tokenizer/shared/types';

export interface HubSpectatorProps {
  view: TableView;
  tableName: string;
}

export const HubSpectator: React.FC<HubSpectatorProps> = ({
  view,
  tableName,
}) => {
  const isPoker = view.mode === GameMode.Poker;
  const { claimedCount, seatCount, pot, inPlay, dealsPlayed, winners } = view;

  const seated = { label: 'Seated', value: `${claimedCount}/${seatCount}` };
  const chips = { label: 'In play', value: formatAmount(inPlay) };
  const deals = {
    label: isPoker ? 'Hands' : 'Rounds',
    value: `${dealsPlayed}`,
  };
  const emptySeats = seatCount - claimedCount;

  const standings = standingsOf(view.seats);

  const tookFromPot = (participantId: string): Optional<number> =>
    view.mode === GameMode.Poker
      ? view.payouts.find((payout) => payout.participantId === participantId)
          ?.amount
      : undefined;

  switch (view.phase) {
    case 'lobby':
      return (
        <HubShell
          eyebrow="Waiting to start"
          title={tableName}
          description={
            isPoker
              ? 'The host deals the first hand once everybody is in.'
              : 'The host opens the first round once everybody is in.'
          }
          facts={[seated, chips]}
          footnote={
            emptySeats > 0
              ? `${emptySeats} ${emptySeats > 1 ? 'chairs are' : 'chair is'} still free. Scan the code to take one.`
              : 'Every chair is taken.'
          }
        />
      );

    case 'betting': {
      const active = view.activeSeat;
      const waitingOn = !active
        ? 'the table'
        : active.claimed
          ? active.displayName
          : `${active.displayName} · the host`;

      return (
        <HubShell
          eyebrow={
            (isPoker ? view.streetLabel : null) ??
            (isPoker ? 'In progress' : 'Round in progress')
          }
          title={`${waitingOn} to act`}
          facts={[{ label: 'Pot', value: formatAmount(pot) }, seated, deals]}
        >
          <ThinkingPulse name={waitingOn} />

          <EventFeed
            events={view.recentEvents}
            emptyLabel={
              isPoker
                ? 'The hand has just been dealt. No moves yet.'
                : 'The round has just opened. No moves yet.'
            }
          />
        </HubShell>
      );
    }

    case 'showdown':
      return (
        <HubShell
          eyebrow="Showdown"
          title="Deciding the pot"
          description="The host is calling the winner."
          facts={[
            { label: 'Pot', value: formatAmount(pot) },
            { label: 'In hand', value: `${view.contenders.length}` },
          ]}
        >
          <EventFeed
            events={view.recentEvents}
            emptyLabel="Nothing to show yet."
          />
        </HubShell>
      );

    case 'intermission': {
      const waitingLine = isPoker
        ? 'The host deals when the table is ready.'
        : 'The host opens the next round when the table is ready.';

      const soleWinner = winners.length === 1 ? winners[0] : null;
      const soleAmount = soleWinner ? tookFromPot(soleWinner.id) : undefined;

      const splitLine =
        winners.length > 1
          ? winners
              .map((winner) => {
                const amount = tookFromPot(winner.id);
                return amount
                  ? `${winner.displayName} took ${formatAmount(amount)}`
                  : winner.displayName;
              })
              .join(' · ')
          : null;

      return (
        <HubShell
          eyebrow={isPoker ? 'Between hands' : 'Between rounds'}
          title={
            soleWinner
              ? soleAmount
                ? `${soleWinner.displayName} takes ${formatAmount(soleAmount)}`
                : `${soleWinner.displayName} takes the pot`
              : winners.length > 1
                ? `${winners.map((seat) => seat.displayName).join(' & ')} split the pot`
                : isPoker
                  ? 'Waiting on the next deal'
                  : 'Waiting on the next round'
          }
          description={splitLine ?? waitingLine}
          facts={[deals, chips, seated]}
        >
          <EventFeed
            events={view.recentEvents}
            emptyLabel="Nothing has happened yet."
          />
        </HubShell>
      );
    }

    case 'finished': {
      const leader = standings[0];
      const ending = ENDING_COPY[view.ending ?? 'ended-by-host'];

      return (
        <HubShell
          eyebrow={ending.eyebrow}
          title={
            leader
              ? `${leader.seat.displayName} wins`
              : `No ${isPoker ? 'hands' : 'rounds'} played`
          }
          description={
            leader
              ? `${ending.line} Finished on ${formatAmount(leader.seat.balance)} chips.`
              : ending.line
          }
          facts={[
            { label: 'Players', value: `${standings.length}` },
            deals,
            chips,
          ]}
          footnote="The table is closed — the code and the link no longer work."
        >
          <Standings standings={standings} />
        </HubShell>
      );
    }
  }
};
