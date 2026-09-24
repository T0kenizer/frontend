import { LandingSection } from '@constants/landing';
import { NEXT_PUBLIC_API_URL } from '@lib/env';
import { REDIRECT_URL_PARAM } from '@lib/redirect-url';
import { buildGameJoinPath } from '@tokenizer/shared/utils/games.utils';

const withRedirectUrl = (path: string, redirectUrl?: string) =>
  redirectUrl
    ? `${path}?${REDIRECT_URL_PARAM}=${encodeURIComponent(redirectUrl)}`
    : path;

const AUTH_ROUTES = {
  signIn: (redirectUrl?: string) => withRedirectUrl('/signin', redirectUrl),
  signUp: (redirectUrl?: string) => withRedirectUrl('/signup', redirectUrl),

  forgotPassword: () => '/forgot-password',
  resetPassword: () => '/reset-password',

  confirmAccount: () => '/confirm-account',
  resendConfirmation: () => '/resend-confirmation',

  deleteAccount: () => '/delete-account',

  googleOAuth: (redirect?: string) => {
    const url = new URL(`${NEXT_PUBLIC_API_URL}/sessions/google`);
    if (redirect) url.searchParams.set('redirect', redirect);
    return url.toString();
  },
} as const;

const SETTINGS_ROUTES = () => '/settings';
SETTINGS_ROUTES.profile = () => '/settings/profile';
SETTINGS_ROUTES.preferences = () => '/settings/preferences';
SETTINGS_ROUTES.security = () => '/settings/security';
SETTINGS_ROUTES.subscription = () => '/settings/subscription';

const ADMIN_ROUTES = () => '/admin';

const GAME_ROUTES = (uuid: string) => `/game/${uuid}`;
GAME_ROUTES.new = () => '/game/new';

const PROFILE_ROUTES = (uuid?: string) =>
  uuid ? `/profile/${uuid}` : '/profile';

const JOIN_ROUTES = (uuid?: string) =>
  uuid ? buildGameJoinPath(uuid) : '/game/join';
GAME_ROUTES.join = JOIN_ROUTES;

const LANDING_ROUTE = (section?: LandingSection) =>
  section ? `/#${section}` : '/';
const DASHBOARD_ROUTE = () => '/dashboard';

const HOME_ROUTE = (isAuthenticated: boolean) =>
  isAuthenticated ? DASHBOARD_ROUTE() : LANDING_ROUTE();

const ROUTES = {
  home: HOME_ROUTE,

  landing: LANDING_ROUTE,

  dashboard: DASHBOARD_ROUTE,

  auth: AUTH_ROUTES,

  profile: PROFILE_ROUTES,

  settings: SETTINGS_ROUTES,

  admin: ADMIN_ROUTES,

  game: GAME_ROUTES,
} as const;

export default ROUTES;
