import { NEXT_PUBLIC_API_URL } from '@lib/env';
import { REDIRECT_URL_PARAM } from '@lib/redirect-url';

const withRedirectUrl = (path: string, redirectUrl?: string) =>
  redirectUrl
    ? `${path}?${REDIRECT_URL_PARAM}=${encodeURIComponent(redirectUrl)}`
    : path;

const AUTH_ROUTES = {
  signIn: (redirectUrl?: string) => withRedirectUrl('/signin', redirectUrl),
  signUp: (redirectUrl?: string) => withRedirectUrl('/signup', redirectUrl),

  forgotPassword: () => '/forgot-password',
  resetPassword: () => '/reset-password',

  googleOAuth: (redirect?: string) => {
    const url = new URL(`${NEXT_PUBLIC_API_URL}/sessions/google`);
    if (redirect) url.searchParams.set('redirect', redirect);
    return url.toString();
  },
};

const ADMIN_ROUTES = () => '/admin';

const ROUTES = {
  home: () => '/',

  auth: AUTH_ROUTES,

  admin: ADMIN_ROUTES,
} as const;

export default ROUTES;
