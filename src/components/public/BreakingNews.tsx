'use client';

interface BreakingNewsProps {
  articles: { id: string; title: string; slug: string }[];
}

export default function BreakingNews({ articles }: BreakingNewsProps) {
  if (articles.length === 0) return null;

  return (
    <div className="breaking-ticker-container shadow-lg">
      <span className="bg-[#ffcc00] text-black font-bold px-4 py-2.5 text-sm shrink-0 z-10 whitespace-nowrap flex items-center relative">
        <svg className="w-3.5 h-3.5 ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM13 14h-2v-4h2v4zm0 4h-2v-2h2v2z"/></svg>
        بریکنگ
      </span>
      <div className="overflow-hidden min-w-0 flex-1">
        <div className="marquee-track py-2.5">
          {[...articles, ...articles, ...articles].map((article, i) => (
            <a
              key={`${article.id}-${i}`}
              href={`/news/${article.slug}`}
              className="ticker-item"
            >
              {article.title}
              <span className="mx-4 text-[#ffcc00]">◆</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
