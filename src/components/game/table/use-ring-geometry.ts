'use client';

import {
  EMPTY_RING,
  layOutRing,
  type RingGeometry,
} from '@components/game/table/table-geometry';
import { useLayoutEffect, useRef, useState } from 'react';

export interface UseRingGeometryResult {
  /** Attach to the box the seats are positioned inside. */
  ringRef: React.RefObject<Nullable<HTMLDivElement>>;
  /** Attach to the centre panel, so seats know what to avoid. */
  hubRef: React.RefObject<Nullable<HTMLDivElement>>;
  geometry: RingGeometry;
}

/**
 * Measures the table and lays the seats out on it.
 *
 * The felt is sized by its container rather than by us — it is whatever is left
 * after the top strip — and the centre panel's height changes with the state of
 * the game, which is what a round in progress and a finished table differ by.
 * Both therefore have to be observed rather than assumed: a hard-coded panel
 * height was what first let the east and west seats slide under it the moment a
 * round opened and the action list grew a row.
 *
 * Geometry lands in state rather than in a ref because the seats are positioned
 * from it during render; a ref would leave the first paint with every chair
 * stacked at the origin.
 */
export function useRingGeometry(seatCount: number): UseRingGeometryResult {
  const ringRef = useRef<Nullable<HTMLDivElement>>(null);
  const hubRef = useRef<Nullable<HTMLDivElement>>(null);
  const [geometry, setGeometry] = useState<RingGeometry>(EMPTY_RING);

  useLayoutEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    const measure = () => {
      const hub = hubRef.current;

      setGeometry((previous) => {
        const next = layOutRing({
          count: seatCount,
          width: ring.clientWidth,
          height: ring.clientHeight,
          hubWidth: hub?.offsetWidth ?? 0,
          hubHeight: hub?.offsetHeight ?? 0,
        });

        // The observer fires on every panel reflow, including ones that move
        // nothing. Returning the previous object keeps those from re-rendering
        // every seat — and, through the chip layer, restarting its animations.
        return sameRing(previous, next) ? previous : next;
      });
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(ring);
    if (hubRef.current) observer.observe(hubRef.current);

    return () => observer.disconnect();
  }, [seatCount]);

  return { ringRef, hubRef, geometry };
}

const sameRing = (a: RingGeometry, b: RingGeometry): boolean =>
  a.width === b.width &&
  a.height === b.height &&
  a.points.length === b.points.length &&
  a.points.every(
    (point, index) =>
      point.x === b.points[index].x && point.y === b.points[index].y,
  );
