import { useState, useEffect } from 'react';

interface NewsArticle {
  id: string | number;
  title: string;
  category?: string;
  description?: string;
  image?: string;
}

// Dictionary to automatically clean up broken machine translations
const TRANSLATION_MAP: Record<string, string> = {
  'ای': 'مصنوعی ذہانت (AI)',
  'اک': 'برطانیہ (UK)',
  '- business live': '',
  'پڑھیں:': 'تفصیلات:',
};

// Helper function to clean text before displaying
const sanitizeUrduText = (text: string): string => {
  let cleanText = text;
  Object.keys(TRANSLATION_MAP).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b|${key}`, 'g');
    cleanText = cleanText.replace(regex, TRANSLATION_MAP[key]);
  });
  return cleanText;
};

// Fisher-Yates Shuffling Algorithm to rotate news randomly
const rotateAndSanitize = (newsArray: NewsArticle[]): NewsArticle[] => {
  const shuffled = [...newsArray];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 4).map((article) => ({
    ...article,
    title: sanitizeUrduText(article.title),
    description: article.description ? sanitizeUrduText(article.description) : '',
  }));
};

interface DynamicNewsEngineProps {
  initialNewsData: NewsArticle[];
}

export default function DynamicNewsEngine({ initialNewsData }: DynamicNewsEngineProps) {
  const [displayedNews, setDisplayedNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    if (initialNewsData) {
      setDisplayedNews(rotateAndSanitize(initialNewsData));
    }

    const THIRTY_MINUTES = 30 * 60 * 1000;
    const newsRotator = setInterval(() => {
      setDisplayedNews(rotateAndSanitize(initialNewsData));
    }, THIRTY_MINUTES);

    return () => clearInterval(newsRotator);
  }, [initialNewsData]);

  return (
    <div className="w-full bg-gray-950 text-white p-6 rtl" dir="rtl">
      <h2 className="text-xl font-bold border-b-2 border-red-600 pb-2 mb-6 text-red-500">
        🔥 تازہ ترین اپڈیٹس (ہر 30 منٹ بعد خودکار تبدیلی)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedNews.map((article) => (
          <div
            key={article.id}
            className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-500"
          >
            <div className="relative h-48 w-full bg-gray-800">
              <img
                src={article.image || 'https://azadkhabar.vercel.app/fallback-logo.png'}
                alt="News"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                {article.category || 'تازہ ترین'}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-md font-semibold leading-relaxed text-gray-100 hover:text-red-400 cursor-pointer">
                {article.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
