import ROUTES from '@constants/routes';
import {
  OAUTH_COOKIE_PATH,
  OAUTH_ERROR_PARAM,
  OAUTH_REDIRECT_COOKIE,
  parseOAuthError,
} from '@lib/oauth';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { NextRequest, NextResponse } from 'next/server';

export const GET = (request: NextRequest) => {
  const redirectUrl = sanitizeRedirectUrl(
    request.cookies.get(OAUTH_REDIRECT_COOKIE)?.value ?? null,
  );
  const error = parseOAuthError(
    request.nextUrl.searchParams.get(OAUTH_ERROR_PARAM),
  );

  const target = request.nextUrl.clone();
  target.search = '';

  if (error) {
    target.pathname = ROUTES.auth.signIn();
    if (redirectUrl) target.searchParams.set(REDIRECT_URL_PARAM, redirectUrl);
    target.searchParams.set(OAUTH_ERROR_PARAM, error);
  } else {
    const destination = new URL(
      redirectUrl ?? ROUTES.dashboard(),
      request.nextUrl.origin,
    );
    target.pathname = destination.pathname;
    target.search = destination.search;
    target.hash = destination.hash;
  }

  const response = NextResponse.redirect(target);
  response.cookies.delete({
    name: OAUTH_REDIRECT_COOKIE,
    path: OAUTH_COOKIE_PATH,
  });

  return response;
};
