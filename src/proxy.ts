import { NextRequest, NextResponse } from 'next/server';

export const PATHNAME_HEADER = 'x-pathname';

const proxy = (request: NextRequest) => {
  const headers = new Headers(request.headers);

  headers.set(
    PATHNAME_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.next({ request: { headers } });
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export default proxy;
