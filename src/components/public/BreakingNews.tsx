import { translateToEnglish } from '@/lib/translate';

interface BreakingNewsProps {
  articles: { id: string; title: string; slug: string }[];
}

export default function BreakingNews({ articles }: BreakingNewsProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center">
        <span className="bg-white text-red-600 px-3 py-1 rounded font-bold text-sm ml-4 shrink-0">
          بریکنگ
        </span>
        <div className="overflow-hidden flex-1 relative">
          {/* Urdu ticker */}
          <div className="news-ticker whitespace-nowrap flex gap-12" style={{ direction: 'ltr' }}>
            {[...articles, ...articles].map((article, i) => (
              <a
                key={`ur-${article.id}-${i}`}
                href={`/news/${article.slug}`}
                className="hover:underline inline-block text-sm md:text-base"
                style={{ direction: 'rtl' }}
              >
                {article.title}
              </a>
            ))}
          </div>
          {/* English ticker */}
          <div
            className="news-ticker whitespace-nowrap flex gap-12"
            style={{ direction: 'ltr', animationDuration: '40s' }}
          >
            {[...articles, ...articles].map((article, i) => (
              <a
                key={`en-${article.id}-${i}`}
                href={`/news/${article.slug}`}
                className="hover:underline inline-block text-xs md:text-sm opacity-80"
                style={{ direction: 'ltr' }}
              >
                {translateToEnglish(article.title)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
