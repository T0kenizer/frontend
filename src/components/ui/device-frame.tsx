import { cn } from '@lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const BROWSER_DOTS = {
  muted: ['bg-white/25', 'bg-white/25', 'bg-white/25'],
  colored: ['bg-red-500', 'bg-amber-400', 'bg-green-500'],
} as const;

export type BrowserFrameProps = React.ComponentProps<'div'> & {
  dots?: keyof typeof BROWSER_DOTS;
};

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  dots = 'muted',
  className,
  children,
  ...props
}) => (
  <div
    data-slot="browser-frame"
    data-dots={dots}
    className={cn(
      'bg-night-850 flex flex-col overflow-hidden rounded-xl shadow-2xl',
      className,
    )}
    {...props}
  >
    <div className="bg-night-820 flex h-5.5 shrink-0 items-center gap-1.25 px-2.5">
      {BROWSER_DOTS[dots].map((color, index) => (
        <i key={index} className={cn('size-1.75 rounded-full', color)} />
      ))}
    </div>
    <div className="relative min-h-0 flex-1">{children}</div>
  </div>
);

export const phoneFrameVariants = cva(
  'bg-night-950 after:bg-night-950 relative shadow-2xl ring-1 ring-white/10 ring-inset after:absolute after:left-1/2 after:z-10 after:-translate-x-1/2 after:rounded-full',
  {
    variants: {
      size: {
        default:
          'h-54.5 w-27 rounded-4xl p-1.5 after:top-2.75 after:h-2.5 after:w-8.5',
        lg: 'h-65.5 w-32 rounded-4xl p-1.5 after:top-3 after:h-3 after:w-10 sm:h-117.5 sm:w-57.5 sm:p-2.5 sm:after:top-5 sm:after:h-4.5 sm:after:w-17',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export type PhoneFrameProps = React.ComponentProps<'div'> &
  VariantProps<typeof phoneFrameVariants>;

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  className,
  size,
  children,
  ...props
}) => (
  <div
    data-slot="phone-frame"
    data-size={size ?? 'default'}
    className={cn(phoneFrameVariants({ size }), className)}
    {...props}
  >
    <div className="relative size-full overflow-hidden rounded-3xl">
      {children}
    </div>
  </div>
);

export type TvFrameProps = React.ComponentProps<'div'>;

export const TvFrame: React.FC<TvFrameProps> = ({
  className,
  children,
  ...props
}) => (
  <div data-slot="tv-frame" className={className} {...props}>
    <div className="bg-night-950 rounded-xl p-2.25 shadow-2xl ring-1 ring-white/5 ring-inset">
      <div className="relative aspect-video overflow-hidden rounded-md">
        {children}
      </div>
    </div>
    <div className="bg-night-900 mx-auto h-2.5 w-3/10 rounded-b-lg" />
  </div>
);
