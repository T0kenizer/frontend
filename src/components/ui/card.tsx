import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@lib/utils';

export const cardVariants = cva(
  'group/card relative flex flex-col rounded-xl text-card-foreground transition-[color,background-color,border-color,box-shadow,transform] motion-reduce:transition-none',
  {
    variants: {
      variant: {
        /** Default panel: the surface most content sits on. */
        default: 'border border-border bg-card',
        /**
         * Nested panel — one step up the elevation scale, for cards inside
         * cards.
         */
        muted: 'border border-border bg-surface-2',
        /** Recessed well, for inputs and read-only blocks inside a panel. */
        sunk: 'border border-border bg-surface-sunk',
        /** Borderless block that leans on shadow alone. */
        elevated: 'border border-transparent bg-card shadow-md',
        /**
         * Brand-tinted diagonal wash with a coral bloom in the corner. Reserved
         * for showcase and marketing blocks — not for dense UI.
         */
        gradient:
          'overflow-hidden border border-primary-soft bg-linear-160 from-primary-tint via-card via-50% to-accent-tint before:pointer-events-none before:absolute before:-top-2/5 before:right-[-10%] before:size-80 before:rounded-full before:bg-[radial-gradient(circle,var(--primary-soft)_0%,transparent_70%)]',
        /** Full-bleed brand gradient. Carries its own foreground. */
        brand:
          'overflow-hidden border-transparent bg-linear-120 from-primary to-chip-500 text-primary-foreground shadow-lg before:pointer-events-none before:absolute before:-top-15 before:-right-15 before:size-55 before:rounded-full before:bg-[radial-gradient(circle,var(--on-media-hairline)_0%,transparent_70%)]',
        /**
         * Translucent panel for use over imagery or the felt table. Without
         * `backdrop-filter` the film would read as a flat grey veil, so the
         * card falls back to an opaque panel — border included, or the white
         * hairline would vanish against it.
         */
        glass:
          'border-on-media-hairline bg-on-media-film border backdrop-blur-md backdrop-saturate-150 not-supports-backdrop-filter:border-border not-supports-backdrop-filter:bg-card',
        /** Table-view panel: sits on the felt, reads at TV distance. */
        felt: 'border-on-media-hairline bg-on-media-scrim text-white-95 border backdrop-blur-sm **:data-[slot=card-description]:text-on-media-muted-foreground',
        /** Poker-chip rim. Pair with `rim` to pick the denomination color. */
        chip: 'chip-rim bg-card',
      },
      /**
       * Chip denomination driving the `chip` variant's rim color. Ignored by
       * every other variant.
       */
      rim: {
        1: '[--chip-rim:var(--color-chip-1)] [--chip-rim-stripe:var(--chip-stripe-dark)]',
        5: '[--chip-rim:var(--color-chip-5)]',
        10: '[--chip-rim:var(--color-chip-10)]',
        25: '[--chip-rim:var(--color-chip-25)]',
        50: '[--chip-rim:var(--color-chip-50)] [--chip-rim-stripe:var(--chip-stripe-dark)]',
        100: '[--chip-rim:var(--color-chip-100)]',
        500: '[--chip-rim:var(--color-chip-500)]',
        '1k': '[--chip-rim:var(--color-chip-1k)] [--chip-rim-stripe:var(--chip-stripe-dark)]',
        felt: '[--chip-rim:var(--color-felt)]',
      },
      size: {
        default: 'gap-4 py-4 text-sm',
        sm: 'gap-3 py-3 text-sm',
        lg: 'gap-6 rounded-2xl py-6 text-[0.9375rem]',
      },
      /** Lifts the card on hover. Use for cards that are links or buttons. */
      interactive: {
        true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:transform-none',
        false: '',
      },
    },
    compoundVariants: [
      /* The rim ring is painted outside the border box — clipping would eat it. */
      { variant: 'chip', class: 'overflow-visible' },
      /* On a dark wash the muted footer tint and borders must read as light. */
      {
        variant: ['brand', 'felt', 'glass'],
        class:
          '**:data-[slot=card-footer]:border-on-media-hairline **:data-[slot=card-footer]:bg-on-media-scrim-soft',
      },
      /* ...but an opaque `glass` fallback is a light panel — undo the wash. */
      {
        variant: 'glass',
        class:
          'supports-[not(backdrop-filter:blur(0))]:**:data-[slot=card-footer]:border-border supports-[not(backdrop-filter:blur(0))]:**:data-[slot=card-footer]:bg-surface-2',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
    },
  },
);

export interface CardProps
  extends
    React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof cardVariants> {}

export const Card: React.FC<CardProps> = ({
  className,
  variant,
  size,
  rim,
  interactive,
  ...props
}) => (
  <div
    data-slot="card"
    data-variant={variant ?? 'default'}
    data-size={size ?? 'default'}
    className={cn(
      cardVariants({ variant, size, rim, interactive }),
      /* Media bleeding to the card edges loses its padding and keeps the radius. */
      'has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-[inherit] *:[img:last-child]:rounded-b-[inherit]',
      className,
    )}
    {...props}
  />
);

export const CardHeader: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => (
  <div
    data-slot="card-header"
    className={cn(
      'group/card-header @container/card-header relative grid auto-rows-min items-start gap-1 px-4 group-data-[size=lg]/card:px-6 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
      className,
    )}
    {...props}
  />
);

export const CardTitle: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => (
  <div
    data-slot="card-title"
    className={cn(
      'font-heading text-base leading-snug font-semibold tracking-tight group-data-[size=lg]/card:text-xl group-data-[size=sm]/card:text-sm',
      className,
    )}
    {...props}
  />
);

export const CardDescription: React.FC<
  React.ComponentPropsWithoutRef<'div'>
> = ({ className, ...props }) => (
  <div
    data-slot="card-description"
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
);

export const CardAction: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => (
  <div
    data-slot="card-action"
    className={cn(
      'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
      className,
    )}
    {...props}
  />
);

export const CardContent: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => (
  <div
    data-slot="card-content"
    className={cn(
      'relative px-4 group-data-[size=lg]/card:px-6 group-data-[size=sm]/card:px-3',
      className,
    )}
    {...props}
  />
);

export const CardFooter: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => (
  <div
    data-slot="card-footer"
    className={cn(
      'bg-surface-2 relative flex items-center gap-2 rounded-b-[inherit] border-t p-4 group-data-[size=lg]/card:p-6 group-data-[size=sm]/card:p-3',
      className,
    )}
    {...props}
  />
);
