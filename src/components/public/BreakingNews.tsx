'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

interface BreakingNewsProps {
  articles: { id: string; title: string; originalTitle?: string | null; slug: string }[];
}

export default function BreakingNews({ articles }: BreakingNewsProps) {
  const { lang } = useLanguage();

  const displayArticles = articles.map((a) => ({
    ...a,
    displayTitle: lang === 'en' && a.originalTitle ? a.originalTitle : a.title,
  }));

  if (displayArticles.length === 0) return null;

  return (
    <div className="bg-red-600 text-white overflow-hidden">
      <div className="flex items-stretch px-6">
        <span className="bg-white text-red-600 px-4 py-2 font-bold text-sm shrink-0 flex items-center ml-6">
          {lang === 'en' ? 'Breaking' : 'اہم خبر'}
        </span>
        <div className="overflow-hidden min-w-0 py-2">
          <div
            className="animate-scroll-left whitespace-nowrap inline-block"
            style={{ willChange: 'transform' }}
          >
            {[...displayArticles, ...displayArticles].map((article, i) => (
              <a
                key={`${article.id}-${i}`}
                href={`/news/${article.slug}`}
                className="hover:underline inline-block text-sm md:text-base mx-4"
              >
                {article.displayTitle}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
