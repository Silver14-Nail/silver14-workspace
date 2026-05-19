import { type NextRequest, NextResponse } from 'next/server';
import axios, { isAxiosError } from 'axios';

const API_BASE = process.env.API_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data } = await axios.get(`${API_BASE}/api/admin-api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (isAxiosError(err)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: err.response?.status ?? 401 },
      );
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
