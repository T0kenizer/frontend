'use client';

import type { ParticipantSnapshot } from '@tokenizer/shared/types';
import * as React from 'react';

/**
 * Turns stack movements into things to animate.
 *
 * The server never tells us chips moved — it sends a whole new snapshot, and
 * the balances in it happen to differ from the ones before. So the movement is
 * recovered here, by diffing, which also means it covers every way chips can
 * move: a bet, a blind posted at the top of a round, a pot paid out, a host
 * acting for an empty chair. One diff, every case, rather than an animation
 * hung off each action the client happens to know it sent.
 *
 * The diff runs during render rather than in an effect. Flights are derived
 * from the snapshot — the same balances always imply the same throws — and
 * deriving them in an effect would paint one frame of the new balances before
 * the chips that explain them appeared.
 */

export interface ChipFlight {
  id: string;
  /** Index into the ring geometry — which chair the chips belong to. */
  seatIndex: number;
  /** Chips leaving a stack for the pot, or the pot paying a stack out. */
  direction: 'to-pot' | 'to-seat';
  amount: number;
}

/** Long enough to read as a throw, short enough not to hold up the next turn. */
const FLIGHT_MS = 900;

interface FlightState {
  /** The balances the live flights were measured against. */
  balances: Map<string, number>;
  /**
   * Cheap equality for the map above, so render can tell "changed" in a string
   * compare.
   */
  signature: string;
  flights: ChipFlight[];
  /** Makes each round of throws a fresh set of keys for `AnimatePresence`. */
  generation: number;
}

const signatureOf = (seats: ParticipantSnapshot[]): string =>
  seats.map((seat) => `${seat.id}:${seat.balance}`).join('|');

const balancesOf = (seats: ParticipantSnapshot[]): Map<string, number> =>
  new Map(seats.map((seat) => [seat.id, seat.balance]));

export function useChipFlights(seats: ParticipantSnapshot[]): ChipFlight[] {
  const signature = signatureOf(seats);

  const [state, setState] = React.useState<FlightState>(() => ({
    balances: balancesOf(seats),
    signature,
    // The table as we found it is not chips that moved.
    flights: [],
    generation: 0,
  }));

  // Adjusting state during render because a prop changed — React's own
  // pattern for derived state. It re-renders immediately, before the browser
  // paints, so nothing flickers.
  if (state.signature !== signature) {
    const generation = state.generation + 1;
    const flights: ChipFlight[] = [];

    for (const seat of seats) {
      const was = state.balances.get(seat.id);
      if (was === undefined || was === seat.balance) continue;

      flights.push({
        id: `flight-${generation}-${seat.seatIndex}`,
        seatIndex: seat.seatIndex,
        direction: seat.balance < was ? 'to-pot' : 'to-seat',
        amount: Math.abs(seat.balance - was),
      });
    }

    setState({
      balances: balancesOf(seats),
      signature,
      flights,
      generation,
    });
  }

  // Clearing the throws once they have landed. The `setState` is inside the
  // timer's callback, not the effect body: the effect's job is to own the
  // timer, which is exactly the external thing an effect is for.
  const { generation, flights } = state;
  React.useEffect(() => {
    if (!flights.length) return;

    const timer = setTimeout(() => {
      setState((live) =>
        live.generation === generation ? { ...live, flights: [] } : live,
      );
    }, FLIGHT_MS);

    return () => clearTimeout(timer);
  }, [generation, flights.length]);

  return state.flights;
}
