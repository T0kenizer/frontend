'use client';

import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableActions } from '@components/game/table/table-actions';
import type {
  TableEvent,
  TableView,
} from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import { formatAmount } from '@lib/amount';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
  view: TableView;
  actions: TableActions;
}

export const HubWatch: React.FC<HubWatchProps> = ({ view, actions }) => {
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
        {
          label: 'Your stack',
          value: formatAmount(mySeat?.balance ?? 0),
        },
      ]}
      footnote="You will be prompted here when it is your turn."
    >
      <ThinkingPulse name={waitingOn} />

      <EventFeed events={recentEvents} />

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

/** Three dots that say the table is alive and it is not your move. */
const ThinkingPulse: React.FC<{ name: string }> = ({ name }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="flex items-center justify-center gap-1.5 py-1"
      aria-label={`Waiting for ${name}`}
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          aria-hidden
          className="bg-warning block size-1.5 rounded-full"
          animate={
            reduceMotion ? { opacity: 0.6 } : { opacity: [0.25, 1, 0.25] }
          }
          transition={{
            duration: 1.3,
            repeat: Infinity,
            delay: dot * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * What just happened, newest first.
 *
 * Capped and scrolled rather than growing: the panel sits inside an oval whose
 * seats are positioned around it, so a list that grows without bound pushes the
 * chairs off the felt.
 */
const EventFeed: React.FC<{ events: TableEvent[] }> = ({ events }) => {
  const reduceMotion = useReducedMotion();

  if (!events.length) {
    return (
      <p className="text-on-media-muted-foreground mt-3 text-xs">
        The round has just opened. No moves yet.
      </p>
    );
  }

  return (
    <ul className="border-on-media-hairline mt-3 max-h-38 space-y-1 overflow-y-auto border-t pt-3 text-left">
      <AnimatePresence initial={false}>
        {events.map((event, index) => (
          <motion.li
            key={event.id}
            layout={!reduceMotion}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
            animate={{ opacity: index === 0 ? 1 : 0.62, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="flex items-baseline gap-2 text-xs"
          >
            <span className="min-w-0 flex-1 truncate font-semibold">
              {event.actor}
            </span>
            <span className="text-on-media-muted-foreground shrink-0">
              {event.label}
            </span>
            {event.amount !== undefined && (
              <span className="text-warning shrink-0 font-extrabold tabular-nums">
                {formatAmount(event.amount)}
              </span>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};
