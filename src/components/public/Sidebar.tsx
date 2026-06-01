import Link from 'next/link';
import WeatherWidget from './WeatherWidget';
import PrayerTimesWidget from './PrayerTimesWidget';
import RatesWidget from './RatesWidget';

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
          {latest.slice(0, 5).map((article, i) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="flex gap-3 group"
            >
              <span className="text-primary-600 font-bold text-lg w-7 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary-600">
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

      {/* Ad Placeholder */}
      <div className="bg-gray-100 rounded-xl p-5 text-center">
        <p className="text-gray-400 text-sm">اشتہار کی جگہ</p>
        <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg mt-2">
          <span className="text-gray-400">AdSense Ad</span>
        </div>
      </div>
    </aside>
  );
}
