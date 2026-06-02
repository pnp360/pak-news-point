export const dynamic = 'force-dynamic';
export const maxDuration = 30;

import { NextResponse } from 'next/server';
import { getRates } from '@/lib/rates';

export async function GET() {
  try {
    const rates = await getRates();
    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
  }
}
