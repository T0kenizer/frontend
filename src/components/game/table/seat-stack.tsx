'use client';

import {
  CHIP_DENOMINATIONS,
  Chip,
  type ChipDenomination,
} from '@components/ui/chip';
import { formatAmount } from '@lib/amount';
import { cn } from '@lib/utils';
import { ChipModel } from '@tokenizer/shared/types';
import { AnimatePresence, motion } from 'motion/react';
import * as React from 'react';

/**
 * What a seat is holding.
 *
 * Shown on every chair, claimed or not — an unclaimed seat is played by the
 * host and its stack is as much in the game as anyone's, so hiding it left the
 * table unable to answer the one question people actually ask each other.
 *
 * How it is drawn follows the session's chip model, which is why that rides on
 * the snapshot. A table counting an abstract balance gets the number; a table
 * playing in chips gets chips, because on that table "500" is a thing you can
 * see in front of someone rather than a figure in a ledger.
 */

export interface SeatStackProps {
  amount: number;
  chipModel: ChipModel;
  /** Dims the stack for a seat that is out of the hand. */
  muted?: boolean;
  size?: 'default' | 'sm';
  reduceMotion?: boolean;
  className?: string;
}

/** Numeric value of each denomination, `'1k'` included. */
const DENOMINATION_VALUES = CHIP_DENOMINATIONS.map((denomination) =>
  denomination === '1k' ? 1000 : denomination,
);

/** How many chips a puck shows before the number has to carry the rest. */
const MAX_CHIPS = 3;

/**
 * The largest denominations that actually make up an amount, biggest first.
 *
 * Greedy, and capped: a stack of 4,450 is 4×1k + 4×100 + 1×50, which is nine
 * discs and unreadable at this size. Showing the top few distinct denominations
 * says "this is what that pile looks like" while the number beside it stays
 * exact.
 */
export function topDenominations(amount: number): ChipDenomination[] {
  if (amount <= 0) return [];

  const picked: ChipDenomination[] = [];
  let remainder = amount;

  for (let index = DENOMINATION_VALUES.length - 1; index >= 0; index -= 1) {
    if (picked.length >= MAX_CHIPS) break;

    const value = DENOMINATION_VALUES[index];
    if (remainder >= value) {
      picked.push(CHIP_DENOMINATIONS[index]);
      remainder %= value;
    }
  }

  return picked;
}

export const SeatStack: React.FC<SeatStackProps> = ({
  amount,
  chipModel,
  muted = false,
  size = 'default',
  reduceMotion = false,
  className,
}) => {
  const isDenominated = chipModel === ChipModel.Denominated;
  const chips = isDenominated ? topDenominations(amount) : [];

  return (
    <span
      data-slot="seat-stack"
      className={cn(
        'mt-1 flex items-center justify-center gap-1',
        muted && 'opacity-55',
        className,
      )}
    >
      {chips.length > 0 && (
        // Overlapped rather than spaced, because that is how chips sit when
        // they are stacked in front of someone.
        <span aria-hidden className="flex shrink-0 -space-x-1.5">
          {chips.map((denomination, index) => (
            <Chip
              key={`${denomination}-${index}`}
              denomination={denomination}
              size="sm"
              className={cn(
                'ring-felt-deep/70 shadow-[0_1px_3px_oklch(0_0_0/.5)] ring-1',
                size === 'sm' && 'text-[0.45rem] [--chip-size:1.15rem]',
                size === 'default' && 'text-[0.5rem] [--chip-size:1.35rem]',
              )}
            />
          ))}
        </span>
      )}

      <AmountPill
        amount={amount}
        reduceMotion={reduceMotion}
        /* A chipless table has nothing else to look at, so the pill carries
           the weight; beside chips it only has to stay legible. */
        solid={!isDenominated}
      />
    </span>
  );
};

/**
 * The figure itself.
 *
 * Keyed on the amount so a change mounts a new element: that is what lets the
 * chips that just left (or landed) register as movement rather than as a number
 * quietly becoming a different number across a re-render.
 */
const AmountPill: React.FC<{
  amount: number;
  reduceMotion: boolean;
  solid: boolean;
}> = ({ amount, reduceMotion, solid }) => (
  <span className="relative block h-4 min-w-8 overflow-hidden">
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={amount}
        className={cn(
          'text-on-media-foreground absolute inset-x-0 mx-auto w-fit rounded-full px-1.5 py-0.5 text-[0.625rem] leading-none font-extrabold tabular-nums',
          solid && 'bg-on-media-scrim',
        )}
        initial={reduceMotion ? false : { y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { y: -10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      >
        {formatAmount(amount)}
      </motion.span>
    </AnimatePresence>
  </span>
);
