'use client';

import { HubShell, HubStack } from '@components/game/table/hub/hub-shell';
import type {
  SeatView,
  TableEnding,
  TableView,
} from '@components/game/table/use-table-view';
import { Button } from '@components/ui/button';
import ROUTES from '@constants/routes';
import { useHomeRoute } from '@hooks/use-home-route';
import { formatAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { GameMode } from '@tokenizer/shared/types';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useMemo } from 'react';

export interface HubFinishedProps {
  view: TableView;
}

export const ENDING_COPY: Record<
  TableEnding,
  { eyebrow: string; line: string }
> = {
  'ended-by-host': {
    eyebrow: 'Game over',
    line: 'The host called time on the table.',
  },
  abandoned: {
    eyebrow: 'Table closed',
    line: 'Everyone had left, so the table closed itself.',
  },
};

export const standingsOf = (seats: SeatView[]): SeatView[] =>
  seats
    .filter((entry) => entry.seat.claimed)
    .sort((a, b) => b.seat.balance - a.seat.balance);

export const Standings: React.FC<{ standings: SeatView[] }> = ({
  standings,
}) => {
  const reduceMotion = useReducedMotion();

  if (!standings.length) return null;

  return (
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
  );
};

export const HubFinished: React.FC<HubFinishedProps> = ({ view }) => {
  const homeRoute = useHomeRoute();

  const standings = useMemo(() => standingsOf(view.seats), [view.seats]);

  const leader = standings[0];
  const ending = ENDING_COPY[view.ending ?? 'ended-by-host'];

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
      <Standings standings={standings} />

      <HubStack className="mt-4">
        <Button variant="felt-inverse" size="xl" className="w-full" asChild>
          <Link href={ROUTES.game.new()}>Start another table</Link>
        </Button>
        <Button variant="line" className="w-full" asChild>
          <Link href={homeRoute}>Back home</Link>
        </Button>
      </HubStack>
    </HubShell>
  );
};

const dealLabel = (view: TableView): string => {
  const noun = view.mode === GameMode.Poker ? 'Hand' : 'Round';
  return view.dealsPlayed === 1 ? noun : `${noun}s`;
};
