import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayPublishedCount, getDailyLimit } from '@/lib/daily-limit';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  const [totalArticles, totalViews, publishedToday, dailyLimit] = await Promise.all([
    prisma.article.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
    getTodayPublishedCount(),
    getDailyLimit(),
  ]);

  // Get daily publish data for last 7 days
  const last7Days = await prisma.dailyPublishLog.findMany({
    orderBy: { date: 'desc' },
    take: 7,
  });

  return NextResponse.json({
    totalArticles,
    totalViews: totalViews._sum.views || 0,
    publishedToday,
    dailyLimit,
    last7Days,
  });
}
