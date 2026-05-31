import { translateToCleanEnglish } from '@/lib/translate';

interface BreakingNewsProps {
  articles: { id: string; title: string; slug: string }[];
}

export default function BreakingNews({ articles }: BreakingNewsProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <>
      {/* Urdu breaking ticker — slides left to right */}
      <div className="bg-red-600 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center">
          <span className="bg-white text-red-600 px-3 py-1 rounded font-bold text-sm shrink-0">
            اہم خبر
          </span>
          <div className="overflow-hidden flex-1 mr-4">
            <div className="news-ticker-reverse whitespace-nowrap flex gap-12" style={{ direction: 'ltr' }}>
              {[...articles, ...articles].map((article, i) => (
                <a
                  key={`ur-${article.id}-${i}`}
                  href={`/news/${article.slug}`}
                  className="hover:underline inline-block text-sm md:text-base shrink-0"
                  style={{ direction: 'rtl' }}
                >
                  {article.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* English breaking ticker — separate bar, badge on the left */}
      <div className="bg-gray-900 text-gray-200 py-1.5 overflow-hidden border-t border-red-800">
        <div className="container mx-auto px-4 flex items-center" dir="ltr">
          <span className="bg-red-600 text-white px-3 py-0.5 rounded font-bold text-xs shrink-0 uppercase tracking-wider ml-4">
            Breaking
          </span>
          <div className="overflow-hidden flex-1">
            <div
              className="news-ticker whitespace-nowrap flex gap-12"
              style={{ animationDuration: '40s' }}
            >
              {[...articles, ...articles].map((article, i) => (
                <a
                  key={`en-${article.id}-${i}`}
                  href={`/news/${article.slug}`}
                  className="hover:underline inline-block text-xs md:text-sm shrink-0"
                >
                  {translateToCleanEnglish(article.title)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
