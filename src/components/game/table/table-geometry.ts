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

export interface RingGeometry {
  width: number;
  height: number;
  /** Centre of the table — where the pot sits and chips fly to. */
  centre: RingPoint;
  /** One point per seat, in seat order. */
  points: RingPoint[];
}

export const EMPTY_RING: RingGeometry = {
  width: 0,
  height: 0,
  centre: { x: 0, y: 0 },
  points: [],
};

export interface LayOutRingParams {
  count: number;
  width: number;
  height: number;
  /** The centre panel's box, which seats are pushed out around. */
  hubWidth: number;
  hubHeight: number;
}

/** Half a seat puck, give or take — how far a seat stays off the felt's edge. */
const SEAT_INSET_X = 62;
const SEAT_INSET_Y = 54;

/** Clearance kept between the centre panel and the nearest seat. */
const HUB_MARGIN_X = 52;
const HUB_MARGIN_Y = 46;

/** Below this the ellipse collapses and seats start overlapping each other. */
const MIN_RADIUS_Y = 120;

/**
 * Seats spread evenly around an ellipse, with the middle of the table kept
 * clear for the centre panel.
 *
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
export function layOutRing({
  count,
  width,
  height,
  hubWidth,
  hubHeight,
}: LayOutRingParams): RingGeometry {
  const centre = { x: width / 2, y: height / 2 };

  if (!width || !height || count <= 0) {
    return { ...EMPTY_RING, width, height, centre };
  }

  const radiusX = Math.max(0, width / 2 - SEAT_INSET_X);
  const radiusY = Math.max(MIN_RADIUS_Y, height / 2 - SEAT_INSET_Y);

  const clearX = hubWidth / 2 + HUB_MARGIN_X;
  const clearY = hubHeight / 2 + HUB_MARGIN_Y;

  const points = Array.from({ length: count }, (_, index) => {
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

  return { width, height, centre, points };
}
