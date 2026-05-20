import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env.API_URL ?? 'http://localhost:3000';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/backend/')) {
    const apiPath = pathname.replace('/backend', '/api');
    const targetUrl = new URL(`${apiPath}${request.nextUrl.search}`, API_BASE);

    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.delete('host');

    return NextResponse.rewrite(targetUrl, { request: { headers: proxyHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.svg|.*\\.ico|api/).*)'],
};
