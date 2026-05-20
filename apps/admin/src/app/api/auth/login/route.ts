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
  try {
    const { email, password } = await req.json();

    const { data } = await axios.post(
      `${API_BASE}/api/admin-api/auth/login`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const { tokens, user } = data;
    const res = NextResponse.json({ user });

    console.log('tokens', tokens);

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
      const msg = err.response?.data?.message;
      const message = Array.isArray(msg) ? msg[0] : (msg ?? 'Invalid credentials');
      return NextResponse.json({ message }, { status: err.response?.status ?? 401 });
    }
    return NextResponse.json({ message: 'Unable to connect to server' }, { status: 503 });
  }
}
