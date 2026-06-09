'use client';

interface BreakingNewsProps {
  articles: { id: string; title: string; slug: string }[];
}

export default function BreakingNews({ articles }: BreakingNewsProps) {
  if (articles.length === 0) return null;

  return (
    <div className="breaking-ticker-container">
      <span className="bg-[#ffcc00] text-black font-bold px-4 py-2 text-sm shrink-0 z-10 whitespace-nowrap flex items-center relative">
        بریکنگ
      </span>
      <div className="overflow-hidden min-w-0 flex-1">
        <div className="marquee-track py-2">
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
