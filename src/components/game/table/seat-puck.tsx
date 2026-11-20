'use client';

import { SeatStack } from '@components/game/table/seat-stack';
import type { RingSeatSize } from '@components/game/table/table-geometry';
import type { SeatView } from '@components/game/table/use-table-view';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { cn } from '@lib/utils';
import { ChipModel } from '@tokenizer/shared/types';
import { cva } from 'class-variance-authority';
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
    },
    defaultVariants: { tone: 'seated' },
  },
);

/** `sm` is the phone rail; the ring picks between the other two by room. */
export type SeatPuckSize = 'sm' | RingSeatSize;

interface PuckMetrics {
  width: string;
  disc: string;
  avatar: React.ComponentProps<typeof Avatar>['size'];
  halo: string;
  name: string;
  caption: string;
  marker: string;
  position: string;
  pill: string;
}

const SMALL_TEXT = {
  name: 'mt-1.5 text-[0.7rem]',
  caption: 'text-[0.625rem]',
  marker: 'size-5 text-[0.55rem]',
  position: 'h-5 min-w-5 text-[0.5rem]',
  pill: 'px-1.5 text-[0.5625rem]',
};

/** Every measure of a puck, per size. `lg` matches `SEAT_METRICS.lg`. */
const PUCK_METRICS: Record<SeatPuckSize, PuckMetrics> = {
  sm: {
    width: 'w-[4.6rem]',
    disc: 'size-11',
    avatar: 'default',
    halo: '-inset-1 ring-2',
    ...SMALL_TEXT,
  },
  default: {
    width: 'w-24',
    disc: 'size-13',
    avatar: 'lg',
    halo: '-inset-1 ring-2',
    ...SMALL_TEXT,
  },
  lg: {
    width: 'w-30',
    disc: 'size-16',
    avatar: 'xl',
    halo: '-inset-1.5 ring-3',
    name: 'mt-2 text-sm',
    caption: 'text-xs',
    marker: 'size-6 text-[0.7rem]',
    position: 'h-6 min-w-6 text-[0.625rem]',
    pill: 'px-2 text-[0.6875rem]',
  },
};

export interface SeatPuckProps {
  view: SeatView;
  chipModel: ChipModel;
  size?: SeatPuckSize;
  index?: number;
  className?: string;
}

export const SeatPuck: React.FC<SeatPuckProps> = ({
  view,
  chipModel,
  size = 'default',
  index = 0,
  className,
}) => {
  const reduceMotion = useReducedMotion();
  const { seat, tone, isActive, isFree, isHost, isWinner } = view;
  const metrics = PUCK_METRICS[size];

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
        'flex flex-col items-center text-center',
        metrics.width,
        className,
      )}
    >
      <span className="relative">
        <span
          aria-hidden
          className={cn(
            'ring-warning/70 pointer-events-none absolute rounded-full transition-opacity duration-300 motion-reduce:transition-none',
            metrics.halo,
            isActive ? 'opacity-100' : 'opacity-0',
          )}
        />
        <motion.span
          className={cn(discVariants({ tone }), metrics.disc)}
          animate={
            isWinner && !reduceMotion
              ? { scale: [1, 1.14, 1], rotate: [0, -4, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <Avatar size={metrics.avatar}>
            {seat.avatarUrl && <AvatarImage src={seat.avatarUrl} alt="" />}
            <AvatarFallback />
          </Avatar>

          <SeatMarker view={view} className={metrics.marker} />
          <SeatPosition view={view} className={metrics.position} />
        </motion.span>
      </span>

      <span
        className={cn(
          'block max-w-full truncate leading-tight font-bold',
          metrics.name,
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
        <SeatStatusPill
          status={view.status}
          isHost={isHost && !isFree}
          captionClassName={metrics.caption}
          className={metrics.pill}
        />
      ) : (
        <span
          className={cn(
            'text-on-media-muted-foreground mt-0.5 block max-w-full truncate leading-tight',
            metrics.caption,
          )}
        >
          {isHost ? 'Host · ' : ''}
          {view.caption}
        </span>
      )}

      <SeatStack
        amount={seat.balance}
        chipModel={chipModel}
        muted={view.tone === 'folded' || view.tone === 'out'}
        size={size}
        reduceMotion={!!reduceMotion}
      />
    </motion.div>
  );
};

const SeatMarker: React.FC<{ view: SeatView; className: string }> = ({
  view,
  className: sizeClassName,
}) => {
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
        'border-felt-deep absolute -right-1 -bottom-1 grid place-items-center rounded-full border-2 leading-none font-extrabold',
        sizeClassName,
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

const SeatPosition: React.FC<{ view: SeatView; className: string }> = ({
  view,
  className,
}) => {
  if (!view.marker) return null;

  return (
    <span
      aria-hidden
      className={cn(
        'border-felt-deep absolute -bottom-1 -left-1 grid place-items-center rounded-full border-2 px-1 leading-none font-extrabold',
        className,
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
  captionClassName: string;
  className: string;
}> = ({ status, isHost, captionClassName, className: sizeClassName }) => {
  const { label, className } = STATUS_STYLES[status];

  return (
    <span className="mt-0.5 flex max-w-full items-center justify-center gap-1">
      {isHost && (
        <span
          className={cn(
            'text-on-media-muted-foreground shrink-0 leading-tight',
            captionClassName,
          )}
        >
          Host ·
        </span>
      )}
      <span
        className={cn(
          'truncate rounded-full py-px leading-tight font-bold tracking-[0.04em] uppercase',
          sizeClassName,
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
