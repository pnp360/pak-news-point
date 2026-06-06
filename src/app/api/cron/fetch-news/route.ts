/*
 * News pipeline cron endpoint.
 *
 * Vercel Hobby plan blocks sub-daily cron schedules (minimum is 1/day).
 * Use an external cron service (e.g. cron-job.org) to hit this every 30 min.
 *
 * How to set up cron-job.org:
 *   1. Create a free account at https://cron-job.org
 *   2. Create a cron job with:
 *      - URL: https://azadkhabar.vercel.app/api/cron/fetch-news
 *      - Method: GET
 *      - Interval: Every 30 minutes (cron: 'every 30 min')
 *      - Optional: add header Authorization: Bearer <your-CRON_SECRET>
 *      - Execution timeout: 120 seconds
 *   3. In Vercel env vars, add CRON_SECRET matching the header above
 *
 * The endpoint:
 *   - Supports Bearer token auth via CRON_SECRET env var
 *   - Has a built-in 30-min throttle (see shouldRunPipeline in scheduler.ts)
 *   - Returns JSON: { scraped, rewritten, created, skipped, errors, durationMs }
 */
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
