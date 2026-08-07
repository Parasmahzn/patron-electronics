import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/config/site';

/**
 * Optimistic admin-route gate: only checks whether the session cookie is
 * present, so it stays fast and avoids a database round trip on every
 * request/prefetch. The authoritative check (`requireAdmin`) runs in every
 * admin Server Component, Server Action, and Route Handler.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Server Actions (including admin CRUD mutations) are always POST requests
  // to the current page URL. This gate only needs to cover page navigation
  // (GET) — the authoritative check for mutations is `requireAdmin()` inside
  // every service function. Letting POSTs through untouched here avoids
  // interfering with the Server Action request/response cycle.
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (isAdminRoute && !request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
