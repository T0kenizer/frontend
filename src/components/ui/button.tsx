import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2Icon } from 'lucide-react';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@lib/utils';

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer gap-2 font-semibold forced-colors:border-[ButtonBorder] motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none",
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground [box-shadow:0_6px_0_var(--primary-lip),0_12px_24px_-10px_var(--primary-glow)] hover:not-active:not-aria-[haspopup]:not-disabled:-translate-y-0.5 hover:not-active:not-disabled:[box-shadow:0_8px_0_var(--primary-lip),0_16px_28px_-10px_var(--primary-glow-strong)] active:not-aria-[haspopup]:translate-y-1 active:[box-shadow:0_2px_0_var(--primary-lip),0_4px_12px_-8px_var(--primary-glow)] disabled:[box-shadow:none] aria-invalid:bg-destructive aria-invalid:text-primary-foreground aria-invalid:[box-shadow:0_6px_0_oklch(from_var(--destructive)_calc(l-0.12)_c_h)]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover hover:border-border-strong aria-expanded:bg-secondary border-border aria-invalid:border-destructive aria-invalid:text-destructive',
        paper:
          'bg-surface-2 text-secondary-foreground hover:bg-surface-sunk hover:border-border-strong aria-expanded:bg-surface-2 border-border aria-invalid:border-destructive aria-invalid:text-destructive',
        ghost:
          'hover:bg-muted aria-expanded:bg-muted text-muted-foreground aria-invalid:border-destructive aria-invalid:text-destructive',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        inverse:
          'bg-inverse text-inverse-foreground [box-shadow:0_6px_0_var(--primary-lip),0_12px_24px_-10px_var(--primary-glow)] active:not-aria-[haspopup]:translate-y-1 active:[box-shadow:0_2px_0_var(--primary-lip),0_4px_12px_-8px_var(--primary-glow)] disabled:[box-shadow:none]',
        link: 'text-primary underline-offset-4 hover:underline',
        felt: 'bg-felt text-white-95 hover:bg-felt-bright hover:not-active:not-aria-[haspopup]:not-disabled:-translate-y-0.5 hover:not-active:not-disabled:[box-shadow:inset_0_1px_0_oklch(1_0_0/.15),inset_0_-2px_0_oklch(0_0_0/.15),0_8px_0_var(--color-felt-deep),0_16px_28px_-10px_var(--color-felt-deep)] [box-shadow:inset_0_1px_0_oklch(1_0_0/.15),inset_0_-2px_0_oklch(0_0_0/.15),0_6px_0_var(--color-felt-deep),0_12px_24px_-10px_var(--color-felt-deep)] active:not-aria-[haspopup]:translate-y-1 active:[box-shadow:inset_0_1px_0_oklch(1_0_0/.15),0_2px_0_var(--color-felt-deep)] disabled:[box-shadow:none]',
        'felt-inverse':
          'bg-felt-inverse text-felt-inverse-foreground hover:not-active:not-aria-[haspopup]:not-disabled:-translate-y-0.5 hover:not-active:not-disabled:[box-shadow:0_8px_0_var(--color-felt-deep),0_16px_28px_-10px_var(--color-felt-deep)] [box-shadow:0_6px_0_var(--color-felt-deep),0_12px_24px_-10px_var(--color-felt-deep)] active:not-aria-[haspopup]:translate-y-1 active:[box-shadow:0_2px_0_var(--color-felt-deep),0_4px_12px_-8px_var(--color-felt-deep)] disabled:[box-shadow:none]',
        line: 'border-on-media-border bg-on-media text-on-media-foreground hover:bg-on-media-hover',
        danger:
          'bg-destructive text-primary-foreground hover:brightness-105 aria-expanded:bg-destructive',
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}) => {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled ?? (asChild ? undefined : loading)}
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && !asChild && 'disabled:opacity-100',
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {loading && (
            <Loader2Icon
              aria-hidden
              data-icon="inline-end"
              className="animate-spin motion-reduce:animate-none"
            />
          )}
        </>
      )}
    </Comp>
  );
};
