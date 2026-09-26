export const OAUTH_REDIRECT_COOKIE = 'oauth_redirect';

export const OAUTH_COOKIE_PATH = '/callback/google';

export const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;

export const OAUTH_ERROR_PARAM = 'error';

export const OAUTH_ERROR_CODES = [
  'access_denied',
  'unverified_email',
  'failed',
] as const;

export type OAuthErrorCode = (typeof OAUTH_ERROR_CODES)[number];

export const parseOAuthError = (
  value: Nullable<string>,
): Nullable<OAuthErrorCode> => {
  if (!value) return null;

  return (OAUTH_ERROR_CODES as readonly string[]).includes(value)
    ? (value as OAuthErrorCode)
    : 'failed';
};
