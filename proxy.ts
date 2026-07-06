import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANONICAL_HOST = 'www.raota.net';

export function proxy(request: NextRequest) {
  if (request.nextUrl.hostname !== 'raota.net') {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.hostname = CANONICAL_HOST;
  url.protocol = 'https:';

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: '/:path*',
};
