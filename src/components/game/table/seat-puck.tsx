'use client';

import { SeatStack } from '@components/game/table/seat-stack';
import type { SeatView } from '@components/game/table/use-table-view';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { cn } from '@lib/utils';
import type { ChipModel } from '@tokenizer/shared/types';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion } from 'motion/react';

/**
 * One chair, as it is drawn around the table.
 *
 * This is the companion to `felt/seat-row` rather than a replacement for it:
 * the join flow reads its seats as a list, because you pick one from it, and
 * the live table reads them as a ring, because that is where people are
 * sitting. The same participant, two shapes, and neither borrows the other's
 * layout — the earlier attempt to make one component do both is what left the
 * live table showing a scrolling list of rows with a felt painted behind it.
 *
 * It knows nothing about turns or rounds beyond the flags it is handed. What it
 * does own is the reaction: the stack changes when chips move, and the chair
 * lifts when its player takes the pot. The turn ring fades between players,
 * while the hub shows the next player moving into the current position.
 */

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
  /** How to draw the stack: a figure, or chips. */
  chipModel: ChipModel;
  /** Ordinal used to stagger the deal-in animation. */
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
      // Seats are dealt in around the ring rather than appearing at once, which
      // is what makes a table fill up read as people arriving.
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
            'ring-success/70 pointer-events-none absolute -inset-1 rounded-full ring-2 transition-opacity duration-300 motion-reduce:transition-none',
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
          {/* Every chair is drawn the same way, free ones included: the
              snapshot already says what the seat is called and whose face
              belongs in it, and a chair with no face falls back to the app's
              own avatar placeholder rather than to a marker of its own. */}
          <Avatar size={size === 'sm' ? 'default' : 'lg'}>
            {seat.photoUrl && <AvatarImage src={seat.photoUrl} alt="" />}
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

      {/* Every chair, not only the taken ones: an empty seat is played by the
          host and its chips are as much in the game as anybody's. */}
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

/**
 * The small corner disc that names the seat's one salient fact.
 *
 * An empty chair gets the host's mark rather than nothing at all: it is being
 * played, and the commonest misreading of this screen would be to take a free
 * seat for one that is sitting the round out.
 */
const SeatMarker: React.FC<{ view: SeatView }> = ({ view }) => {
  const { label, className } = view.isFree
    ? {
        label: 'H',
        className: 'bg-on-media-foreground text-felt-inverse-foreground',
      }
    : view.tone === 'folded' || view.tone === 'out'
      ? { label: '—', className: 'bg-on-media-film text-on-media-foreground' }
      : view.isActive
        ? { label: '•', className: 'bg-success text-success-foreground' }
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

/** What the button and the blinds are called on a chair. */
const POSITION_LABELS = {
  dealer: 'D',
  'small-blind': 'SB',
  'big-blind': 'BB',
} as const;

/**
 * The button, and the two seats that pay for it.
 *
 * Its own badge rather than a fifth case of {@link SeatMarker}, because it
 * answers a different question: that one says what this player is doing, this
 * one says where the hand is being dealt from. A poker table without a visible
 * button is one where nobody can tell whose blind is coming.
 */
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

/**
 * The word for what this chair is doing, when that word matters.
 *
 * A pill rather than the plain caption line, because these are the states
 * somebody scans the table for — who is still in this hand, who dropped out,
 * whose phone died — and prose at 10px in a muted grey is not scannable.
 */
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
  /** Out of this hand, still at the table with their stack. */
  folded: {
    label: 'Folded',
    className: 'bg-on-media-film text-on-media-muted-foreground',
  },
  /** In the hand with nothing left to bet: still contesting every pot paid into. */
  'all-in': {
    label: 'All in',
    className: 'bg-warning text-felt-inverse-foreground',
  },
  /** Out of the game for good. */
  out: {
    label: 'Out',
    className: 'bg-destructive/25 text-on-media-foreground',
  },
  /** Seated, but their connection dropped. */
  away: {
    label: 'Away',
    className: 'bg-warning-soft text-warning-soft-foreground',
  },
  /** Nobody claimed it, so the host plays it. */
  'host-played': {
    label: 'Host plays',
    className: 'bg-on-media-scrim text-on-media-muted-foreground',
  },
};
