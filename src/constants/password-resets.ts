/**
 * How long a reset link stays usable, in the words the screens use to say it.
 *
 * The number itself lives in the backend, as `TOKEN_TTL_MS` in
 * `password-resets.constants.ts`, and is what the reset email already quotes.
 * Change one and this has to follow.
 */
export const PASSWORD_RESET_TTL_LABEL = '1 hour';
