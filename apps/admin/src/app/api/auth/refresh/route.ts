import { type NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const API_BASE = process.env.API_URL || 'http://localhost:3000';

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('admin_refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  try {
    const { data } = await axios.post(
      `${API_BASE}/api/admin-api/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const { tokens, user } = data;
    const res = NextResponse.json({ user });

    res.cookies.set('admin_access_token', tokens.accessToken, {
      ...COOKIE_DEFAULTS,
      maxAge: tokens.expiresIn,
    });
    res.cookies.set('admin_refresh_token', tokens.refreshToken, {
      ...COOKIE_DEFAULTS,
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    if (isAxiosError(err)) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
