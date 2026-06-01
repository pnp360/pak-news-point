export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getTodayPublishedCount, getDailyLimit } from '@/lib/daily-limit';
import { toUrduNumber } from '@/lib/urdu';
import Link from 'next/link';
import { HiDocumentText, HiEye, HiCollection, HiTag, HiUserGroup, HiExclamation } from 'react-icons/hi';
import FetchNewsButton from '@/components/admin/FetchNewsButton';

async function getDashboardStats() {
  const [
    totalArticles, publishedToday, dailyLimit, totalViews, totalCategories,
    totalTags, totalUsers, draftCount, scheduledCount, publishedCount, breakingCount,
  ] = await Promise.all([
    prisma.article.count(),
    getTodayPublishedCount(),
    getDailyLimit(),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.article.count({ where: { status: 'DRAFT' } }),
    prisma.article.count({ where: { status: 'SCHEDULED' } }),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count({ where: { isBreaking: true, status: 'PUBLISHED' } }),
  ]);

  return {
    totalArticles, publishedToday, dailyLimit, totalViews: totalViews._sum.views || 0,
    totalCategories, totalTags, totalUsers, draftCount, scheduledCount, publishedCount, breakingCount,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: 'کل خبریں', value: stats.totalArticles, icon: HiDocumentText, color: 'bg-blue-500' },
    { label: 'شائع شدہ', value: stats.publishedCount, icon: HiDocumentText, color: 'bg-green-500' },
    { label: 'ڈرافٹ', value: stats.draftCount, icon: HiExclamation, color: 'bg-yellow-500' },
    { label: 'بریکنگ', value: stats.breakingCount, icon: HiExclamation, color: 'bg-red-500' },
    { label: 'کل ملاحظات', value: stats.totalViews, icon: HiEye, color: 'bg-purple-500' },
    { label: 'زمرہ جات', value: stats.totalCategories, icon: HiCollection, color: 'bg-indigo-500' },
    { label: 'ٹیگز', value: stats.totalTags, icon: HiTag, color: 'bg-pink-500' },
    { label: 'صارفین', value: stats.totalUsers, icon: HiUserGroup, color: 'bg-teal-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ڈیش بورڈ</h1>

      {/* Daily Limit Widget */}
      <div className={`rounded-xl p-6 mb-6 text-white ${
        stats.publishedToday >= stats.dailyLimit ? 'bg-red-600' : 'bg-green-600'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">آج کی شائع کردہ خبریں</h3>
            <p className="text-3xl font-bold mt-2">
              {stats.publishedToday} / {stats.dailyLimit}
            </p>
          </div>
          <div className="text-5xl opacity-75">
            {stats.publishedToday >= stats.dailyLimit ? '🔴' : '🟢'}
          </div>
        </div>
        <div className="mt-4 bg-white/25 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${Math.min((stats.publishedToday / stats.dailyLimit) * 100, 100)}%` }}
          />
        </div>
        {stats.publishedToday >= stats.dailyLimit && (
          <p className="mt-3 text-sm font-bold">
            آج کی خبروں کی حد ({stats.dailyLimit}) مکمل ہو چکی ہے
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{toUrduNumber(card.value)}</p>
                </div>
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">فوری اقدامات</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/news/new"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            نئی خبر تحریر کریں
          </Link>
          <FetchNewsButton />
          <Link
            href="/admin/categories"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            زمرہ جات کا نظم کریں
          </Link>
          <Link
            href="/admin/settings"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            سیٹنگز
          </Link>
        </div>
      </div>
    </div>
  );
}
