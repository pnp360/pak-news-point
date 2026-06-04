import Link from 'next/link';
import WeatherWidget from './WeatherWidget';
import PrayerTimesWidget from './PrayerTimesWidget';
import RatesWidget from './RatesWidget';
import PoetryWidget from './PoetryWidget';

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

export default function Sidebar({ trending, latest }: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Trending */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          تازہ ترین
        </h3>
        <div className="space-y-4">
          {latest.filter((a) => /[\u0600-\u06FF]/.test(a.title)).slice(0, 5).map((article, i) => (
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
                  {article.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          موسم
        </h3>
        <WeatherWidget />
      </div>

      {/* Currency & Gold Rates */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          زر مبادلہ کی شرح
        </h3>
        <RatesWidget />
      </div>

      {/* Prayer Times */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          اوقات نماز
        </h3>
        <PrayerTimesWidget />
      </div>

      {/* Verse of the Day */}
      <PoetryWidget />

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
          اقسام
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'پاکستان', slug: 'pakistan' },
            { name: 'دنیا', slug: 'world' },
            { name: 'کھیل', slug: 'sports' },
            { name: 'کاروبار', slug: 'business' },
            { name: 'شوبز', slug: 'entertainment' },
            { name: 'سائنس و ٹیکنالوجی', slug: 'technology' },
            { name: 'صحت', slug: 'health' },
            { name: 'تعلیم', slug: 'education' },
            { name: 'شاعری', slug: 'poetry' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="block bg-gray-50 hover:bg-primary-50 hover:text-primary-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-2 rounded-lg transition-colors text-center"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
