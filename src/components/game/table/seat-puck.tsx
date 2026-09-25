'use client';

import { SeatStack } from '@components/game/table/seat-stack';
import type { SeatView } from '@components/game/table/use-table-view';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { cn } from '@lib/utils';
import type { ChipModel } from '@tokenizer/shared/types';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion } from 'motion/react';

const discVariants = cva(
  'relative grid place-items-center rounded-full transition-colors',
  {
    variants: {
      tone: {
        free: 'border-on-media-hairline border-2 bg-black/30',
        seated: 'border-on-media-border/90 border-2 bg-black/30',
        mine: 'border-on-media-border/90 border-2 bg-black/30',
        folded: 'border-on-media-hairline border-2 bg-black/40 opacity-55',
        'all-in': 'border-on-media-border border-2 border-dashed bg-black/30',
        out: 'border-on-media-hairline border-2 border-dotted bg-black/40 opacity-40',
      },
      size: {
        default: 'size-13',
        sm: 'size-11',
      },
    },
    defaultVariants: { tone: 'seated', size: 'default' },
  },
);

export type SeatPuckProps = VariantProps<typeof discVariants> & {
  view: SeatView;
  chipModel: ChipModel;
  index?: number;
  className?: string;
};

export const SeatPuck: React.FC<SeatPuckProps> = ({
  view,
  chipModel,
  size,
  index = 0,
  className,
}) => {
  const reduceMotion = useReducedMotion();
  const { seat, tone, isActive, isFree, isHost, isWinner } = view;

  return (
    <motion.div
      data-slot="seat-puck"
      data-seat={seat.seatIndex}
      data-tone={tone}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.6, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 28,
        delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.5),
      }}
      className={cn(
        'flex w-24 flex-col items-center text-center',
        size === 'sm' && 'w-[4.6rem]',
        className,
      )}
    >
      <span className="relative">
        <span
          aria-hidden
          className={cn(
            'ring-warning/70 pointer-events-none absolute -inset-1 rounded-full ring-2 transition-opacity duration-300 motion-reduce:transition-none',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
        />
        <motion.span
          className={cn(discVariants({ tone, size }))}
          animate={
            isWinner && !reduceMotion
              ? { scale: [1, 1.14, 1], rotate: [0, -4, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <Avatar size={size === 'sm' ? 'default' : 'lg'}>
            {seat.avatarUrl && <AvatarImage src={seat.avatarUrl} alt="" />}
            <AvatarFallback />
          </Avatar>

          <SeatMarker view={view} />
          <SeatPosition view={view} />
        </motion.span>
      </span>

      <span
        className={cn(
          'mt-1.5 block max-w-full truncate text-[0.7rem] leading-tight font-bold',
          isFree && 'text-on-media-muted-foreground font-semibold',
        )}
      >
        {seat.displayName}
        {view.isMine && (
          <span className="text-on-media-muted-foreground font-medium">
            {' '}
            · you
          </span>
        )}
      </span>

      {view.status ? (
        <SeatStatusPill status={view.status} isHost={isHost && !isFree} />
      ) : (
        <span className="text-on-media-muted-foreground mt-0.5 block max-w-full truncate text-[0.625rem] leading-tight">
          {isHost ? 'Host · ' : ''}
          {view.caption}
        </span>
      )}

      <SeatStack
        amount={seat.balance}
        chipModel={chipModel}
        muted={view.tone === 'folded' || view.tone === 'out'}
        size={size === 'sm' ? 'sm' : 'default'}
        reduceMotion={!!reduceMotion}
      />
    </motion.div>
  );
};

const SeatMarker: React.FC<{ view: SeatView }> = ({ view }) => {
  const { label, className } = view.isFree
    ? {
        label: 'H',
        className: 'bg-on-media-foreground text-felt-inverse-foreground',
      }
    : view.tone === 'folded' || view.tone === 'out'
      ? { label: '—', className: 'bg-on-media-film text-on-media-foreground' }
      : view.isActive
        ? { label: '•', className: 'bg-warning text-warning-foreground' }
        : { label: '✓', className: 'bg-felt-bright text-white' };

  return (
    <span
      aria-hidden
      className={cn(
        'border-felt-deep absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full border-2 text-[0.55rem] leading-none font-extrabold',
        className,
      )}
    >
      {label}
    </span>
  );
};

const POSITION_LABELS = {
  dealer: 'D',
  'small-blind': 'SB',
  'big-blind': 'BB',
} as const;

const SeatPosition: React.FC<{ view: SeatView }> = ({ view }) => {
  if (!view.marker) return null;

  return (
    <span
      aria-hidden
      className={cn(
        'border-felt-deep absolute -bottom-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full border-2 px-1 text-[0.5rem] leading-none font-extrabold',
        view.marker === 'dealer'
          ? 'bg-on-media-foreground text-felt-inverse-foreground'
          : 'bg-felt-bright text-white',
      )}
    >
      {POSITION_LABELS[view.marker]}
    </span>
  );
};

const SeatStatusPill: React.FC<{
  status: NonNullable<SeatView['status']>;
  isHost: boolean;
}> = ({ status, isHost }) => {
  const { label, className } = STATUS_STYLES[status];

  return (
    <span className="mt-0.5 flex max-w-full items-center justify-center gap-1">
      {isHost && (
        <span className="text-on-media-muted-foreground shrink-0 text-[0.625rem] leading-tight">
          Host ·
        </span>
      )}
      <span
        className={cn(
          'truncate rounded-full px-1.5 py-px text-[0.5625rem] leading-tight font-bold tracking-[0.04em] uppercase',
          className,
        )}
      >
        {label}
      </span>
    </span>
  );
};

const STATUS_STYLES: Record<
  NonNullable<SeatView['status']>,
  { label: string; className: string }
> = {
  folded: {
    label: 'Folded',
    className: 'bg-on-media-film text-on-media-muted-foreground',
  },
  'all-in': {
    label: 'All in',
    className: 'bg-warning text-felt-inverse-foreground',
  },
  out: {
    label: 'Out',
    className: 'bg-destructive/25 text-on-media-foreground',
  },
  away: {
    label: 'Away',
    className: 'bg-warning-soft text-warning-soft-foreground',
  },
  'host-played': {
    label: 'Host plays',
    className: 'bg-on-media-scrim text-on-media-muted-foreground',
  },
};
