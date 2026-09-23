import { FeltBadge } from '@components/game/felt/felt-stage';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { cn } from '@lib/utils';
import {
  ParticipantRole,
  type ParticipantSnapshot,
} from '@tokenizer/shared/types';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * One chair, wherever it is shown.
 *
 * The seat picker and the live table render the same participant out of the
 * same snapshot, and used to render it twice over in two unrelated hands — so a
 * player picking seat 3 and then sitting in it saw two different rows for the
 * chair they had just chosen. This is that row, once. What differs between the
 * two screens is what the row _does_, which is what the props are for.
 */

export const seatRowVariants = cva(
  'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
  {
    variants: {
      state: {
        free: 'border-on-media-hairline bg-on-media-scrim',
        taken: 'border-on-media-hairline bg-on-media-scrim opacity-60',
        picked:
          'border-warning bg-warning-soft ring-warning/20 border-solid ring-3',
        mine: 'border-warning/55 bg-on-media-film',
      },
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    compoundVariants: [
      {
        state: 'free',
        interactive: true,
        className: 'hover:bg-on-media-film hover:border-on-media-border',
      },
    ],
    defaultVariants: {
      state: 'taken',
      interactive: false,
    },
  },
);

export type SeatRowState = NonNullable<
  VariantProps<typeof seatRowVariants>['state']
>;

export const describeSeat = (seat: ParticipantSnapshot): string => {
  if (!seat.claimed) return 'Waiting for a player';
  return seat.connected ? 'In play' : 'Away';
};

export interface SeatRowProps {
  seat: ParticipantSnapshot;
  /** Overrides {@link describeSeat} for the line under the name. */
  caption?: React.ReactNode;
  state?: SeatRowState;
  /** Marks the seat whose turn it is. */
  isActive?: boolean;
  /** Turns the whole row into the control that picks this seat. */
  onSelect?: () => void;
  /** True when {@link onSelect} is set but the seat cannot be taken. */
  disabled?: boolean;
  /** Pressed state, for a row that is one of a set being chosen from. */
  pressed?: boolean;
  /** Trailing controls. Dropped when the row is itself a button. */
  children?: React.ReactNode;
  className?: string;
}

export const SeatRow: React.FC<SeatRowProps> = ({
  seat,
  caption,
  state,
  isActive = false,
  onSelect,
  disabled = false,
  pressed,
  children,
  className,
}) => {
  const isInteractive = !!onSelect;

  const body = (
    <>
      <span className="text-on-media-muted-foreground w-5 shrink-0 text-center text-xs font-bold tabular-nums">
        {seat.seatIndex + 1}
      </span>

      <Avatar size="sm">
        {seat.photoUrl && <AvatarImage src={seat.photoUrl} alt="" />}
        <AvatarFallback />
      </Avatar>

      <span className="min-w-0 flex-1">
        {/* The snapshot names every seat, free ones included — the line
            under it is where "nobody yet" is said. */}
        <span className="block truncate text-sm font-semibold">
          {seat.displayName}
        </span>
        <span className="text-on-media-muted-foreground block truncate text-xs">
          {caption ?? describeSeat(seat)}
        </span>
      </span>

      {isActive && <FeltBadge tone="active">Turn</FeltBadge>}
      {seat.role === ParticipantRole.Host && (
        <FeltBadge tone="solid">Host</FeltBadge>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        data-slot="seat-row"
        disabled={disabled}
        aria-pressed={pressed}
        onClick={onSelect}
        className={cn(
          seatRowVariants({ state, interactive: !disabled }),
          className,
        )}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      data-slot="seat-row"
      className={cn(seatRowVariants({ state }), className)}
    >
      {body}
      {children}
    </div>
  );
};
