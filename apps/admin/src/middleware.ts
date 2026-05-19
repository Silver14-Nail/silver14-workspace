import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const API_BASE = process.env.API_URL ?? 'http://localhost:3000';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_access_token')?.value;

  // ── Proxy: /backend/* → NestJS API ───────────────────────────────────────
  if (pathname.startsWith('/backend/')) {
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const apiPath = pathname.replace('/backend', '/api');
    const targetUrl = new URL(`${apiPath}${request.nextUrl.search}`, API_BASE);

    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set('authorization', `Bearer ${token}`);
    proxyHeaders.delete('host');

    return NextResponse.rewrite(targetUrl, { request: { headers: proxyHeaders } });
  }

  // ── Public routes ─────────────────────────────────────────────────────────
  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  // ── Protected routes ──────────────────────────────────────────────────────
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static assets and /api/* — Route Handlers manage their own auth
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.svg|.*\\.ico|api/).*)'],
};
