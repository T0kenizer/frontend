export const REDIRECT_URL_PARAM = 'redirectUrl';

export const sanitizeRedirectUrl = (
  redirectUrl: Nullable<string>,
): Nullable<string> => {
  if (!redirectUrl) return null;

  const normalized = redirectUrl.replaceAll('\\', '/');

  if (!normalized.startsWith('/') || normalized.startsWith('//')) return null;

  return normalized;
};
