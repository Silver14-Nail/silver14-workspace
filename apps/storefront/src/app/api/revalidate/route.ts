import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// On-demand revalidation endpoint called by the admin after saving a campaign.
// Set REVALIDATE_SECRET in both apps to protect this endpoint.
// If REVALIDATE_SECRET is not set the endpoint is open (acceptable for local dev).
export async function POST(request: NextRequest) {
  const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

  if (REVALIDATE_SECRET) {
    let body: { secret?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
    if (body.secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
  }

  revalidateTag('homepage-campaign', {});
  return NextResponse.json({ revalidated: true, tag: 'homepage-campaign' });
}
