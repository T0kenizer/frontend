import { NEXT_PUBLIC_API_URL } from '@lib/env';

const AUTH_ROUTES = {
  signIn: () => '/signin',
  signUp: () => '/signup',
  forgotPassword: () => '/forgot-password',
  resetPassword: () => '/reset-password',

  googleOAuth: (redirect?: string) => {
    const url = new URL(`${NEXT_PUBLIC_API_URL}/sessions/google`);
    if (redirect) url.searchParams.set('redirect', redirect);
    return url.toString();
  },
} as const;

const ADMIN_ROUTES = () => '/admin';

const ROUTES = {
  home: () => '/',

  auth: AUTH_ROUTES,

  admin: ADMIN_ROUTES,
} as const;

export default ROUTES;
