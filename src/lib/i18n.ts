export type Language = 'ur' | 'en';

/** Maps category slugs to English display names */
export const CATEGORY_ENGLISH_NAMES: Record<string, string> = {
  pakistan: 'Pakistan',
  world: 'World',
  sports: 'Sports',
  business: 'Business',
  entertainment: 'Entertainment',
  technology: 'Technology',
  health: 'Health',
  education: 'Education',
  poetry: 'Poetry',
};

export const translations: Record<string, { ur: string; en: string }> = {
  'site.name': { ur: 'آزاد خبر', en: 'Azad Khabar' },
  'site.description': { ur: 'پاکستان کی تازہ ترین خبریں', en: 'Latest news from Pakistan' },
  'breaking': { ur: 'بریکنگ', en: 'Breaking' },
  'search.placeholder': { ur: 'خبریں تلاش کریں...', en: 'Search news...' },
  'search.button': { ur: 'تلاش', en: 'Search' },
  'categories.pakistan': { ur: 'پاکستان', en: 'Pakistan' },
  'categories.world': { ur: 'دنیا', en: 'World' },
  'categories.sports': { ur: 'کھیل', en: 'Sports' },
  'categories.business': { ur: 'کاروبار', en: 'Business' },
  'categories.entertainment': { ur: 'شوبز', en: 'Entertainment' },
  'categories.technology': { ur: 'سائنس و ٹیکنالوجی', en: 'Technology' },
  'categories.health': { ur: 'صحت', en: 'Health' },
  'categories.education': { ur: 'تعلیم', en: 'Education' },
  'categories.poetry': { ur: 'شاعری', en: 'Poetry' },
  'latest': { ur: 'تازہ ترین خبریں', en: 'Latest News' },
  'trending': { ur: 'ٹرینڈنگ', en: 'Trending' },
  'more': { ur: 'مزید', en: 'More' },
  'minutes.ago': { ur: 'منٹ پہلے', en: 'minutes ago' },
  'hours.ago': { ur: 'گھنٹے پہلے', en: 'hours ago' },
  'days.ago': { ur: 'دن پہلے', en: 'days ago' },
  'just.now': { ur: 'ابھی', en: 'Just now' },
  'views': { ur: 'ملاحظات', en: 'views' },
  'read.more': { ur: 'مزید پڑھیں', en: 'Read more' },
  'language.toggle': { ur: 'English', en: 'اردو' },
  'theme.dark': { ur: 'ڈارک موڈ', en: 'Dark mode' },
  'theme.light': { ur: 'لائٹ موڈ', en: 'Light mode' },
  'footer.rights': { ur: 'جملہ حقوق محفوظ ہیں', en: 'All rights reserved' },
  'footer.about': { ur: 'ہمارے بارے میں', en: 'About Us' },
  'footer.contact': { ur: 'رابطہ کریں', en: 'Contact Us' },
  'footer.privacy': { ur: 'پرائیویسی پالیسی', en: 'Privacy Policy' },
  'footer.terms': { ur: 'شرائط و ضوابط', en: 'Terms of Service' },
  'updated.every': { ur: 'ہر 30 منٹ بعد اپڈیٹ شدہ', en: 'Updated every 30 minutes' },
  'latest.headlines': { ur: 'تازہ ترین سرخیاں', en: 'Latest Headlines' },
  'newsletter.title': { ur: 'تازہ ترین خبریں اپنی ای میل پر حاصل کریں', en: 'Get latest news in your inbox' },
  'newsletter.description': { ur: 'روزانہ کی اہم خبریں اور خصوصی اپ ڈیٹس براہ راست اپنی ان باکس میں', en: 'Daily top stories and exclusive updates delivered to your inbox' },
  'newsletter.placeholder': { ur: 'ای میل ایڈریس درج کریں', en: 'Enter your email address' },
  'newsletter.subscribe': { ur: 'سبسکرائب کریں', en: 'Subscribe' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}
