'use client';

import type { RingGeometry } from '@components/game/table/table-geometry';
import type { ChipFlight } from '@components/game/table/use-chip-flights';
import { formatAmount } from '@lib/amount';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import * as React from 'react';

/**
 * The chips in the air.
 *
 * Purely decorative and deliberately inert: `pointer-events-none` throughout,
 * because it covers the whole felt and a seat you cannot click is worse than a
 * throw you cannot see. It sits between the table and the seats in the stack,
 * so chips pass over the baize and under the players they belong to.
 *
 * It reads the same geometry the seats are placed from, which is the only
 * reason a throw starts at the player who made it.
 */

export interface ChipFlightLayerProps {
  geometry: RingGeometry;
  flights: ChipFlight[];
}

/** Chips per throw. Three reads as a handful; more reads as confetti. */
const CHIPS_PER_FLIGHT = 3;

export const ChipFlightLayer: React.FC<ChipFlightLayerProps> = ({
  geometry,
  flights,
}) => {
  const reduceMotion = useReducedMotion();

  if (!geometry.points.length) return null;

  return (
    <div
      aria-hidden
      data-slot="chip-flight-layer"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <AnimatePresence>
        {flights.map((flight) => {
          const seat = geometry.points[flight.seatIndex];
          if (!seat) return null;

          const from = flight.direction === 'to-pot' ? seat : geometry.centre;
          const to = flight.direction === 'to-pot' ? geometry.centre : seat;

          return (
            <React.Fragment key={flight.id}>
              {Array.from({ length: CHIPS_PER_FLIGHT }, (_, chip) => (
                <motion.span
                  key={`${flight.id}-${chip}`}
                  className="border-warning/70 bg-warning absolute size-3 rounded-full border-2 shadow-[0_2px_6px_oklch(0_0_0/.5)]"
                  initial={{
                    left: from.x,
                    top: from.y,
                    x: '-50%',
                    y: '-50%',
                    opacity: 0,
                    scale: 0.5,
                  }}
                  animate={{
                    left: to.x,
                    top: to.y,
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.7],
                    // A little scatter on arrival, so three chips land as a
                    // pile rather than as one chip drawn three times.
                    rotate: chip * 40 - 40,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.2 : 0.75,
                    delay: reduceMotion ? 0 : chip * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              ))}

              <motion.span
                className="text-warning absolute text-[0.7rem] font-extrabold tabular-nums drop-shadow-[0_2px_4px_oklch(0_0_0/.7)]"
                initial={{
                  left: from.x,
                  top: from.y,
                  x: '-50%',
                  y: '-50%',
                  opacity: 0,
                }}
                animate={{ opacity: [0, 1, 0], y: '-140%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.2 : 0.85 }}
              >
                {flight.direction === 'to-pot' ? '−' : '+'}
                {formatAmount(flight.amount)}
              </motion.span>
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
