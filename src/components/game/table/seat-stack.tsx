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

export interface SeatStackProps {
  amount: number;
  chipModel: ChipModel;
  muted?: boolean;
  size?: StackSize;
  reduceMotion?: boolean;
  className?: string;
}

type StackSize = 'sm' | 'default' | 'lg';

/** Matches the puck the stack sits under — see `SeatPuck`. */
const STACK_METRICS: Record<
  StackSize,
  { gap: string; chip: string; box: string; text: string }
> = {
  sm: {
    gap: 'mt-1',
    chip: 'size-[1.15rem]',
    box: 'h-4 min-w-8',
    text: 'px-1.5 py-0.5 text-[0.625rem]',
  },
  default: {
    gap: 'mt-1',
    chip: 'size-[1.35rem]',
    box: 'h-4 min-w-8',
    text: 'px-1.5 py-0.5 text-[0.625rem]',
  },
  lg: {
    gap: 'mt-1.5',
    chip: 'size-[1.7rem]',
    box: 'h-5 min-w-10',
    text: 'px-2 py-0.5 text-[0.8125rem]',
  },
};

const DENOMINATION_VALUES = CHIP_DENOMINATIONS.map((denomination) =>
  denomination === '1k' ? 1000 : denomination,
);

const MAX_CHIPS = 3;

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
  const metrics = STACK_METRICS[size];

  return (
    <span
      data-slot="seat-stack"
      className={cn(
        'flex items-center justify-center gap-1',
        metrics.gap,
        muted && 'opacity-55',
        className,
      )}
    >
      {chips.length > 0 && (
        <span aria-hidden className="flex shrink-0 -space-x-1.5">
          {chips.map((denomination, index) => (
            <Chip
              key={`${denomination}-${index}`}
              denomination={denomination}
              alt=""
              className={cn(
                // Follows the art's alpha, so the chip reads against the felt
                // without a box around a round image.
                'drop-shadow-[0_1px_3px_oklch(0_0_0/.5)]',
                metrics.chip,
              )}
            />
          ))}
        </span>
      )}

      <AmountPill
        amount={amount}
        reduceMotion={reduceMotion}
        solid={!isDenominated}
        boxClassName={metrics.box}
        textClassName={metrics.text}
      />
    </span>
  );
};

const AmountPill: React.FC<{
  amount: number;
  reduceMotion: boolean;
  solid: boolean;
  boxClassName: string;
  textClassName: string;
}> = ({ amount, reduceMotion, solid, boxClassName, textClassName }) => (
  <span className={cn('relative block overflow-hidden', boxClassName)}>
    <span
      aria-hidden
      className={cn(
        'invisible block leading-none font-extrabold tabular-nums',
        textClassName,
      )}
    >
      {formatAmount(amount)}
    </span>

    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={amount}
        className={cn(
          'text-on-media-foreground absolute inset-x-0 top-0 mx-auto w-fit rounded-full leading-none font-extrabold tabular-nums',
          textClassName,
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
