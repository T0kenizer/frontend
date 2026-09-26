import { NextRequest, NextResponse } from 'next/server';

export const PATHNAME_HEADER = 'x-pathname';

/**
 * Route handlers have no metadata to carry a robots tag, so the OAuth and
 * callback redirects get it as a header instead.
 */
const NOINDEX_PREFIXES = ['/oauth/', '/callback/'];

const proxy = (request: NextRequest) => {
  const headers = new Headers(request.headers);

  headers.set(
    PATHNAME_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  const response = NextResponse.next({ request: { headers } });

  if (
    NOINDEX_PREFIXES.some((prefix) =>
      request.nextUrl.pathname.startsWith(prefix),
    )
  )
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  return response;
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export default proxy;
