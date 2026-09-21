import {
  PASSWORD_COMFORTABLE_LENGTH,
  PASSWORD_SHORT_LENGTH,
} from '@constants/passwords';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@tokenizer/shared/constants/users.constants';

/**
 * Highest tier a password under `PASSWORD_SHORT_LENGTH` can reach: `Aa1!` ticks
 * three boxes and still falls in seconds.
 */
const SHORT_SCORE_CAP = 1;

export interface PasswordCheck {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  /** Satisfied advisory checks, forced to zero while a hard rule is broken. */
  score: number;
  /** What to tell the user: the broken rule if any, the strength otherwise. */
  label: string;
  /** False only when the schema itself would reject the password. */
  isAllowed: boolean;
  checks: PasswordCheck[];
}

const SCORE_LABELS = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

/**
 * Scores a password against the shared schema.
 *
 * Only the length bounds are enforced server-side, so everything else is
 * advice: a short-but-allowed password scores badly, yet stays submittable.
 * Holding the user to a stricter bar than the API would reject passwords the
 * backend is happy to store.
 */
export const evaluatePassword = (password: string): PasswordStrength => {
  const checks: PasswordCheck[] = [
    {
      id: 'length',
      label: `${PASSWORD_COMFORTABLE_LENGTH} characters or more`,
      met: password.length >= PASSWORD_COMFORTABLE_LENGTH,
    },
    {
      id: 'case',
      label: 'Upper and lower case letters',
      met: /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password),
    },
    {
      id: 'digit',
      label: 'A number',
      met: /\p{N}/u.test(password),
    },
    {
      id: 'symbol',
      label: 'A symbol',
      met: /[^\p{L}\p{N}]/u.test(password),
    },
  ];

  const isTooShort = password.length < PASSWORD_MIN_LENGTH;
  const isTooLong = password.length > PASSWORD_MAX_LENGTH;
  const isAllowed = !isTooShort && !isTooLong;

  const met = checks.filter((check) => check.met).length;
  const score = isAllowed
    ? password.length < PASSWORD_SHORT_LENGTH
      ? Math.min(met, SHORT_SCORE_CAP)
      : met
    : 0;

  const label = isTooShort
    ? `Use at least ${PASSWORD_MIN_LENGTH} characters`
    : isTooLong
      ? `Use at most ${PASSWORD_MAX_LENGTH} characters`
      : SCORE_LABELS[score];

  return { score, label, isAllowed, checks };
};
