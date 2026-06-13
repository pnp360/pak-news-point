'use client';

import Link from 'next/link';
import WeatherWidget from './WeatherWidget';
import PrayerTimesWidget from './PrayerTimesWidget';
import RatesWidget from './RatesWidget';
import PoetryWidget from './PoetryWidget';
import { CATEGORY_URDU_NAMES } from '@/lib/i18n';

interface SidebarArticle {
  id: string;
  title: string;
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

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
      <span className="w-1.5 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
      <h3 className="text-sm font-bold">{children}</h3>
    </div>
  );
}

export default function Sidebar({ latest }: SidebarProps) {
  const stripMarkdown = (s: string) =>
    s.replace(/\[!\[.*?\]\(.*?\)\]|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g, '').trim();

  const latestDisplay = latest.map((a) => ({
    ...a,
    displayTitle: stripMarkdown(a.title),
  }));

  /* Show articles 6-10 so they differ from the main feed's top 5 */
  const sidebarLatest = latestDisplay.length > 5 ? latestDisplay.slice(5, 10) : latestDisplay.slice(0, 5);

  return (
    <aside className="space-y-5">
      {/* Latest */}
      <div className="card-base p-5">
        <SectionTitle>تازہ ترین</SectionTitle>
        <div className="space-y-3">
          {sidebarLatest.map((article, i) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="flex gap-3 group items-start"
            >
              <span className="text-primary-600/70 font-bold text-base w-6 shrink-0 tabular-nums leading-none mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium leading-[1.6] group-hover:text-primary-600 transition-colors line-clamp-2">
                  {article.displayTitle}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="card-base p-5">
        <SectionTitle>موسم</SectionTitle>
        <WeatherWidget />
      </div>

      {/* Currency & Gold Rates */}
      <div className="card-base p-5">
        <SectionTitle>زر مبادلہ کی شرح</SectionTitle>
        <RatesWidget />
      </div>

      {/* Prayer Times */}
      <div className="card-base p-5">
        <SectionTitle>اوقات نماز</SectionTitle>
        <PrayerTimesWidget />
      </div>

      {/* Verse of the Day */}
      <PoetryWidget />

      {/* Categories */}
      <div className="card-base p-5">
        <SectionTitle>اقسام</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {sidebarCategories.map((cat) => {
            const catName = CATEGORY_URDU_NAMES[cat.slug] || cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="block bg-gray-50 hover:bg-primary-50 hover:text-primary-700 dark:bg-gray-700/50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-2 rounded-lg transition-colors text-center"
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
