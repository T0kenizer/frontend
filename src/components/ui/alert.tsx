import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@lib/utils';

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'border-destructive/30 bg-destructive/10 font-semibold text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
        /** Same tinted treatment, keyed to the success/warning token pairs. */
        success:
          'border-success/30 bg-success-soft font-semibold text-success-soft-foreground *:data-[slot=alert-description]:text-success-soft-foreground/90 *:[svg]:text-current',
        warning:
          'border-warning/30 bg-warning-soft font-semibold text-warning-soft-foreground *:data-[slot=alert-description]:text-warning-soft-foreground/90 *:[svg]:text-current',
        /**
         * The same warning, dressed for the felt. Theme-invariant like the
         * table it sits on: the backdrop is baize, not a theme, so the wash
         * comes from `--warning` and the text from the `on-media` family rather
         * than from a themed foreground that would flip under it.
         */
        felt: 'border-warning/35 bg-warning/15 font-semibold text-on-media-foreground *:data-[slot=alert-description]:text-on-media-foreground *:[svg]:text-warning',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        '[&_a]:hover:text-foreground font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3',
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground [&_a]:hover:text-foreground text-sm text-balance md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-action"
      className={cn('absolute top-2 right-2', className)}
      {...props}
    />
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
