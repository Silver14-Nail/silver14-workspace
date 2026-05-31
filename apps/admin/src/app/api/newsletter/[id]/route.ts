import { createApiClient } from '@/services/api-client';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const client = await createApiClient();
    const { data } = await client.patch(`/admin-api/wholesales/newsletter/${id}`, body);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}
