import { type NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const API_BASE = process.env.API_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    const { data } = await axios.post(
      `${API_BASE}/api/admin-api/auth/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return NextResponse.json(data);
  } catch (err) {
    if (isAxiosError(err)) {
      const msg = err.response?.data?.message;
      const message = Array.isArray(msg) ? msg[0] : (msg ?? 'Unable to change password');
      return NextResponse.json({ message }, { status: err.response?.status ?? 400 });
    }
    return NextResponse.json({ message: 'Unable to connect to server' }, { status: 503 });
  }
}
