import { createApiClient } from '@/services/api-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await createApiClient();
    const { data } = await client.get('/admin-api/wholesales/newsletter', {
      params: { limit: 100 },
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ items: [], pagination: null }, { status: 500 });
  }
}
