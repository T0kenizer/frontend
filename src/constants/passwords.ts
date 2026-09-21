/**
 * Advisory length thresholds for the password strength meter.
 *
 * These are front-end only on purpose: the API enforces nothing beyond
 * `PASSWORD_MIN_LENGTH` / `PASSWORD_MAX_LENGTH` from `@tokenizer/shared`, so
 * scoring a password against a stricter bar here must never block a submission
 * the backend would accept.
 */

/** Length from which a password stops being flagged as uncomfortably short. */
export const PASSWORD_COMFORTABLE_LENGTH = 12;

/** Below this, no amount of character variety earns more than a token score. */
export const PASSWORD_SHORT_LENGTH = 8;
