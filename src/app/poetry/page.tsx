'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

/* ──────────────────────── Master Poetry Data ──────────────────────── */

interface PoetEntry {
  id: number;
  poet: string;
  verse: string;
  image: string;
  category: string;
  era: string;
}

const MASTER_POETS: PoetEntry[] = [
  {
    id: 1,
    poet: 'مرزا غالب',
    verse: 'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے\nبہت نکلے مرے ارمان لیکن پھر بھی کم نکلے',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Mirza_Ghalib_portrait.jpg',
    category: 'غزل',
    era: 'کلاسیکی',
  },
  {
    id: 2,
    poet: 'علامہ اقبال',
    verse: 'خودی کو کر بلند اتنا کہ ہر تقدیر سے پہلے\nخدا بندے سے خود پوچھے بتا تیری رضا کیا ہے',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Allama_Iqbal_1934.jpg',
    category: 'نظم',
    era: 'جدید',
  },
  {
    id: 3,
    poet: 'فیض احمد فیض',
    verse: 'مجھ سے پہلی سی محبت مرے محبوب نہ مانگ\nمیں نے سمجھا تھا کہ تو ہے تو درخشاں ہے حیات',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Faiz_Ahmed_Faiz_1969.jpg',
    category: 'غزل',
    era: 'جدید',
  },
  {
    id: 4,
    poet: 'جان ایلیا',
    verse: 'شرم، وحشت، جھجک، پریشانی\nناز سے کام کیوں نہیں لیتیں',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Jaun_Elia.jpg',
    category: 'غزل',
    era: 'جدید',
  },
  {
    id: 5,
    poet: 'میر تقی میر',
    verse: 'پتہ پتہ بوٹا بوٹا حال ہمارا جانے ہے\nجانے نہ جانے گل ہی نہ جانے باغ تو سارا جانے ہے',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'غزل',
    era: 'کلاسیکی',
  },
  {
    id: 6,
    poet: 'احمد فراز',
    verse: 'اب کے ہم بچھڑے تو شاید کبھی خوابوں میں ملیں\nجس طرح سوکھے ہوئے پھول کتابوں میں ملیں',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'غزل',
    era: 'جدید',
  },
  {
    id: 7,
    poet: 'پروین شاکر',
    verse: 'مجھے بھی یاد ہے وہ شخص کس طرح ملا تھا\nکہ جیسے کھوئی ہوئی چیز مل گئی ہو',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'غزل',
    era: 'جدید',
  },
  {
    id: 8,
    poet: 'حبیب جالب',
    verse: 'دشمنوں کی بھیڑ میں تنہا کھڑا ہے کون ہے\nوہ جو اکثر کہتا ہے انصاف کا تقاضا کرو',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'نظم',
    era: 'جدید',
  },
  {
    id: 9,
    poet: 'ناصر کاظمی',
    verse: 'یہ بھی کوئی بات ہوئی جانے کیوں ملنے آئے\nاک سوالی تو نہیں تھے کہ دعا لے کر چلے',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'غزل',
    era: 'جدید',
  },
  {
    id: 10,
    poet: 'منیر نیازی',
    verse: 'اک پھول کے چہرے پہ ہنسی اور تھی\nاس کو تو خزاں کی بھی خبر ہو گئی',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'غزل',
    era: 'جدید',
  },
  {
    id: 11,
    poet: 'مرزا انیس',
    verse: 'ہوائیوں میں یہ بتاتی ہیں کہ نہ جانے کب\nکسے خبر ہے کہ دنیا میں کیا ہوا چاہے',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'مرثیہ',
    era: 'کلاسیکی',
  },
  {
    id: 12,
    poet: 'مرزا دبیر',
    verse: 'جب تمنا ہی نہ رہی تو آرزو کیا چیز ہے\nدل ہی جب بے تاب ہے تو مضطربی کیا چیز ہے',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'مرثیہ',
    era: 'کلاسیکی',
  },
  {
    id: 13,
    poet: 'قطیل شفائی',
    verse: 'ہم سے پوچھو کہ محبت میں کیا کیا دیکھا\nاک نظر اور پھر صدیوں کا سفر دیکھا',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    category: 'غزل',
    era: 'جدید',
  },
  {
    id: 14,
    poet: 'فیض احمد فیض',
    verse: 'مؤذن نے کہا اللہ اکبر میں نے سوچا\nبہت خوب مگر کس کی حکومت جا رہی ہے آج',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Faiz_Ahmed_Faiz_1969.jpg',
    category: 'نظم',
    era: 'جدید',
  },
];

