interface BreakingNewsProps {
  articles: { id: string; title: string; originalTitle?: string | null; slug: string }[];
}

export default function BreakingNews({ articles }: BreakingNewsProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center">
        <span className="bg-white text-red-600 px-3 py-1 rounded font-bold text-sm shrink-0 ml-4">
          اہم خبر
        </span>
        <div className="overflow-hidden flex-1">
          <div className="animate-scroll-left whitespace-nowrap inline-block" style={{ animationDuration: '40s' }}>
            {[...articles, ...articles].map((article, i) => (
              <a
                key={`ur-${article.id}-${i}`}
                href={`/news/${article.slug}`}
                className="hover:underline inline-block text-sm md:text-base mx-4"
              >
                {article.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
