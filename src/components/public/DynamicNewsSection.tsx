import { useState, useEffect } from 'react';

interface NewsItem {
  id: number;
  title: string;
  category: string;
}

const ALL_NEWS_DATA: NewsItem[] = [
  { id: 0, title: 'شاہین نے آسٹریلیا کے خلاف آخری ون ڈے میں باؤنس بیک کرنے کا عزم کیا۔', category: 'پاکستان' },
  { id: 1, title: '10 جون کے احتجاج پر وزیراعلیٰ سہیل آفریدی نے شیخ وقاص کو چیلنج دے دیا۔', category: 'پاکستان' },
  { id: 2, title: 'Lloyds، Halifax اور Bank of Scotland معذرت خواہ ہیں کیونکہ صارفین ایپ کی بندش کی رپورٹ کرتے ہیں۔', category: 'کاروبار' },
  { id: 5, title: 'امریکی نمائندے نے ٹویٹ کرنے پر اپنے عملے پر سنگین الزام لگا دیا۔', category: 'دنیا' },
  { id: 8, title: 'سام سنگ نے موک 2026 میں اسمارٹ مصنوعی ذہانت (AI) گیلیکسی S26 کی نقاب کشائی کی۔', category: 'سائنس و ٹیکنالوجی' },
  { id: 38, title: 'ایران-امریکہ جنگ کی تازہ ترین صورتحال پر ٹرمپ کا ردعمل۔', category: 'دنیا' },
];

function shuffleNews(array: NewsItem[]): NewsItem[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 4);
}

export default function DynamicNewsSection() {
  const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    setDisplayedNews(shuffleNews(ALL_NEWS_DATA));

    const HALF_HOUR = 30 * 60 * 1000;
    const newsInterval = setInterval(() => {
      setDisplayedNews(shuffleNews(ALL_NEWS_DATA));
    }, HALF_HOUR);

    return () => clearInterval(newsInterval);
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-md rtl">
      <h2 className="text-xl font-bold mb-4 border-b border-red-600 pb-2 text-red-500">
        🔥 تازہ ترین اپڈیٹس (ہر 30 منٹ بعد خودکار تبدیلی)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedNews.map((news) => (
          <div
            key={news.id}
            className="p-4 bg-gray-800 rounded border border-gray-700 hover:border-red-500 transition-all duration-500 animate-fade-in"
          >
            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded mb-2 inline-block">
              {news.category}
            </span>
            <h3 className="text-md font-semibold leading-relaxed">{news.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