const FEATURED_COUPLETS: { first: string; second: string; poet: string; genre: string }[] = [
  { first: 'دل ہی تو ہے نہ سنگ و خشت درد سے بھر نہ آئے کیوں', second: 'روئیں گے ہم ہزار بار کوئی ہمیں ستائے کیوں', poet: 'مرزا غالب', genre: 'غزل' },
  { first: 'مقدور ہو تو خاک سے پوچھوں کہ اے لئیم', second: 'تو نے وہ گنج ہائے گراں مایہ کیا کیے', poet: 'مرزا غالب', genre: 'غزل' },
  { first: 'نہ تھا کچھ تو خدا تھا کچھ نہ ہوتا تو خدا ہوتا', second: 'ڈبویا مجھ کو ہونے نے نہ ہوتا میں تو کیا ہوتا', poet: 'مرزا غالب', genre: 'غزل' },
  { first: 'ہوائیوں میں یہ بتاتی ہیں کہ نہ جانے کب', second: 'کسے خبر ہے کہ دنیا میں کیا ہوا چاہے', poet: 'مرزا انیس', genre: 'مرثیہ' },
  { first: 'مؤذن نے کہا اللہ اکبر میں نے سوچا', second: 'بہت خوب مگر کس کی حکومت جا رہی ہے آج', poet: 'فیض احمد فیض', genre: 'نظم' },
  { first: 'مجھ سے پہلی سی محبت مرے محبوب نہ مانگ', second: 'میں نے سمجھا تھا کہ تو ہے تو درخشاں ہے حیات', poet: 'فیض احمد فیض', genre: 'غزل' },
  { first: 'دشمنوں کی بھیڑ میں تنہا کھڑا ہے کون ہے', second: 'وہ جو اکثر کہتا ہے انصاف کا تقاضا کرو', poet: 'حبیب جالب', genre: 'نظم' },
  { first: 'یہ بھی کوئی بات ہوئی جانے کیوں ملنے آئے', second: 'اک سوالی تو نہیں تھے کہ دعا لے کر چلے', poet: 'ناصر کاظمی', genre: 'غزل' },
  { first: 'اک پھول کے چہرے پہ ہنسی اور تھی', second: 'اس کو تو خزاں کی بھی خبر ہو گئی', poet: 'منیر نیازی', genre: 'غزل' },
  { first: 'ہم سے پوچھو کہ محبت میں کیا کیا دیکھا', second: 'اک نظر اور پھر صدیوں کا سفر دیکھا', poet: 'قطیل شفائی', genre: 'غزل' },
  { first: 'جب تمنا ہی نہ رہی تو آرزو کیا چیز ہے', second: 'دل ہی جب بے تاب ہے تو مضطربی کیا چیز ہے', poet: 'مرزا دبیر', genre: 'مرثیہ' },
  { first: 'کچھ لوگ رہتے ہیں یاد رہنے کے لیے', second: 'بس ایک پل کی بات نہیں زندگی بھر کے لیے', poet: 'ناصر کاظمی', genre: 'غزل' },
];

/* ──────────────────────── Utilities ──────────────────────── */

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dailyIndex(arrLength: number): number {
  const today = getTodayString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % arrLength;
}

const CACHE_KEY = 'azadkhabar_poetry_hero';

function getVerseOfDay(): PoetEntry {
  const idx = dailyIndex(MASTER_POETS.length);
  const candidate = MASTER_POETS[idx];
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const today = getTodayString();
      if (cached) {
        const parsed = JSON.parse(cached) as { date: string; poet: string; verse: string; image: string; category: string };
        if (parsed.date === today) {
          return { id: 0, poet: parsed.poet, verse: parsed.verse, image: parsed.image, category: parsed.category, era: '' };
        }
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, poet: candidate.poet, verse: candidate.verse, image: candidate.image, category: candidate.category }));
    } catch {}
  }
  return candidate;
}

function shareText(first: string, second: string, poet: string): string {
  return `"${first}\n${second}"\n\n— ${poet}\n— Shared via Azad Khabar`;
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

function openWhatsApp(text: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

/* ──────────────────────── Components ──────────────────────── */

function PoetPortrait({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-amber-500 to-amber-700 flex-shrink-0 border-2 border-gray-200">
        {alt.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 bg-white"
      onError={() => setError(true)}
    />
  );
}

function PoetryCard({ item, index }: { item: PoetEntry; index: number }) {
  const [toast, setToast] = useState(false);
  const [first, second] = item.verse.split('\n');

  const handleCopy = async () => {
    await copyToClipboard(shareText(first, second, item.poet));
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handleWhatsApp = () => {
    openWhatsApp(shareText(first, second, item.poet));
  };

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-0 hover:shadow-md transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      <PoetPortrait src={item.image} alt={item.poet} />
      <div className="flex-1 min-w-0 font-nastaliq ms-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-block bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {item.category}
          </span>
          <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-2.5 py-0.5 rounded-full">
            {item.era}
          </span>
        </div>
        <div className="leading-[2.2] text-sm md:text-base text-gray-900 dark:text-gray-100">
          <p className="truncate">{first}</p>
          <p className="truncate">{second}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.poet}</p>
          <div className="flex items-center gap-1.5">
            <button onClick={handleCopy} className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-1" title="کاپی کریں">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button onClick={handleWhatsApp} className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors p-1" title="واٹس ایپ پر شیئر کریں">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            </button>
          </div>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-nastaliq animate-fade-in">
          شعر کاپی ہو گیا!
        </div>
      )}
    </article>
  );
}

