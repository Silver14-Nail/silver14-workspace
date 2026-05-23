import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'vi'];
const defaultLocale = 'en';

// Account sub-routes that require an active session.
// The account index (/account) shows its own login form for guests.
const PROTECTED_ACCOUNT_PATHS = ['/account/orders', '/account/addresses', '/account/wishlist'];

const PUBLIC_FILE = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  // ── Auth guard for protected account sub-routes ───────────────────────────
  // Strip language prefix to get the bare path for matching
  const pathWithoutLng = pathname.replace(/^\/(en|vi)/, '');
  const isProtected = PROTECTED_ACCOUNT_PATHS.some((p) => pathWithoutLng.startsWith(p));

  if (isProtected) {
    // customer_auth is an httpOnly cookie set by the API on login/register/refresh.
    // Its presence signals an active refresh-token session.
    const authHint = request.cookies.get('customer_auth');

    if (!authHint) {
      const lng = pathname.split('/')[1] ?? defaultLocale;
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${lng}/account`;
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
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
