import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });

  const cookieOptions = { path: '/', maxAge: 0 };
  res.cookies.set('admin_access_token', '', cookieOptions);
  res.cookies.set('admin_refresh_token', '', cookieOptions);
  res.cookies.set('admin_user', '', cookieOptions);

  return res;
}
