/**
 * Where the chairs go.
 *
 * Pure arithmetic, deliberately kept out of the components that use it: the
 * ring draws seats at these points, and the chip layer flies tokens between
 * them and the pot. Both need the _same_ coordinates or the chips land beside
 * the player instead of on them, so the geometry is computed once, here, and
 * handed to both rather than each measuring the table in its own hand.
 */

export interface RingPoint {
  /** Pixels from the left edge of the ring box, to the centre of the seat. */
  x: number;
  /** Pixels from the top edge of the ring box, to the centre of the seat. */
  y: number;
}

/** How big the seats around the ring are drawn. */
export type RingSeatSize = 'default' | 'lg';

export interface RingGeometry {
  width: number;
  height: number;
  /** Centre of the table — where the pot sits and chips fly to. */
  centre: RingPoint;
  /** One point per seat, in seat order. */
  points: RingPoint[];
  /** The puck size these points were laid out for. */
  seatSize: RingSeatSize;
}

export const EMPTY_RING: RingGeometry = {
  width: 0,
  height: 0,
  centre: { x: 0, y: 0 },
  points: [],
  seatSize: 'default',
};

export interface LayOutRingParams {
  count: number;
  width: number;
  height: number;
  /** The centre panel's box, which seats are pushed out around. */
  hubWidth: number;
  hubHeight: number;
}

interface SeatMetrics {
  /** The puck's box, name and stack included. Kept in step with `SeatPuck`. */
  width: number;
  height: number;
  /** Half a puck, give or take — how far a seat stays off the felt's edge. */
  insetX: number;
  insetY: number;
  /** Clearance kept between the centre panel and the nearest seat. */
  hubMarginX: number;
  hubMarginY: number;
  /** Below this the ellipse collapses and seats start overlapping each other. */
  minRadiusY: number;
}

const SEAT_METRICS: Record<RingSeatSize, SeatMetrics> = {
  default: {
    width: 96,
    height: 108,
    insetX: 62,
    insetY: 54,
    hubMarginX: 52,
    hubMarginY: 46,
    minRadiusY: 120,
  },
  lg: {
    width: 120,
    height: 140,
    insetX: 76,
    insetY: 70,
    hubMarginX: 66,
    hubMarginY: 58,
    minRadiusY: 150,
  },
};

/**
 * Seats spread evenly around an ellipse, with the middle of the table kept
 * clear for the centre panel.
 *
 * The seats are drawn large whenever the table has room for them — the felt is
 * read from across a room, on a shared screen — and fall back to the smaller
 * puck once a full table in a small window would pile them on top of each
 * other.
 */
export function layOutRing(params: LayOutRingParams): RingGeometry {
  const { count, width, height } = params;
  const centre = { x: width / 2, y: height / 2 };

  if (!width || !height || count <= 0) {
    return { ...EMPTY_RING, width, height, centre };
  }

  const large = placeSeats(params, SEAT_METRICS.lg);
  if (fits(large, SEAT_METRICS.lg, width, height)) {
    return { width, height, centre, points: large, seatSize: 'lg' };
  }

  return {
    width,
    height,
    centre,
    points: placeSeats(params, SEAT_METRICS.default),
    seatSize: 'default',
  };
}

/**
 * The clearance is the whole reason this is not one line of trigonometry. A
 * plain ellipse puts a seat at due east and due west — exactly where the panel
 * that holds every action of the game is — so those two seats are pushed
 * outward along their own side until they clear it. They keep their vertical
 * position, which is what stops the correction from reading as a seat that
 * drifted out of the circle.
 *
 * Seat 0 is offset half a step off top-dead-centre so an even seat count does
 * not put one player squarely behind the panel's title.
 */
function placeSeats(
  { count, width, height, hubWidth, hubHeight }: LayOutRingParams,
  metrics: SeatMetrics,
): RingPoint[] {
  const centre = { x: width / 2, y: height / 2 };

  const radiusX = Math.max(0, width / 2 - metrics.insetX);
  const radiusY = Math.max(metrics.minRadiusY, height / 2 - metrics.insetY);

  const clearX = hubWidth / 2 + metrics.hubMarginX;
  const clearY = hubHeight / 2 + metrics.hubMarginY;

  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + ((index + 0.5) / count) * Math.PI * 2;

    const offsetY = radiusY * Math.sin(angle);
    let offsetX = radiusX * Math.cos(angle);

    // Inside the panel's horizontal band: shove the seat out past the panel,
    // but never past the edge of the felt.
    if (Math.abs(offsetY) < clearY) {
      const side = Math.cos(angle) < 0 ? -1 : 1;
      offsetX = side * Math.min(radiusX, Math.max(Math.abs(offsetX), clearX));
    }

    return { x: centre.x + offsetX, y: centre.y + offsetY };
  });
}

/** Every puck inside the ring box, and no two of them touching. */
function fits(
  points: RingPoint[],
  { width: seatWidth, height: seatHeight }: SeatMetrics,
  width: number,
  height: number,
): boolean {
  const halfWidth = seatWidth / 2;
  const halfHeight = seatHeight / 2;

  return points.every(
    (point, index) =>
      point.x - halfWidth >= 0 &&
      point.x + halfWidth <= width &&
      point.y - halfHeight >= 0 &&
      point.y + halfHeight <= height &&
      points
        .slice(index + 1)
        .every(
          (other) =>
            Math.abs(point.x - other.x) >= seatWidth ||
            Math.abs(point.y - other.y) >= seatHeight,
        ),
  );
}
