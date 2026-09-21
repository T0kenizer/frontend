/**
 * How many slots the code input lays out.
 *
 * The authority on the shape of a code is `joinCodeSchema` in
 * `@tokenizer/shared`, which is what the API validates against; this is only
 * how many boxes to draw. Kept as a named constant so the OTP input, its
 * `maxLength` and the auto-submit threshold can never drift from one another.
 */
export const JOIN_CODE_LENGTH = 6;

/**
 * Cap on the name a player takes a seat under, mirroring `claimSeatDataSchema`.
 * Enforced here only so the input stops accepting characters the API would
 * reject after the round trip.
 */
export const SEAT_DISPLAY_NAME_MAX_LENGTH = 60;
