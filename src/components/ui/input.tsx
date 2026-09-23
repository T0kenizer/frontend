import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  'file:text-foreground w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
  {
    variants: {
      variant: {
        default:
          'border-input placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        felt: 'border-on-media-border bg-on-media-scrim text-on-media-foreground placeholder:text-on-media-muted-foreground focus-visible:border-warning focus-visible:ring-warning/25 aria-invalid:border-destructive aria-invalid:ring-destructive/25',
      },
      size: {
        sm: 'h-7 text-sm',
        default: 'h-8',
        lg: 'h-9',
        xl: 'h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants>;

export const Input: React.FC<InputProps> = ({
  className,
  type,
  variant,
  size,
  ...props
}) => (
  <input
    type={type}
    data-slot="input"
    data-variant={variant}
    className={cn(inputVariants({ variant, size }), className)}
    {...props}
  />
);
