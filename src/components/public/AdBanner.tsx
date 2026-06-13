'use client';

interface AdBannerProps {
  format?: 'sidebar' | 'leaderboard' | 'in-content' | 'skyscraper';
}

function AdContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center w-full py-2">
      <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
      <div>
        <p className="font-bold text-sm text-white/80">آپ کا اشتہار یہاں ہو سکتا ہے</p>
        <p className="text-xs text-white/50 mt-0.5">
          pnewspoint@gmail.com
        </p>
      </div>
    </div>
  );
}

export default function AdBanner({ format = 'sidebar' }: AdBannerProps) {
  const baseClasses = 'border-2 border-dashed border-white/20 bg-gradient-to-br from-primary-700/80 to-primary-900/80 backdrop-blur-sm';

  if (format === 'leaderboard') {
    return (
      <div className={`w-full rounded-xl overflow-hidden ${baseClasses}`}>
        <div className="flex items-center justify-center px-4 py-4">
          <AdContent />
        </div>
        <p className="text-[10px] text-white/30 text-center pb-1.5 tracking-widest uppercase">—— اشتہار ——</p>
      </div>
    );
  }

  if (format === 'in-content') {
    return (
      <div className={`w-full rounded-xl overflow-hidden my-8 ${baseClasses}`}>
        <div className="flex items-center justify-center px-4 py-8">
          <AdContent />
        </div>
        <p className="text-[10px] text-white/30 text-center pb-1.5 tracking-widest uppercase">—— اشتہار ——</p>
      </div>
    );
  }

  if (format === 'skyscraper') {
    return (
      <div className={`w-full rounded-xl overflow-hidden ${baseClasses}`}>
        <div className="flex items-center justify-center px-3 py-10 min-h-[300px]">
          <AdContent />
        </div>
        <p className="text-[10px] text-white/30 text-center pb-1.5 tracking-widest uppercase">—— اشتہار ——</p>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-xl overflow-hidden ${baseClasses}`}>
      <div className="flex items-center justify-center px-4 py-6">
        <AdContent />
      </div>
      <p className="text-[10px] text-white/30 text-center pb-1.5 tracking-widest uppercase">—— اشتہار ——</p>
    </div>
  );
}
