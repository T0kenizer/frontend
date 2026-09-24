'use client';

import { FeltEyebrow } from '@components/game/felt/felt-stage';
import { cn } from '@lib/utils';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react';
import { useId } from 'react';

export interface TurnPlayer {
  /** Stable seat identity lets the next player move into the current slot. */
  id: string;
  name: string;
  note?: string;
}

interface TurnOrderProps {
  current: TurnPlayer;
  next: TurnPlayer;
  currentLabel: string;
}

/** The shared turn handoff for poker and free-play tables. */
export const TurnOrder: React.FC<TurnOrderProps> = ({
  current,
  next,
  currentLabel,
}) => {
  const groupId = useId();
  const reduceMotion = useReducedMotion();
  const players = [
    { ...current, slot: 'current', label: currentLabel },
    { ...next, slot: 'next', label: 'Next' },
  ] as const;

  return (
    <LayoutGroup id={groupId}>
      <div className="relative mt-4 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-4">
        <AnimatePresence initial={false} mode="popLayout">
          {players.map((player) => {
            const isCurrent = player.slot === 'current';
            const Heading = isCurrent ? 'h2' : 'h3';

            return (
              <motion.div
                key={player.id}
                layout={reduceMotion ? false : 'position'}
                data-turn={player.slot}
                initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.18,
                  layout: {
                    duration: reduceMotion ? 0 : 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
                className={cn(
                  'row-start-1 min-w-0 transition-colors duration-300 motion-reduce:transition-none',
                  isCurrent
                    ? 'text-success col-start-1'
                    : 'text-on-media-muted-foreground col-start-2',
                )}
              >
                <FeltEyebrow size="xs" className="text-inherit">
                  {player.label}
                </FeltEyebrow>
                <Heading className="font-heading mt-1 text-xl leading-tight font-extrabold tracking-[-0.03em] wrap-anywhere">
                  {player.name}
                </Heading>
                {player.note && (
                  <p className="text-on-media-muted-foreground mt-1 text-xs">
                    {player.note}
                  </p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
};
