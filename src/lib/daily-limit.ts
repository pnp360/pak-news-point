import { prisma } from './prisma';

export async function getDailyLimit(): Promise<number> {
  const envLimit = process.env.DAILY_NEWS_LIMIT;
  if (envLimit) {
    const parsed = parseInt(envLimit, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'daily_news_limit' },
    });
    if (setting) {
      const parsed = parseInt(setting.value, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {
    // If settings table doesn't exist yet, return default
  }

  return 100;
}

export function getTodayDateKey(): Date {
  const now = new Date();
  const karachiOffset = 5 * 60 + 30;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const karachiTime = new Date(utc + karachiOffset * 60000);
  return new Date(
    Date.UTC(karachiTime.getFullYear(), karachiTime.getMonth(), karachiTime.getDate())
  );
}

export async function getTodayPublishedCount(): Promise<number> {
  const today = getTodayDateKey();

  const log = await prisma.dailyPublishLog.findUnique({
    where: { date: today },
  });

  return log?.publishedCount ?? 0;
}

export async function canPublishToday(): Promise<{
  canPublish: boolean;
  currentCount: number;
  limit: number;
  message: string;
}> {
  const limit = await getDailyLimit();
  const currentCount = await getTodayPublishedCount();
  const canPublish = currentCount < limit;

  return {
    canPublish,
    currentCount,
    limit,
    message: canPublish
      ? `آج ${currentCount} / ${limit} خبریں شائع ہو چکی ہیں`
      : `آج کی خبروں کی حد (${limit}) مکمل ہو چکی ہے`,
  };
}

export async function incrementPublishedCount(): Promise<void> {
  const today = getTodayDateKey();

  await prisma.dailyPublishLog.upsert({
    where: { date: today },
    update: {
      publishedCount: { increment: 1 },
    },
    create: {
      date: today,
      publishedCount: 1,
    },
  });
}
