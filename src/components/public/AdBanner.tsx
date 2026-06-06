'use client';

interface AdBannerProps {
  format?: 'sidebar' | 'leaderboard' | 'in-content' | 'skyscraper';
}

function AdContent() {
  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-3 justify-center items-center py-2 text-center w-full">
      <p className="font-bold text-sm md:text-lg text-white leading-[1.75]">
        آپ کا اشتہار یہاں ہو سکتا ہے
      </p>
      <div className="flex flex-wrap items-baseline justify-center gap-1">
        <span className="text-xs md:text-sm text-white/80">
          For your ads email us at:
        </span>
        <span
          className="text-xs md:text-sm text-white font-semibold"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.3px' }}
        >
          pnewspoint@gmail.com
        </span>
      </div>
    </div>
  );
}

export default function AdBanner({ format = 'sidebar' }: AdBannerProps) {
  if (format === 'leaderboard') {
    return (
      <div className="w-full bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-center px-4 py-3">
          <AdContent />
        </div>
        <p className="text-[10px] text-white/40 text-center pb-1">اشتہار</p>
      </div>
    );
  }

  if (format === 'in-content') {
    return (
      <div className="w-full bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl overflow-hidden my-6">
        <div className="flex items-center justify-center px-4 py-6">
          <AdContent />
        </div>
        <p className="text-[10px] text-white/40 text-center pb-1">اشتہار</p>
      </div>
    );
  }

  if (format === 'skyscraper') {
    return (
      <div className="w-[160px] min-h-[600px] bg-gradient-to-b from-primary-600 to-primary-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-center px-3 py-6 min-h-[560px]">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-bold text-sm text-white leading-[1.75]">
              آپ کا اشتہار یہاں ہو سکتا ہے
            </p>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-white/80">
                For your ads email us at:
              </span>
              <span
                className="text-xs text-white font-semibold"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.3px' }}
              >
                pnewspoint@gmail.com
              </span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-white/40 text-center pb-1">اشتہار</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-center px-4 py-5">
        <AdContent />
      </div>
      <p className="text-[10px] text-white/40 text-center pb-1">اشتہار</p>
    </div>
  );
}
