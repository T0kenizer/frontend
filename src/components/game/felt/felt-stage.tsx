import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowLeft, CircleAlert, Info } from 'lucide-react';
import * as React from 'react';

/**
 * The kit every `/game` screen is built from.
 *
 * All three of them — creating a table, joining one, sitting at one — share a
 * backdrop that has no theme, so they cannot reach for `--foreground`, `--card`
 * or `--muted` the way a hub page does. Before this module each of them
 * answered that on its own, which is how the same eyebrow ended up in six sizes
 * and the live table ended up painted in hub tokens over the baize. What is
 * here is the answer once: the shell, the panel floated on it, the way a screen
 * names itself, the way it gets out, and the way it says something is wrong.
 *
 * Nothing in here knows about a game. The pieces that do — a seat, a draft
 * setting — sit beside it and lean on this.
 */

export const feltStageVariants = cva('mx-auto w-full', {
  variants: {
    variant: {
      /**
       * A form on the felt. Scrolls with the page, because it is taller than a
       * viewport by design and trapping it in one would hide the submit.
       */
      form: 'min-h-full max-w-7xl space-y-6 p-6 sm:p-8',
      /**
       * One decision, centred. The width is deliberately narrow: these screens
       * are read on a phone, in a room, with someone waiting.
       */
      focus: 'flex min-h-full max-w-xl flex-1 flex-col px-4 pt-6 pb-11',
      /**
       * The live table. Fills what it is given and never grows past it — the
       * felt is the one screen you must never scroll to see the rest of.
       */
      table: 'flex min-h-0 max-w-6xl flex-1 flex-col gap-4 p-4 sm:p-6',
    },
  },
  defaultVariants: {
    variant: 'form',
  },
});

export type FeltStageProps = React.ComponentProps<'div'> &
  VariantProps<typeof feltStageVariants>;

export const FeltStage: React.FC<FeltStageProps> = ({
  className,
  variant,
  ...props
}) => (
  <div
    data-slot="felt-stage"
    data-variant={variant}
    className={cn(feltStageVariants({ variant }), className)}
    {...props}
  />
);

