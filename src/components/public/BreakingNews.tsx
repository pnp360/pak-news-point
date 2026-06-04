interface BreakingNewsProps {
  articles: { id: string; title: string; originalTitle?: string | null; slug: string }[];
}

function isUrduText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export default function BreakingNews({ articles }: BreakingNewsProps) {
  const urduArticles = articles.filter((a) => isUrduText(a.title));
  if (urduArticles.length === 0) return null;

  return (
    <div className="bg-red-600 text-white overflow-hidden">
      <div className="flex items-stretch px-6">
        <span className="bg-white text-red-600 px-4 py-2 font-bold text-sm shrink-0 flex items-center ml-6">
          اہم خبر
        </span>
        <div className="overflow-hidden min-w-0 py-2">
          <div
            className="animate-scroll-left whitespace-nowrap inline-block"
            style={{ willChange: 'transform' }}
          >
            {[...urduArticles, ...urduArticles].map((article, i) => (
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
