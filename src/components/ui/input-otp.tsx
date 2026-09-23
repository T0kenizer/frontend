'use client';

import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import * as React from 'react';

export type InputOTPProps = React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
};

export const InputOTP: React.FC<InputOTPProps> = ({
  className,
  containerClassName,
  ...props
}) => (
  <OTPInput
    data-slot="input-otp"
    containerClassName={cn(
      'cn-input-otp flex items-center has-disabled:opacity-50',
      containerClassName,
    )}
    spellCheck={false}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
);

export type InputOTPGroupProps = React.ComponentProps<'div'>;

export const InputOTPGroup: React.FC<InputOTPGroupProps> = ({
  className,
  ...props
}) => (
  <div
    data-slot="input-otp-group"
    className={cn(
      'has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 flex items-center rounded-lg has-aria-invalid:ring-3',
      className,
    )}
    {...props}
  />
);

export const inputOTPSlotVariants = cva(
  'relative flex items-center justify-center transition-all outline-none data-[active=true]:z-10 data-[active=true]:ring-3',
  {
    variants: {
      variant: {
        default:
          'border-input aria-invalid:border-destructive data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40 size-8 border-y border-r text-sm first:rounded-l-lg first:border-l last:rounded-r-lg',
        felt: 'border-on-media-border bg-on-media-scrim text-on-media-foreground data-[active=true]:border-warning data-[active=true]:ring-warning/25 aria-invalid:border-destructive h-14 flex-1 rounded-lg border text-2xl font-extrabold tabular-nums',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type InputOTPSlotProps = React.ComponentProps<'div'> &
  VariantProps<typeof inputOTPSlotVariants> & {
    index: number;
  };

export const InputOTPSlot: React.FC<InputOTPSlotProps> = ({
  index,
  className,
  variant,
  ...props
}) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(inputOTPSlotVariants({ variant }), className)}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
};

export type InputOTPSeparatorProps = React.ComponentProps<'div'>;

export const InputOTPSeparator: React.FC<InputOTPSeparatorProps> = (props) => (
  <div
    data-slot="input-otp-separator"
    className="flex items-center [&_svg:not([class*='size-'])]:size-4"
    role="separator"
    {...props}
  >
    <MinusIcon />
  </div>
);
