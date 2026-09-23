'use client';

import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type {
  TableEnding,
  TableView,
} from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { formatAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { GameMode } from '@tokenizer/shared/types';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useMemo } from 'react';

/**
 * The table is over, and this is where everybody lands.
 *
 * Not a page of its own: the moment the host calls time, every client swaps
 * this in where the game was, on the same screen, with the same chairs still
 * drawn around it. A table that ends by throwing its players out to a route
 * they have to be redirected to is a table that ends by losing them — and the
 * one thing a night of poker owes its players at the end is the final column.
 *
 * What people want here is one thing — who won — and then, a moment later, the
 * full standings so they can argue about it. So the leader is the title, the
 * column is the panel, and the two facts that put it in context (how it ended,
 * how long it ran) sit between them.
 */

export interface HubFinishedProps {
  view: TableView;
}

/** How the night stopped, in the words the table would use about it. */
const ENDING_COPY: Record<TableEnding, { eyebrow: string; line: string }> = {
  'ended-by-host': {
    eyebrow: 'Game over',
    line: 'The host called time on the table.',
  },
  abandoned: {
    eyebrow: 'Table closed',
    line: 'Everyone had left, so the table closed itself.',
  },
};

export const HubFinished: React.FC<HubFinishedProps> = ({ view }) => {
  const reduceMotion = useReducedMotion();

  const standings = useMemo(
    () =>
      view.seats
        .filter((entry) => entry.seat.claimed)
        .sort((a, b) => b.seat.balance - a.seat.balance),
    [view.seats],
  );

  const leader = standings[0];
  const ending = ENDING_COPY[view.ending ?? 'ended-by-host'];

  // A table nobody ever sat down at has no winner to name and no column to
  // draw, so it says what happened instead of pretending to a result.
  const title = leader
    ? `${leader.seat.displayName} wins`
    : `No ${dealLabel(view).toLowerCase()} played`;

  return (
    <HubShell
      eyebrow={ending.eyebrow}
      title={title}
      description={
        leader
          ? `${ending.line} Finished on ${formatAmount(leader.seat.balance)} chips.`
          : ending.line
      }
      facts={[
        { label: 'Players', value: `${standings.length}` },
        { label: dealLabel(view), value: `${view.dealsPlayed}` },
        { label: 'Chips', value: formatAmount(view.inPlay) },
      ]}
      footnote="The table is closed — the code and the link no longer work."
    >
      {standings.length > 0 && (
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
      )}

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

/** What this table counted its deals in — hands at poker, rounds at a free one. */
const dealLabel = (view: TableView): string => {
  const noun = view.mode === GameMode.Poker ? 'Hand' : 'Round';
  return view.dealsPlayed === 1 ? noun : `${noun}s`;
};