export const feltPanelVariants = cva('felt-panel', {
  variants: {
    size: {
      sm: 'rounded-2xl px-4 py-4',
      default: 'rounded-3xl px-6 py-7',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export type FeltPanelProps = Omit<React.ComponentProps<'section'>, 'size'> &
  VariantProps<typeof feltPanelVariants>;

/** A panel floated on the felt — glass, never a themed card. */
export const FeltPanel: React.FC<FeltPanelProps> = ({
  className,
  size,
  ...props
}) => (
  <section
    data-slot="felt-panel"
    className={cn(feltPanelVariants({ size }), className)}
    {...props}
  />
);

export const feltEyebrowVariants = cva(
  'text-on-media-muted-foreground block font-bold uppercase',
  {
    variants: {
      size: {
        /** Above a value in a stat, or on a badge. */
        xs: 'text-[0.625rem] tracking-[0.09em]',
        /** Above the title of a screen or a panel. */
        default: 'text-[0.65rem] tracking-[0.14em]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export type FeltEyebrowProps = Omit<React.ComponentProps<'p'>, 'size'> &
  VariantProps<typeof feltEyebrowVariants>;

/**
 * The small uppercase line that says what kind of thing follows.
 *
 * Two sizes and no more. Every one of these was a hand-tuned `text-[…]` with
 * its own tracking before, and eight of them next to each other read as eight
 * different kinds of label rather than one.
 */
export const FeltEyebrow: React.FC<FeltEyebrowProps> = ({
  className,
  size,
  ...props
}) => (
  <p
    data-slot="felt-eyebrow"
    className={cn(feltEyebrowVariants({ size }), className)}
    {...props}
  />
);

export const feltTitleVariants = cva(
  'font-heading leading-tight font-extrabold text-balance',
  {
    variants: {
      size: {
        /** A panel, or a screen read on a phone. */
        default: 'text-[1.625rem] tracking-[-0.04em]',
        /** The page that is a page: creating a table. */
        lg: 'text-3xl tracking-[-0.04em]',
        /** Inside a panel, over a value. */
        sm: 'text-xl tracking-[-0.03em]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export type FeltHeaderProps = Omit<
  React.ComponentProps<'header'>,
  'title' | 'children'
> &
  VariantProps<typeof feltTitleVariants> & {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Sits under the description — a CTA, a count, a badge. */
    children?: React.ReactNode;
  };

/** How a screen or a panel names itself: what kind, what it is, what it does. */
export const FeltHeader: React.FC<FeltHeaderProps> = ({
  eyebrow,
  title,
  description,
  size,
  className,
  children,
  ...props
}) => (
  <header
    data-slot="felt-header"
    className={cn('space-y-2', className)}
    {...props}
  >
    {eyebrow && <FeltEyebrow className="mb-2">{eyebrow}</FeltEyebrow>}
    <h1 className={cn(feltTitleVariants({ size }))}>{title}</h1>
    {description && (
      <p className="text-on-media-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    )}
    {children}
  </header>
);

export type FeltBackLinkProps = React.ComponentProps<'button'> & {
  /** Renders the single child instead — a `next/link`, typically. */
  asChild?: boolean;
};

/**
 * The way out of a screen, back to the one before it.
 *
 * Deliberately one component for both shapes it takes: the join flow steps back
 * through client state and the create page leaves for a route, but to someone
 * looking at it there is one control, so it should not be two that happen to
 * drift apart.
 */
export const FeltBackLink: React.FC<FeltBackLinkProps> = ({
  className,
  children,
  asChild = false,
  ...props
}) => {
  const classes = cn(
    'text-on-media-muted-foreground hover:text-on-media-foreground inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold whitespace-nowrap no-underline transition-colors hover:no-underline',
    className,
  );

  const content = (
    <>
      <ArrowLeft className="size-3.5" />
      {children}
    </>
  );

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;

    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
      children: (
        <>
          <ArrowLeft className="size-3.5" />
          {child.props.children}
        </>
      ),
    });
  }

  return (
    <button type="button" data-slot="felt-back" className={classes} {...props}>
      {content}
    </button>
  );
};

export const feltNoticeVariants = cva(
  'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed',
  {
    variants: {
      tone: {
        /** Something is wrong and the screen cannot go on. */
        error:
          'bg-destructive/15 border-destructive/35 [&>svg]:text-destructive',
        /** Something is worth knowing before going on. */
        warning: 'bg-warning-soft border-warning/35 [&>svg]:text-warning',
        /** Plain context. */
        info: 'bg-on-media-scrim border-on-media-hairline [&>svg]:text-on-media-muted-foreground',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
);

export type FeltNoticeProps = React.ComponentProps<'p'> &
  VariantProps<typeof feltNoticeVariants>;

/** The inline line that says what is wrong, or what is about to be. */
export const FeltNotice: React.FC<FeltNoticeProps> = ({
  className,
  tone,
  children,
  ...props
}) => (
  <p
    role={tone === 'error' ? 'alert' : undefined}
    data-slot="felt-notice"
    className={cn(feltNoticeVariants({ tone }), className)}
    {...props}
  >
    {tone === 'info' ? (
      <Info className="mt-px size-3.5 shrink-0" />
    ) : (
      <CircleAlert className="mt-px size-3.5 shrink-0" />
    )}
    {children}
  </p>
);

export type FeltStatProps = React.ComponentProps<'div'> & {
  label: React.ReactNode;
  value: React.ReactNode;
};

/**
 * A number and what it counts. Used wherever the felt states a fact it wants
 * read across a room: seats taken, chips in play, the stack on a chair.
 */
export const FeltStat: React.FC<FeltStatProps> = ({
  label,
  value,
  className,
  ...props
}) => (
  <div data-slot="felt-stat" className={cn('min-w-0', className)} {...props}>
    <dt className="text-on-media-muted-foreground text-[0.6rem] font-bold tracking-[0.09em] uppercase">
      {label}
    </dt>
    <dd className="mt-0.5 truncate text-base font-extrabold tabular-nums">
      {value}
    </dd>
  </div>
);

export type FeltStatGroupProps = React.ComponentProps<'dl'>;

/** Stats side by side, hairline-ruled between. */
export const FeltStatGroup: React.FC<FeltStatGroupProps> = ({
  className,
  ...props
}) => (
  <dl
    data-slot="felt-stat-group"
    className={cn(
      'divide-on-media-hairline flex divide-x *:flex-1 *:not-first:pl-3 *:not-last:pr-3',
      className,
    )}
    {...props}
  />
);

export type FeltStepsProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** How many steps the flow has. */
  total: number;
  /** Which one is being shown, 1-based. */
  current: number;
  label: string;
};

/** How far through a flow the visitor is, as a row of filled rules. */
export const FeltSteps: React.FC<FeltStepsProps> = ({
  total,
  current,
  label,
  className,
  ...props
}) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={1}
    aria-valuemax={total}
    aria-valuenow={current}
    data-slot="felt-steps"
    className={cn('flex shrink-0 items-center gap-1.5', className)}
    {...props}
  >
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        className={cn(
          'bg-on-media-film h-[3px] flex-1 rounded-full transition-colors',
          index < current && 'bg-warning',
        )}
      />
    ))}
  </div>
);

export type FeltDividerProps = React.ComponentProps<'div'>;

/** A rule with a word in it — "or", between two ways of doing one thing. */
export const FeltDivider: React.FC<FeltDividerProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    data-slot="felt-divider"
    className={cn(
      'text-on-media-muted-foreground flex items-center gap-3 text-[0.65rem] font-bold tracking-[0.1em] uppercase',
      className,
    )}
    {...props}
  >
    <span aria-hidden className="bg-on-media-hairline h-px flex-1" />
    {children}
    <span aria-hidden className="bg-on-media-hairline h-px flex-1" />
  </div>
);

export type FeltFootnoteProps = React.ComponentProps<'p'>;

/** The quiet line under a screen, or under the button it ends on. */
export const FeltFootnote: React.FC<FeltFootnoteProps> = ({
  className,
  ...props
}) => (
  <p
    data-slot="felt-footnote"
    className={cn(
      'text-on-media-muted-foreground text-center text-xs leading-relaxed',
      className,
    )}
    {...props}
  />
);

export const feltBadgeVariants = cva(
  'shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-bold tracking-[0.05em] uppercase',
  {
    variants: {
      tone: {
        /** A fact about the row: what this seat is, what this action does. */
        muted: 'border-on-media-border text-on-media-muted-foreground border',
        /** The same, filled — for the one that stands out. */
        solid: 'bg-on-media-film text-on-media-foreground',
        /** Live, now. */
        active: 'bg-warning text-felt-inverse-foreground',
      },
    },
    defaultVariants: {
      tone: 'muted',
    },
  },
);

export type FeltBadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof feltBadgeVariants>;

/** A word pinned to a row — a role, a state, a consequence. */
export const FeltBadge: React.FC<FeltBadgeProps> = ({
  className,
  tone,
  ...props
}) => (
  <span
    data-slot="felt-badge"
    className={cn(feltBadgeVariants({ tone }), className)}
    {...props}
  />
);
