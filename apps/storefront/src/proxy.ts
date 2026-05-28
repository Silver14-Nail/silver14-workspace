import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'vi'];
const defaultLocale = 'en';

const PUBLIC_FILE = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  // ── Locale routing ────────────────────────────────────────────────────────
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) {
    const detectedLng = pathname.split('/')[1] ?? defaultLocale;
    const response = NextResponse.next();
    response.headers.set('x-i18next-current-language', detectedLng);
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set('x-i18next-current-language', defaultLocale);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - next internal routes
     * - static files
     * - favicon / sitemap / robots
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
