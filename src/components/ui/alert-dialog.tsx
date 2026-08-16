'use client';

import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import * as React from 'react';

import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

export type AlertDialogProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Root
>;

export type AlertDialogTriggerProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Trigger
>;

export type AlertDialogPortalProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Portal
>;

export type AlertDialogOverlayProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Overlay
>;

export type AlertDialogContentProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Content
> & {
  size?: 'default' | 'sm';
};

export type AlertDialogHeaderProps = React.ComponentProps<'div'>;

export type AlertDialogFooterProps = React.ComponentProps<'div'>;

export type AlertDialogMediaProps = React.ComponentProps<'div'>;

export type AlertDialogTitleProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Title
>;

export type AlertDialogDescriptionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Description
>;

export type AlertDialogActionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Action
> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>;

export type AlertDialogCancelProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Cancel
> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>;

const AlertDialog: React.FC<AlertDialogProps> = ({ ...props }) => (
  <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
);

const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({
  ...props
}) => (
  <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
);

const AlertDialogPortal: React.FC<AlertDialogPortalProps> = ({ ...props }) => (
  <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
);

const AlertDialogOverlay: React.FC<AlertDialogOverlayProps> = ({
  className,
  ...props
}) => (
  <AlertDialogPrimitive.Overlay
    data-slot="alert-dialog-overlay"
    className={cn(
      'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs',
      className,
    )}
    {...props}
  />
);

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({
  className,
  size = 'default',
  ...props
}) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      data-slot="alert-dialog-content"
      data-size={size}
      className={cn(
        'group/alert-dialog-content bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl p-4 ring-1 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm',
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
);

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  className,
  ...props
}) => (
  <div
    data-slot="alert-dialog-header"
    className={cn(
      'grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]',
      className,
    )}
    {...props}
  />
);

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  className,
  ...props
}) => (
  <div
    data-slot="alert-dialog-footer"
    className={cn(
      'bg-muted/50 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
      className,
    )}
    {...props}
  />
);

const AlertDialogMedia: React.FC<AlertDialogMediaProps> = ({
  className,
  ...props
}) => (
  <div
    data-slot="alert-dialog-media"
    className={cn(
      "bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
      className,
    )}
    {...props}
  />
);

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({
  className,
  ...props
}) => (
  <AlertDialogPrimitive.Title
    data-slot="alert-dialog-title"
    className={cn(
      'font-heading text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
      className,
    )}
    {...props}
  />
);

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({
  className,
  ...props
}) => (
  <AlertDialogPrimitive.Description
    data-slot="alert-dialog-description"
    className={cn(
      'text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3',
      className,
    )}
    {...props}
  />
);

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({
  className,
  variant = 'primary',
  size = 'default',
  ...props
}) => (
  <Button variant={variant} size={size} asChild>
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  </Button>
);

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({
  className,
  variant = 'secondary',
  size = 'default',
  ...props
}) => (
  <Button variant={variant} size={size} asChild>
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      {...props}
    />
  </Button>
);

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
