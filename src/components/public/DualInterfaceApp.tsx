'use client';

import { useState, useEffect } from 'react';

// Simulated database that holds both English and native rewritten Urdu content
const BILINGUAL_NEWS_DATA = [
  {
    id: 1,
    en: {
      title: "Sohail Afridi challenges Sheikh Waqas over upcoming June 10 protests.",
      category: "Pakistan",
      summary: "Chief Minister Sohail Afridi issued a direct political challenge regarding the demonstrations planned for June 10."
    },
    ur: {
      title: "10 جون کے احتجاج پر وزیراعلیٰ سہیل آفریدی نے شیخ وقاص کو اوپن چیلنج دے دیا۔",
      category: "پاکستان",
      summary: "وزیراعلیٰ سہیل آفریدی نے 10 جون کو ہونے والے احتجاجی مظاہروں کے حوالے سے سیاسی چیلنج جاری کر دیا۔"
    },
    imageUrl: "https://www.geonewsurdu.tv/assets/news/2026/protest.jpg"
  }
];

export default function DualInterfaceApp() {
  // Default language set to Urdu ('ur'). Can switch to English ('en').
  const [lang, setLang] = useState('ur');

  // Dynamically update the HTML document attributes whenever the language changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <div className={`min-h-screen bg-gray-950 text-gray-100 transition-all duration-300 ${lang === 'ur' ? 'font-serif' : 'font-sans'}`}>
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="border-b border-gray-800 bg-gray-900 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <h1 className="text-2xl font-bold tracking-wider text-red-500">
            {lang === 'ur' ? 'آزاد خبر' : 'AZAD KHABAR'}
          </h1>

          {/* Interactive Language Toggle Button */}
          <button
            onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition-all text-sm uppercase tracking-wider"
          >
            {lang === 'ur' ? 'English Interface' : 'اردو انٹرفیس'}
          </button>
          
        </div>
      </header>

      {/* DYNAMIC NEWS GRID SECTION */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-6">
          <h2 className="text-xl font-bold text-gray-300">
            {lang === 'ur' ? 'تازہ ترین سرخیاں' : 'Latest Headlines'}
          </h2>
          <span className="text-xs text-gray-500">
            {lang === 'ur' ? 'ہر 30 منٹ بعد اپڈیٹ شدہ' : 'Updated every 30 minutes'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BILINGUAL_NEWS_DATA.map((news) => {
            // Pick content object based on chosen interface language state
            const content = lang === 'ur' ? news.ur : news.en;

            return (
              <div 
                key={news.id} 
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-600 transition-all group shadow-xl"
              >
                {/* News Image Wrapper */}
                <div className="relative h-52 w-full bg-gray-800 overflow-hidden">
                  <img 
                    src={news.imageUrl} 
                    alt="News Thumbnail" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://azadkhabar.vercel.app/fallback-logo.png";
                    }}
                  />
                  {/* Category Tag Position automatically shifts using Tailwind LTR/RTL features */}
                  <span className={`absolute top-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-md ${lang === 'ur' ? 'right-3' : 'left-3'}`}>
                    {content.category}
                  </span>
                </div>

                {/* News Wording Content Container */}
                <div className="p-5">
                  <h3 className={`text-lg font-bold leading-snug mb-3 text-gray-100 group-hover:text-red-400 transition-colors ${lang === 'ur' ? 'leading-relaxed' : ''}`}>
                    {content.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {content.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

    </div>
  );
}
