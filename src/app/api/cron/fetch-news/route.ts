export const maxDuration = 120;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runPipeline, shouldRunPipeline } from '@/lib/news-pipeline';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isCron = request.headers.get('x-vercel-cron') === '1';
  const isAuthedCron = isCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);

  let isAdminSession = false;
  try {
    const session = await getServerSession(authOptions);
    isAdminSession = !!session?.user;
  } catch {}

  if (!isAuthedCron && !isAdminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Respect 30-min minimum interval
  const canRun = await shouldRunPipeline();
  if (!canRun) {
    return NextResponse.json({ skipped: true, message: 'Pipeline already ran recently.' });
  }

  const result = await runPipeline();
  return NextResponse.json(result);
}
