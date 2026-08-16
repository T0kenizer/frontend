'use client';

import { Avatar as AvatarPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends React.ComponentProps<
  typeof AvatarPrimitive.Root
> {
  size?: 'default' | 'sm' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  size = 'default',
  ...props
}) => (
  <AvatarPrimitive.Root
    data-slot="avatar"
    data-size={size}
    className={cn(
      'group/avatar after:border-border relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 data-[size=xl]:size-12 data-[size=2xl]:size-16 data-[size=3xl]:size-20 data-[size=4xl]:size-24 dark:after:mix-blend-lighten',
      className,
    )}
    {...props}
  />
);

export type AvatarImageProps = React.ComponentProps<
  typeof AvatarPrimitive.Image
>;

export const AvatarImage: React.FC<AvatarImageProps> = ({
  className,
  ...props
}) => (
  <AvatarPrimitive.Image
    data-slot="avatar-image"
    className={cn(
      'aspect-square size-full rounded-full object-cover',
      className,
    )}
    {...props}
  />
);

export type AvatarFallbackProps = React.ComponentProps<
  typeof AvatarPrimitive.Fallback
>;

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  className,
  children = <User />,
  ...props
}) => (
  <AvatarPrimitive.Fallback
    data-slot="avatar-fallback"
    className={cn(
      'bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs group-data-[size=xl]/avatar:text-base group-data-[size=2xl]/avatar:text-lg group-data-[size=3xl]/avatar:text-xl group-data-[size=4xl]/avatar:text-2xl group-data-[size=2xl]/avatar:[&>svg]:size-8 group-data-[size=3xl]/avatar:[&>svg]:size-10 group-data-[size=4xl]/avatar:[&>svg]:size-12',
      className,
    )}
    {...props}
  >
    {children}
  </AvatarPrimitive.Fallback>
);

export type AvatarBadgeProps = React.ComponentProps<'span'>;

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  className,
  ...props
}) => (
  <span
    data-slot="avatar-badge"
    className={cn(
      'bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none',
      'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
      'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
      'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
      'group-data-[size=xl]/avatar:size-3.5 group-data-[size=xl]/avatar:[&>svg]:size-2.5',
      'group-data-[size=2xl]/avatar:size-4 group-data-[size=2xl]/avatar:[&>svg]:size-2.5',
      'group-data-[size=3xl]/avatar:size-5 group-data-[size=3xl]/avatar:[&>svg]:size-3',
      'group-data-[size=4xl]/avatar:size-6 group-data-[size=4xl]/avatar:[&>svg]:size-4',
      className,
    )}
    {...props}
  />
);

export type AvatarGroupProps = React.ComponentProps<'div'>;

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  className,
  ...props
}) => (
  <div
    data-slot="avatar-group"
    className={cn(
      'group/avatar-group *:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2',
      className,
    )}
    {...props}
  />
);

export type AvatarGroupCountProps = React.ComponentProps<'div'>;

export const AvatarGroupCount: React.FC<AvatarGroupCountProps> = ({
  className,
  ...props
}) => (
  <div
    data-slot="avatar-group-count"
    className={cn(
      'bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 group-has-data-[size=xl]/avatar-group:size-12 group-has-data-[size=xl]/avatar-group:text-base group-has-data-[size=2xl]/avatar-group:size-16 group-has-data-[size=2xl]/avatar-group:text-lg group-has-data-[size=3xl]/avatar-group:size-20 group-has-data-[size=3xl]/avatar-group:text-xl group-has-data-[size=4xl]/avatar-group:size-24 group-has-data-[size=4xl]/avatar-group:text-2xl [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3 group-has-data-[size=xl]/avatar-group:[&>svg]:size-6 group-has-data-[size=2xl]/avatar-group:[&>svg]:size-8 group-has-data-[size=3xl]/avatar-group:[&>svg]:size-10 group-has-data-[size=4xl]/avatar-group:[&>svg]:size-12',
      className,
    )}
    {...props}
  />
);
