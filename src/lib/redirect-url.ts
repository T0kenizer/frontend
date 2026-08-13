export const REDIRECT_URL_PARAM = 'redirectUrl';

/**
 * Guards against open redirects: only same-site, absolute paths are accepted.
 * Anything else (absolute URLs, protocol-relative `//evil.com`, backslash
 * variants) falls back to `null`.
 */
export const sanitizeRedirectUrl = (
  redirectUrl: Nullable<string>,
): Nullable<string> => {
  if (!redirectUrl) return null;

  const normalized = redirectUrl.replaceAll('\\', '/');

  if (!normalized.startsWith('/') || normalized.startsWith('//')) return null;

  return normalized;
};
