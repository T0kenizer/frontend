import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@lib/utils';

/**
 * The denominations a chip can be minted in, in ascending order. They mirror
 * the `--chip-*` rim tokens, so a chip and a chip-rimmed card of the same value
 * always read as the same colour.
 */
export const CHIP_DENOMINATIONS = [1, 5, 10, 25, 50, 100, 500, '1k'] as const;

export type ChipDenomination = (typeof CHIP_DENOMINATIONS)[number];

export const chipVariants = cva(
  'chip-disc font-heading leading-none font-extrabold tracking-[-0.04em] tabular-nums select-none',
  {
    variants: {
      /**
       * Face colour, and — for the pale faces — a dark edge spot and dark
       * value, which are the only two that would otherwise lose their
       * contrast.
       */
      denomination: {
        1: '[--chip-face:var(--color-chip-1)] [--chip-ink:var(--chip-stripe-dark)] [--chip-stripe:var(--chip-stripe-dark)]',
        5: '[--chip-face:var(--color-chip-5)]',
        10: '[--chip-face:var(--color-chip-10)]',
        25: '[--chip-face:var(--color-chip-25)]',
        50: '[--chip-face:var(--color-chip-50)] [--chip-ink:var(--chip-stripe-dark)] [--chip-stripe:var(--chip-stripe-dark)]',
        100: '[--chip-face:var(--color-chip-100)]',
        500: '[--chip-face:var(--color-chip-500)]',
        '1k': '[--chip-face:var(--color-chip-1k)] [--chip-ink:var(--chip-stripe-dark)] [--chip-stripe:var(--chip-stripe-dark)]',
      },
      size: {
        sm: '[--chip-size:1.75rem] text-[0.5rem]',
        default: '[--chip-size:2.5rem] text-[0.675rem]',
        lg: '[--chip-size:2.75rem] text-[0.75rem]',
      },
    },
    defaultVariants: {
      denomination: 5,
      size: 'default',
    },
  },
);

export interface ChipProps
  extends
    Omit<React.ComponentPropsWithoutRef<'span'>, 'children'>,
    VariantProps<typeof chipVariants> {}

/**
 * A poker chip seen face-on, painted in CSS from the denomination tokens.
 *
 * The value is rendered as text rather than baked into the face, so a chip is
 * readable by a screen reader and searchable like any other number on screen.
 */
export const Chip: React.FC<ChipProps> = ({
  className,
  denomination = 5,
  size,
  ...props
}) => (
  <span
    data-slot="chip"
    data-denomination={denomination}
    className={cn(chipVariants({ denomination, size }), className)}
    {...props}
  >
    <span className="relative">{String(denomination).toUpperCase()}</span>
  </span>
);
