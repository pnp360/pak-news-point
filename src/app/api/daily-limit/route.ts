import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canPublishToday } from '@/lib/daily-limit';

export async function GET() {
  const session = await getServerSession(authOptions);

  const limitInfo = await canPublishToday();

  if (!session?.user) {
    return NextResponse.json({ ...limitInfo, authenticated: false });
  }

  return NextResponse.json({ ...limitInfo, authenticated: true });
}
