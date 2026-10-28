import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname, search } = request.nextUrl;
  const method = request.method;

  // Log incoming request
  if (!pathname.startsWith('/_next') && !pathname.includes('favicon.ico')) {
    const timestamp = new Date().toISOString();
    console.log(`[CivicPulse HTTP] ${timestamp} | ${method} ${pathname}${search}`);
  }

  const response = NextResponse.next();

  // Add custom response headers for performance tracking
  response.headers.set('X-CivicPulse-Engine', 'NextJS-Turbopack');
  response.headers.set('X-Response-Time-Start', start.toString());

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