function CoupletCard({ couplet, index }: { couplet: { first: string; second: string; poet: string; genre: string }; index: number }) {
  const [toast, setToast] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(shareText(couplet.first, couplet.second, couplet.poet));
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handleWhatsApp = () => {
    openWhatsApp(shareText(couplet.first, couplet.second, couplet.poet));
  };

  return (
    <article
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      <span className="inline-block bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
        {couplet.genre}
      </span>
      <div className="font-nastaliq leading-[2.5] space-y-1 mb-4">
        <p className="text-base md:text-lg text-gray-900 dark:text-gray-100">{couplet.first}</p>
        <p className="text-base md:text-lg text-gray-900 dark:text-gray-100">{couplet.second}</p>
      </div>
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">{couplet.poet}</span>
        <PoetPortrait src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" alt={couplet.poet} />
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button onClick={handleCopy} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 text-xs px-3 py-1.5 rounded-lg transition-colors" title="کاپی کریں">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span>کاپی</span>
        </button>
        <button onClick={handleWhatsApp} className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 text-xs px-3 py-1.5 rounded-lg transition-colors" title="واٹس ایپ پر شیئر کریں">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          <span>شیئر</span>
        </button>
      </div>
    </article>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function PoetryPage() {
  const verseOfDay = useMemo(() => getVerseOfDay(), []);
  const [firstVOD, secondVOD] = verseOfDay.verse.split('\n');

  const [shuffledPoets, setShuffledPoets] = useState<PoetEntry[]>([]);
  const [shuffledCouplets, setShuffledCouplets] = useState<typeof FEATURED_COUPLETS>([]);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setShuffledPoets(fisherYatesShuffle(MASTER_POETS));
    setShuffledCouplets(fisherYatesShuffle(FEATURED_COUPLETS));
  }, []);

  const handleShuffle = useCallback(() => {
    setShuffledPoets(fisherYatesShuffle(MASTER_POETS));
    setShuffledCouplets(fisherYatesShuffle(FEATURED_COUPLETS));
    setAnimKey((k) => k + 1);
  }, []);

  const [toastMsg, setToastMsg] = useState('');

  const handleCopyHero = async () => {
    await copyToClipboard(shareText(firstVOD, secondVOD, verseOfDay.poet));
    setToastMsg('شعر کاپی ہو گیا!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleWhatsAppHero = () => {
    openWhatsApp(shareText(firstVOD, secondVOD, verseOfDay.poet));
  };

  return (
    <>
      <div className="mx-auto px-4 py-6" dir="rtl" style={{ maxWidth: '1200px' }}>
        {/* ──────── Page Title ──────── */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-nastaliq leading-[2]">
            اردو شاعری
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
            <span className="h-px w-12 bg-gray-300 dark:bg-gray-600 inline-block" />
            <span className="text-xs tracking-widest">غزل · مرثیہ · نظم</span>
            <span className="h-px w-12 bg-gray-300 dark:bg-gray-600 inline-block" />
          </div>
        </div>

        {/* ──────── Couplet of the Day ──────── */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-6 py-10 md:px-12 md:py-14 text-center">
              <span className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-amber-500/30">
                شعرِ آج
              </span>

              <div className="font-nastaliq leading-[3] text-white mb-4 max-w-2xl mx-auto">
                <p className="text-xl md:text-2xl lg:text-3xl">{firstVOD}</p>
                <p className="text-xl md:text-2xl lg:text-3xl">{secondVOD}</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <PoetPortrait src={verseOfDay.image} alt={verseOfDay.poet} />
                  <span>{verseOfDay.poet}</span>
                </div>
                <span className="w-px h-3 bg-gray-600" />
                <span className="text-amber-400">{verseOfDay.category}</span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCopyHero}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm px-5 py-2.5 rounded-xl transition-colors border border-white/10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span>کاپی کریں</span>
                </button>
                <button
                  onClick={handleWhatsAppHero}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  <span>واٹس ایپ پر شیئر کریں</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ──────── Master Poets Grid ──────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded inline-block" />
              شعرائے عظام
            </h2>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span>مزید شاعری دیکھیں</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" key={animKey}>
            {shuffledPoets.slice(0, 6).map((item, i) => (
              <PoetryCard key={`${item.id}-${i}`} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* ──────── Featured Couplets ──────── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 bg-amber-500 rounded inline-block" />
            منتخب اشعار
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" key={`couplets-${animKey}`}>
            {shuffledCouplets.slice(0, 6).map((c, i) => (
              <CoupletCard key={`${c.poet}-${c.first}-${i}`} couplet={c} index={i} />
            ))}
          </div>
        </section>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-nastaliq animate-fade-in">
          {toastMsg}
        </div>
      )}
    </>
  );
}
