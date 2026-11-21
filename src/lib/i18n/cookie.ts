import { DEFAULT_LANG, type Lang } from '@lib/i18n/langs';
import { resolveLang } from '@lib/i18n/resolve';
import { unstable_rethrow } from 'next/navigation';
import { cache } from 'react';

export const LANG_COOKIE_NAME = 'lang';

export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const writeLangCookie = (lang: Lang): void => {
  const attributes = [
    `${LANG_COOKIE_NAME}=${lang}`,
    'path=/',
    `max-age=${LANG_COOKIE_MAX_AGE}`,
    'samesite=lax',
  ];

  if (window.location.protocol === 'https:') attributes.push('secure');

  document.cookie = attributes.join('; ');
};

export const getServerLang = cache(async (): Promise<Lang> => {
  try {
    const { cookies, headers } = await import('next/headers');
    const [cookieStore, headerStore] = await Promise.all([
      cookies(),
      headers(),
    ]);

    return resolveLang(
      cookieStore.get(LANG_COOKIE_NAME)?.value,
      headerStore.get('accept-language'),
    );
  } catch (error) {
    // At build time `cookies()` throws to flag the route as dynamic. Swallowing
    // it lets the prerender run on into the providers that call the backend.
    unstable_rethrow(error);

    return DEFAULT_LANG;
  }
});
