export const maxDuration = 120;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchAllFeeds } from '@/lib/fetch-news';

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'lastCronRun' } });
    const lastRun = setting?.value ? new Date(setting.value).getTime() : 0;
    const now = Date.now();

    if (now - lastRun < FOUR_HOURS_MS) {
      const nextRun = new Date(lastRun + FOUR_HOURS_MS);
      return NextResponse.json({ triggered: false, nextRun: nextRun.toISOString() });
    }

    const result = await fetchAllFeeds();

    await prisma.setting.upsert({
      where: { key: 'lastCronRun' },
      update: { value: new Date().toISOString() },
      create: { key: 'lastCronRun', value: new Date().toISOString() },
    });

    return NextResponse.json({ triggered: true, ...result });
  } catch (error) {
    return NextResponse.json({ triggered: false, error: String(error) }, { status: 500 });
  }
}
