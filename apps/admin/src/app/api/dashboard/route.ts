import { createApiClient } from '@/services/api-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await createApiClient();

    const [ordersRes, enquiriesRes] = await Promise.allSettled([
      client.get('/admin-api/orders', { params: { limit: 6, sort: 'desc' } }),
      client.get('/admin-api/wholesales/enquiries', { params: { limit: 10 } }),
    ]);

    return NextResponse.json({
      recentOrders: ordersRes.status === 'fulfilled' ? (ordersRes.value.data.items ?? []) : [],
      pendingEnquiries: enquiriesRes.status === 'fulfilled'
        ? (enquiriesRes.value.data.items ?? []).filter(
            (e: { status: string }) => e.status === 'pending' || e.status === 'reviewing',
          )
        : [],
    });
  } catch {
    return NextResponse.json({ recentOrders: [], pendingEnquiries: [] }, { status: 500 });
  }
}
