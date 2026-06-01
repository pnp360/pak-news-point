interface EnglishBreakingProps {
  articles: { id: string; title: string; originalTitle: string | null; slug: string }[];
}

export default function EnglishBreaking({ articles }: EnglishBreakingProps) {
  const englishOnly = articles.filter((a) => a.originalTitle);
  if (!englishOnly.length) return null;

  return (
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
            {[...englishOnly, ...englishOnly].map((article, i) => (
              <a
                key={`en-${article.id}-${i}`}
                href={`/news/${article.slug}`}
                className="hover:underline inline-block text-xs md:text-sm shrink-0"
              >
                {article.originalTitle}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
