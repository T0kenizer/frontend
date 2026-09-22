'use client';

import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type { TableView } from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { formatAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import * as React from 'react';

/**
 * The table is over.
 *
 * What people want here is one thing — who won — and then, a moment later, the
 * full column so they can argue about it. So the standings are the panel: the
 * leader stated at the top, everyone else underneath in the order the chips
 * ended up, counted off one row at a time rather than appearing as a block.
 */

export interface HubFinishedProps {
  view: TableView;
}

export const HubFinished: React.FC<HubFinishedProps> = ({ view }) => {
  const reduceMotion = useReducedMotion();

  const standings = React.useMemo(
    () =>
      view.seats
        .filter((entry) => entry.seat.claimed)
        .sort((a, b) => b.seat.balance - a.seat.balance),
    [view.seats],
  );

  const leader = standings[0];

  return (
    <HubShell
      eyebrow="Game over"
      title={leader ? `${leader.seat.displayName} wins` : 'Game over'}
      description={
        leader
          ? `Finished on ${formatAmount(leader.seat.balance)} chips.`
          : 'The host closed the table.'
      }
      facts={[
        { label: 'Players', value: `${standings.length}` },
        { label: 'Chips', value: formatAmount(view.inPlay) },
      ]}
    >
      <ol className="max-h-45 space-y-1 overflow-y-auto text-left">
        {standings.map((entry, index) => (
          <motion.li
            key={entry.seat.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduceMotion ? 0 : 0.2 + index * 0.08,
              type: 'spring',
              stiffness: 380,
              damping: 30,
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs',
              index === 0
                ? 'bg-warning-soft border-warning/35 border'
                : 'bg-on-media-scrim',
              entry.isMine && index !== 0 && 'border-on-media-border border',
            )}
          >
            <span className="text-on-media-muted-foreground w-4 shrink-0 text-center font-bold tabular-nums">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold">
              {entry.seat.displayName}
              {entry.isMine && (
                <span className="text-on-media-muted-foreground font-medium">
                  {' '}
                  · you
                </span>
              )}
            </span>
            <span className="shrink-0 font-extrabold tabular-nums">
              {formatAmount(entry.seat.balance)}
            </span>
          </motion.li>
        ))}
      </ol>

      <HubStack className="mt-4">
        <Button variant="felt-inverse" size="xl" className="w-full" asChild>
          <Link href={ROUTES.game.new()}>Start another table</Link>
        </Button>
        <Button variant="line" className="w-full" asChild>
          <Link href={ROUTES.home()}>Back home</Link>
        </Button>
      </HubStack>
    </HubShell>
  );
};
