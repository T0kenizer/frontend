'use client';

import { ChipFlightLayer } from '@components/game/table/chip-flight-layer';
import { SeatPuck } from '@components/game/table/seat-puck';
import type { RingGeometry } from '@components/game/table/table-geometry';
import type { ChipFlight } from '@components/game/table/use-chip-flights';
import type { SeatView } from '@components/game/table/use-table-view';
import { ScrollFade } from '@components/ui/scroll-fade';
import { cn } from '@lib/utils';
import type { ChipModel } from '@tokenizer/shared/types';
import { motion } from 'motion/react';

/**
 * The table and the people around it.
 *
 * One of the screen's two halves, and the half that holds no actions
 * whatsoever: it says who is here, what they have and whose turn it is, and
 * that is all it says. Everything you can _do_ lives in the panel it centres —
 * handed in as children so this component never has to know what state the game
 * is in to draw a chair.
 *
 * Two layouts, because a ring of nine chairs is unreadable on a phone: the
 * ellipse on a wide screen, a scrolling rail above the panel on a narrow one.
 * They render the same {@link SeatPuck}, so a seat cannot end up saying two
 * different things depending on how wide the window is.
 */

export interface TableRingProps {
  seats: SeatView[];
  geometry: RingGeometry;
  flights: ChipFlight[];
  ringRef: React.RefObject<Nullable<HTMLDivElement>>;
  hubRef: React.RefObject<Nullable<HTMLDivElement>>;
  /** How every stack at this table is drawn: a figure, or chips. */
  chipModel: ChipModel;
  /** The centre panel. */
  children: React.ReactNode;
  className?: string;
}

export const TableRing: React.FC<TableRingProps> = ({
  seats,
  geometry,
  flights,
  ringRef,
  hubRef,
  chipModel,
  children,
  className,
}) => (
  <div
    data-slot="table-ring"
    className={cn('flex min-h-0 flex-1 flex-col', className)}
  >
    <SeatRail seats={seats} chipModel={chipModel} />

    <div className="relative min-h-0 flex-1 px-4 pb-6 md:px-0">
      {/* The felt oval. Hidden on narrow screens, where the rail replaces it
          and the panel is the whole screen. */}
      <div
        ref={ringRef}
        className="relative hidden h-full min-h-85 w-full md:block"
      >
        <div
          aria-hidden
          className="absolute inset-x-[9%] inset-y-[11%] rounded-[50%] shadow-[inset_0_0_0_3px_var(--on-media-film),inset_0_0_52px_oklch(0_0_0/.42),0_24px_50px_-22px_oklch(0_0_0/.6)]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 32%, var(--color-felt-bright), var(--color-felt) 62%, var(--color-felt-deep))',
          }}
        >
          <span className="border-on-media-hairline absolute inset-2.5 rounded-[50%] border border-dashed" />
        </div>

        <ChipFlightLayer geometry={geometry} flights={flights} />

        {geometry.points.length > 0 &&
          seats.map((view, index) => {
            const point = geometry.points[index];
            if (!point) return null;

            return (
              <motion.div
                key={view.seat.id}
                // Animating the coordinates rather than jumping to them keeps a
                // window resize — or the panel growing when a round opens —
                // from teleporting every chair across the felt.
                className="absolute"
                // The coordinates go on `style` as well as `animate` on
                // purpose. `initial={false}` tells Motion to start from what
                // the DOM already says, and without them that is `auto` —
                // which it cannot interpolate from, so every chair sat piled
                // at the origin until its first spring happened to land.
                style={{ left: point.x, top: point.y, translate: '-50% -50%' }}
                initial={false}
                animate={{ left: point.x, top: point.y }}
                transition={{ type: 'spring', stiffness: 220, damping: 30 }}
              >
                <SeatPuck view={view} index={index} chipModel={chipModel} />
              </motion.div>
            );
          })}
      </div>

      {/* The panel: centred in the oval on a wide screen, and on a narrow one
          pulled to the top, right under the rail — a phone has no oval to sit
          in the middle of, and centring it there only opens a band of empty
          baize above the one thing the screen is for. Measured through
          `hubRef`, which is what the seats are pushed out around. */}
      <div className="flex h-full w-full items-start justify-center md:pointer-events-none md:absolute md:inset-0 md:items-center">
        <div
          ref={hubRef}
          className="pointer-events-auto w-full max-w-110 md:w-[min(21rem,42%)]"
        >
          {children}
        </div>
      </div>
    </div>
  </div>
);

/**
 * The phone layout for the same seats: a horizontal rail above the panel.
 *
 * Deliberately not a vertical list. On a phone the panel is the screen — it is
 * what you came to tap — and a list of nine chairs above it would push every
 * action below the fold at exactly the moment it is your turn.
 */
const SeatRail: React.FC<{ seats: SeatView[]; chipModel: ChipModel }> = ({
  seats,
  chipModel,
}) => {
  const seated = seats.filter((view) => view.seat.claimed).length;

  return (
    <div data-slot="seat-rail" className="shrink-0 md:hidden">
      <p className="text-on-media-muted-foreground flex items-baseline gap-2 px-4 pb-2 text-[0.65rem] font-bold tracking-[0.1em] uppercase">
        Players
        <span className="text-on-media-foreground ml-auto text-[0.7rem] font-semibold tracking-normal normal-case">
          {seated} of {seats.length} seated
        </span>
      </p>

      <ScrollFade asChild>
        <div className="flex scrollbar-none gap-2.5 px-4 pb-4 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {seats.map((view, index) => (
            <SeatPuck
              key={view.seat.id}
              view={view}
              index={index}
              chipModel={chipModel}
              size="sm"
              className="shrink-0 snap-start"
            />
          ))}
        </div>
      </ScrollFade>
    </div>
  );
};
