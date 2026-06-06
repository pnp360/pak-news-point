'use client';

import { useLanguage } from '@/components/LanguageProvider';

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
    <div className="w-full max-w-[100vw] overflow-hidden bg-[#8b0000] flex items-stretch" style={{ direction: 'rtl' }}>
      <span className="bg-[#ffcc00] text-black font-bold px-4 py-2 text-sm shrink-0 z-10 whitespace-nowrap flex items-center">
        {lang === 'en' ? 'BREAKING' : 'بریکنگ'}
      </span>
      <div className="overflow-hidden min-w-0 py-2 flex-1">
        <div
          className="whitespace-nowrap inline-block hover:[animation-play-state:paused]"
          style={{
            animation: 'infiniteMarquee 35s linear infinite',
            willChange: 'transform',
          }}
        >
          {[...displayArticles, ...displayArticles, ...displayArticles].map((article, i) => (
            <a
              key={`${article.id}-${i}`}
              href={`/news/${article.slug}`}
              className="inline-block text-sm md:text-base text-white hover:underline px-6"
            >
              {article.displayTitle}
              <span className="mx-4 text-[#ffcc00]">◆</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}