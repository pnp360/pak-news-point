'use client';

import { useState } from 'react';

/* ──────────────────────── Data ──────────────────────── */

interface Poet {
  name: string;
  era: string;
  description: string;
  category: string;
  image: string;
}

interface Couplet {
  first: string;
  second: string;
  poet: string;
  genre: string;
}

const poets: Poet[] = [
  { name: 'مرزا غالب', era: '1797–1869', description: 'غزل کے بادشاہ، فارسی و اردو کے عظیم شاعر', category: 'کلاسیکی غزل', image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Mirza_Ghalib_portrait.jpg' },
  { name: 'میر تقی میر', era: '1723–1810', description: 'غزل کی تلخیوں کے ترجمان، میرے الفاظوں کے شاعر', category: 'کلاسیکی غزل', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png' },
  { name: 'مرزا انیس', era: '1803–1874', description: 'مرثیہ نگاری کے امام، کربلا کے شاعر', category: 'مرثیہ و نوحہ', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png' },
  { name: 'مرزا دبیر', era: '1803–1875', description: 'مرثیہ گو شاعر، انیس کے ہم عصر', category: 'مرثیہ و نوحہ', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png' },
  { name: 'علامہ اقبال', era: '1877–1938', description: 'شاعر مشرق، فلسفی، نظریہ پاکستان کے خالق', category: 'فلسفیانہ و قومی', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Allama_Iqbal_1934.jpg' },
  { name: 'فیض احمد فیض', era: '1911–1984', description: 'انقلابی شاعر، محبت اور انصاف کے ترجمان', category: 'فلسفیانہ و قومی', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Faiz_Ahmed_Faiz_1969.jpg' },
  { name: 'احمد فراز', era: '1934–2008', description: 'جدید غزل کے بے تاج بادشاہ', category: 'فلسفیانہ و قومی', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png' },
  { name: 'جان ایلیا', era: '1931–2002', description: 'جدید شاعری کے منفرد لہجے، باغی اور فلسفیانہ شاعر', category: 'فلسفیانہ و قومی', image: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Jaun_Elia.jpg' },
];

const coupletOfTheDay: Couplet = {
  first: 'رنجش ہی سہی دل ہی دکھانے کے لیے آ',
  second: 'آ، پھر سے مجھے چھوڑ کے جانے کے لیے آ',
  poet: 'فیض احمد فیض',
  genre: 'غزل',
};

const couplets: Couplet[] = [
  { first: 'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے', second: 'بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے', poet: 'مرزا غالب', genre: 'غزل' },
  { first: 'دل ہی تو ہے نہ سنگ و خشت درد سے بھر نہ آئے کیوں', second: 'روئیں گے ہم ہزار بار کوئی ہمیں ستائے کیوں', poet: 'مرزا غالب', genre: 'غزل' },
  { first: 'مت پوچھ کہ میرا کوئی پتہ کیا ہے', second: 'اتنا بتا دوں کہ تیرا پتہ کیا ہے', poet: 'احمد فراز', genre: 'غزل' },
  { first: 'یہ بستی ہے شعروں کی یہاں تنقید کیا ہوگی', second: 'یہاں تو ہر کوئی شاعر ہے اگر تنقید کیا ہوگی', poet: 'میر تقی میر', genre: 'غزل' },
  { first: 'نہ تھا کچھ تو خدا تھا کچھ نہ ہوتا تو خدا ہوتا', second: 'ڈبویا مجھ کو ہونے نے نہ ہوتا میں تو کیا ہوتا', poet: 'مرزا غالب', genre: 'غزل' },
  { first: 'ہوائیوں میں یہ بتاتی ہیں کہ نہ جانے کب', second: 'کسے خبر ہے کہ دنیا میں کیا ہوا چاہے', poet: 'مرزا انیس', genre: 'مرثیہ' },
  { first: 'خودی کو کر بلند اتنا کہ ہر تقدیر سے پہلے', second: 'خدا بندے سے خود پوچھے بتا تیری رضا کیا ہے', poet: 'علامہ اقبال', genre: 'نظم' },
  { first: 'مؤذن نے کہا اللہ اکبر میں نے سوچا', second: 'بہت خوب مگر کس کی حکومت جا رہی ہے آج', poet: 'فیض احمد فیض', genre: 'نظم' },
  { first: 'اب کے ہم بچھڑے تو شاید کبھی خوابوں میں ملیں', second: 'جس طرح سوکھے ہوئے پھول کتابوں میں ملیں', poet: 'احمد فراز', genre: 'غزل' },
  { first: 'دنیا نے تیری یاد سے بیگانہ کر دیا', second: 'اتنا تو بتا دے تو کسے مانا کر دیا', poet: 'میر تقی میر', genre: 'غزل' },
  { first: 'غم سے زیادہ اس غم کے احساس نے مارا', second: 'یوں تو ہر موڑ پہ تنہائی تھی لیکن کچھ اور بھی تھا', poet: 'جان ایلیا', genre: 'غزل' },
  { first: 'ہم کہاں کے سچے تھے کبھی تم نے دیکھا ہی نہیں', second: 'ہم نے خود کو بھی جھٹلایا تو تم نے مانا نہیں', poet: 'جان ایلیا', genre: 'غزل' },
];

/* ──────────────────────── PoetCard ──────────────────────── */

function PoetCard({ poet, gradient }: { poet: Poet; gradient: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex items-center hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm ml-4 flex-shrink-0">
        {!imgError ? (
          <img
            src={poet.image}
            alt={poet.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-white text-sm font-bold ${gradient}`}>
            {poet.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="font-nastaliq">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-[2]">{poet.name}</h4>
        <p className="text-xs text-gray-400 dark:text-gray-500">{poet.era}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-[1.8]">{poet.description}</p>
      </div>
    </div>
  );
}

/* ──────────────────────── Helpers ──────────────────────── */

const poetImageMap = new Map<string, string>(
  poets.map(p => [p.name, p.image])
);

function getPoetImage(name: string): string | undefined {
  return poetImageMap.get(name);
}

function PoetAvatar({ name, size = 9 }: { name: string; size?: number }) {
  const [error, setError] = useState(false);
  const src = getPoetImage(name);
  const px = size * 4;

  if (!src || error) return null;

  return (
    <img
      src={src}
      alt={name}
      width={px}
      height={px}
      className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-sm shrink-0"
      onError={() => setError(true)}
    />
  );
}

function formatCoupletForShare(c: Couplet): string {
  return `"${c.first}\n${c.second}"\n\n— ${c.poet}\n— Shared via Azad Khabar`;
}

/* ──────────────────────── CoupletCard ──────────────────────── */

function CoupletCard({ couplet }: { couplet: Couplet }) {
  const [toast, setToast] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatCoupletForShare(couplet));
    } catch {
      const ta = document.createElement('textarea');
      ta.value = formatCoupletForShare(couplet);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(formatCoupletForShare(couplet));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <article className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Genre tag */}
      <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
        {couplet.genre}
      </span>

      {/* Couplet text */}
      <div className="font-nastaliq leading-[2.5] space-y-1 mb-4">
        <p className="text-base md:text-lg text-gray-900 dark:text-gray-100">{couplet.first}</p>
        <p className="text-base md:text-lg text-gray-900 dark:text-gray-100">{couplet.second}</p>
      </div>

      {/* Poet name + avatar */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <PoetAvatar name={couplet.poet} size={8} />
        <p className="text-xs text-gray-500 dark:text-gray-400">{couplet.poet}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
          title="کاپی کریں"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span>کاپی</span>
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
          title="واٹس ایپ پر شیئر کریں"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          <span>شیئر</span>
        </button>
      </div>
    </article>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function PoetryPage() {
  const [toastMsg, setToastMsg] = useState('');

  const handleCopyOfDay = async (c: Couplet) => {
    try {
      await navigator.clipboard.writeText(formatCoupletForShare(c));
    } catch {
      const ta = document.createElement('textarea');
      ta.value = formatCoupletForShare(c);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setToastMsg('شعر کاپی ہو گیا!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleWhatsAppOfDay = (c: Couplet) => {
    const text = encodeURIComponent(formatCoupletForShare(c));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <>
      <div className="mx-auto px-4 py-6" style={{ maxWidth: '1200px' }}>
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
            {/* Decorative corner glow */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-6 py-10 md:px-12 md:py-14 text-center">
              {/* Badge */}
              <span className="inline-block bg-primary-600/20 text-primary-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-primary-500/30">
                شعرِ آج
              </span>

              {/* Couplet */}
              <div className="font-nastaliq leading-[3] text-white mb-4 max-w-2xl mx-auto">
                <p className="text-xl md:text-2xl lg:text-3xl">{coupletOfTheDay.first}</p>
                <p className="text-xl md:text-2xl lg:text-3xl">{coupletOfTheDay.second}</p>
              </div>

              {/* Poet + genre */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <PoetAvatar name={coupletOfTheDay.poet} size={8} />
                  <span>{coupletOfTheDay.poet}</span>
                </div>
                <span className="w-px h-3 bg-gray-600" />
                <span className="text-primary-400">{coupletOfTheDay.genre}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleCopyOfDay(coupletOfTheDay)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm px-5 py-2.5 rounded-xl transition-colors border border-white/10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span>کاپی کریں</span>
                </button>
                <button
                  onClick={() => handleWhatsAppOfDay(coupletOfTheDay)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  <span>واٹس ایپ پر شیئر کریں</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ──────── Master Poets ──────── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 bg-primary-600 rounded inline-block" />
            شعرائے عظام
          </h2>

          {/* Classical Ghazal */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wide">کلاسیکی غزل</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {poets.filter(p => p.category === 'کلاسیکی غزل').map(poet => (
                <PoetCard key={poet.name} poet={poet} gradient="bg-gradient-to-br from-primary-500 to-primary-700" />
              ))}
            </div>
          </div>

          {/* Marsiya & Elegiac */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wide">مرثیہ و نوحہ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {poets.filter(p => p.category === 'مرثیہ و نوحہ').map(poet => (
                <PoetCard key={poet.name} poet={poet} gradient="bg-gradient-to-br from-gray-700 to-gray-900" />
              ))}
            </div>
          </div>

          {/* Philosophical / National */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 tracking-wide">فلسفیانہ و قومی</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {poets.filter(p => p.category === 'فلسفیانہ و قومی').map(poet => (
                <PoetCard key={poet.name} poet={poet} gradient="bg-gradient-to-br from-amber-600 to-amber-800" />
              ))}
            </div>
          </div>
        </section>

        {/* ──────── Featured Couplets ──────── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 bg-primary-600 rounded inline-block" />
            منتخب اشعار
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {couplets.map((c, i) => (
              <CoupletCard key={i} couplet={c} />
            ))}
          </div>
        </section>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-nastaliq animate-slideDown">
          {toastMsg}
        </div>
      )}
    </>
  );
}
