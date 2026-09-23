'use client';

import type { TableEvent } from '@components/game/table/use-table-view';
import { formatAmount } from '@lib/amount';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import * as React from 'react';

/**
 * The two pieces the "somebody else is deciding" panel is made of, shared by
 * both games.
 *
 * They are here rather than inside one of the panels because a poker hand and a
 * free round differ in everything the panel _says_ — the eyebrow, the empty
 * line, whether there is a street at all — and in nothing about how it reads. A
 * second copy of the feed would have drifted from the first the day one of them
 * grew a timestamp.
 */

/** Three dots that say the table is alive and it is not your move. */
export const ThinkingPulse: React.FC<{ name: string }> = ({ name }) => {
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

export interface EventFeedProps {
  events: TableEvent[];
  /** What to say before anybody has moved; the two games word it differently. */
  emptyLabel: string;
}

/**
 * What just happened, newest first.
 *
 * Capped and scrolled rather than growing: the panel sits inside an oval whose
 * seats are positioned around it, so a list that grows without bound pushes the
 * chairs off the felt.
 */
export const EventFeed: React.FC<EventFeedProps> = ({ events, emptyLabel }) => {
  const reduceMotion = useReducedMotion();

  if (!events.length) {
    return (
      <p className="text-on-media-muted-foreground mt-3 text-xs">
        {emptyLabel}
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
              {event.actor ?? '—'}
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
