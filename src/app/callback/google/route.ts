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

  let location: string;

  if (error) {
    const params = new URLSearchParams();
    if (redirectUrl) params.set(REDIRECT_URL_PARAM, redirectUrl);
    params.set(OAUTH_ERROR_PARAM, error);
    location = `${ROUTES.auth.signIn()}?${params}`;
  } else {
    location = redirectUrl ?? ROUTES.dashboard();
  }

  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: location },
  });
  response.cookies.delete({
    name: OAUTH_REDIRECT_COOKIE,
    path: OAUTH_COOKIE_PATH,
  });

  return response;
};
