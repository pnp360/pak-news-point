'use client';

import Link from 'next/link';
import WeatherWidget from './WeatherWidget';
import PrayerTimesWidget from './PrayerTimesWidget';
import RatesWidget from './RatesWidget';
import PoetryWidget from './PoetryWidget';
import { useLanguage } from '@/components/LanguageProvider';
import { t, CATEGORY_ENGLISH_NAMES, CATEGORY_URDU_NAMES } from '@/lib/i18n';

interface SidebarArticle {
  id: string;
  title: string;
  originalTitle?: string | null;
  slug: string;
  views: number;
  publishedAt: Date | null;
}

interface SidebarProps {
  trending: SidebarArticle[];
  latest: SidebarArticle[];
}

const sidebarCategories = [
  { slug: 'pakistan' },
  { slug: 'world' },
  { slug: 'sports' },
  { slug: 'business' },
  { slug: 'entertainment' },
  { slug: 'technology' },
  { slug: 'health' },
  { slug: 'education' },
  { slug: 'poetry' },
];

export default function Sidebar({ latest }: SidebarProps) {
  const { lang } = useLanguage();

  const stripMarkdown = (s: string) =>
    s.replace(/\[!\[.*?\]\(.*?\)\]|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g, '').trim();

  const latestDisplay = latest.map((a) => {
    const raw = lang === 'en' && a.originalTitle ? a.originalTitle : a.title;
    return { ...a, displayTitle: stripMarkdown(raw) };
  });

  return (
    <aside className="space-y-8">
      {/* Latest */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          {t('sidebar.latest', lang)}
        </h3>
        <div className="space-y-4">
          {latestDisplay.slice(0, 5).map((article, i) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="flex gap-3 group"
            >
              <span className="text-primary-600 font-bold text-lg w-7 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium leading-[1.5] group-hover:text-primary-600">
                  {article.displayTitle}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          {t('sidebar.weather', lang)}
        </h3>
        <WeatherWidget />
      </div>

      {/* Currency & Gold Rates */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          {t('sidebar.rates', lang)}
        </h3>
        <RatesWidget />
      </div>

      {/* Prayer Times */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          {t('sidebar.prayer', lang)}
        </h3>
        <PrayerTimesWidget />
      </div>

      {/* Verse of the Day */}
      <PoetryWidget />

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          {t('sidebar.categories', lang)}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {sidebarCategories.map((cat) => {
            const catName = lang === 'en'
              ? (CATEGORY_ENGLISH_NAMES[cat.slug] || cat.slug)
              : (CATEGORY_URDU_NAMES[cat.slug] || cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="block bg-gray-50 hover:bg-primary-50 hover:text-primary-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-2 rounded-lg transition-colors text-center"
              >
                {catName}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
