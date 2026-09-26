import ROUTES from '@constants/routes';
import { NEXT_PUBLIC_API_URL, NODE_ENV } from '@lib/env';
import {
  OAUTH_COOKIE_MAX_AGE_SECONDS,
  OAUTH_COOKIE_PATH,
  OAUTH_REDIRECT_COOKIE,
} from '@lib/oauth';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { NextRequest, NextResponse } from 'next/server';

export const GET = (request: NextRequest) => {
  const redirectUrl =
    sanitizeRedirectUrl(request.nextUrl.searchParams.get(REDIRECT_URL_PARAM)) ??
    ROUTES.dashboard();

  const response = NextResponse.redirect(
    `${NEXT_PUBLIC_API_URL}/sessions/google`,
  );
  response.cookies.set(OAUTH_REDIRECT_COOKIE, redirectUrl, {
    httpOnly: true,
    sameSite: 'lax',
    secure: NODE_ENV === 'production',
    path: OAUTH_COOKIE_PATH,
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
};
