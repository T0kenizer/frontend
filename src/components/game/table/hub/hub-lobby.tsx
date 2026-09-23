'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type { TableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { formatAmount } from '@lib/amount';
import { GameMode } from '@tokenizer/shared/types';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Before the cards come out.
 *
 * Two people are looking at this panel and they want different things from it:
 * the host wants to start, and someone already seated wants to know what they
 * are waiting for. Branching inside one panel rather than across two keeps the
 * shared facts — seats taken, chips on the table — stated once and
 * identically.
 *
 * Nobody is looking at it without a seat. Arriving at the table is something
 * the join flow does; this screen is only ever read by people already in the
 * game.
 */

export interface HubLobbyProps {
  view: TableView;
  actions: TableActions;
  tableName: string;
}

export const HubLobby: React.FC<HubLobbyProps> = ({
  view,
  actions,
  tableName,
}) => {
  const { claimedCount, seatCount, isHost, inPlay } = view;
  const emptySeats = seatCount - claimedCount;

  // The lobby is the same screen at both tables; only the word for a deal, and
  // the call that opens one, belong to the game.
  const isPoker = view.mode === GameMode.Poker;
  const dealLabel = isPoker ? 'Deal the first hand' : 'Open the first round';
  const startDeal = isPoker ? actions.startHand : actions.startRound;

  const facts = [
    { label: 'Seated', value: `${claimedCount}/${seatCount}` },
    { label: 'Empty', value: `${emptySeats}` },
    { label: 'In play', value: formatAmount(inPlay) },
  ];

  if (isHost) {
    return (
      <HubShell
        eyebrow="Lobby · not started"
        title={tableName}
        description="Start whenever you like — the empty chairs are yours to play until somebody claims them."
        facts={facts}
        footnote={
          emptySeats > 0
            ? `${emptySeats} ${emptySeats > 1 ? 'chairs are' : 'chair is'} empty. You will play ${emptySeats > 1 ? 'them' : 'it'} when the turn comes round.`
            : view.canAddSeat
              ? 'Every chair is taken. Add one if somebody else turns up.'
              : 'Every chair is taken.'
        }
      >
        {actions.error && (
          <FeltNotice tone="error" className="mb-3 text-left">
            {actions.error}
          </FeltNotice>
        )}

        <HubStack>
          {/* Never gated on how many chairs are taken. Every declared seat is
              dealt in whether or not anybody claimed it, so a host sitting
              alone at a table of six is dealing a six-handed hand — they
              simply play five of them. Waiting for a quorum that the rules do
              not have was the button telling the host their own table was not
              ready. */}
          <Button
            variant="felt-inverse"
            size="xl"
            className="w-full"
            loading={actions.pending === 'start'}
            onClick={startDeal}
          >
            {dealLabel}
          </Button>
          <Button
            variant="line"
            className="w-full"
            onClick={actions.shareTable}
          >
            Invite · share the code
          </Button>
        </HubStack>
      </HubShell>
    );
  }

  return (
    <HubShell
      eyebrow="Lobby · not started"
      title="You're seated"
      description={`Seat ${(view.mySeat?.seatIndex ?? 0) + 1} is yours. ${
        isPoker
          ? 'The host deals the first hand.'
          : 'The host opens the first round.'
      }`}
      facts={facts}
    >
      <WaitingDial label="Waiting for the host" />

      <HubStack className="mt-4">
        <Button variant="line" className="w-full" onClick={actions.renameSeat}>
          Change your name
        </Button>
      </HubStack>
    </HubShell>
  );
};

/**
 * The spinner that says the wait is the app working, not the app stuck.
 *
 * A ring rather than a bar: it has no end, and neither does waiting for someone
 * else to press a button.
 */
export const WaitingDial: React.FC<{ label: React.ReactNode }> = ({
  label,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-2.5 py-1">
      <motion.span
        aria-hidden
        className="border-on-media-film border-t-warning block size-10 rounded-full border-2"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
      />
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
};
