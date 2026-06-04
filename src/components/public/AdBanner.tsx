'use client';

interface AdBannerProps {
  format?: 'sidebar' | 'leaderboard' | 'in-content' | 'skyscraper';
}

function AdContent() {
  return (
    <>
      <p className="font-bold text-base md:text-lg text-white leading-[1.75] mb-2 text-center">
        آپ کا اشتہار یہاں ہو سکتا ہے
      </p>
      <p className="text-xs md:text-sm text-white/80 text-center">
        For your ads email us at:
      </p>
      <p
        className="text-xs md:text-sm text-white mt-1 text-center"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.3px' }}
      >
        pnewspoint@gmail.com
      </p>
    </>
  );
}

export default function AdBanner({ format = 'sidebar' }: AdBannerProps) {
  if (format === 'leaderboard') {
    return (
      <div className="w-full bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-center px-4 py-3 max-h-[120px]">
          <AdContent />
        </div>
        <p className="text-[10px] text-white/40 text-center pb-1">اشتہار</p>
      </div>
    );
  }

  if (format === 'in-content') {
    return (
      <div className="w-full bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl overflow-hidden my-6">
        <div className="flex flex-col items-center justify-center px-4 py-6 min-h-[100px]" style={{ height: 'auto' }}>
          <AdContent />
        </div>
        <p className="text-[10px] text-white/40 text-center pb-1">اشتہار</p>
      </div>
    );
  }

  if (format === 'skyscraper') {
    return (
      <div className="w-[160px] min-h-[600px] bg-gradient-to-b from-primary-600 to-primary-800 rounded-xl overflow-hidden">
        <div className="flex flex-col items-center justify-center px-3 py-6 min-h-[560px]" style={{ height: 'auto' }}>
          <p className="font-bold text-sm text-white leading-[1.75] mb-2 text-center">
            آپ کا اشتہار یہاں ہو سکتا ہے
          </p>
          <p className="text-xs text-white/80 text-center">
            For your ads email us at:
          </p>
          <p
            className="text-xs text-white mt-1 text-center"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.3px' }}
          >
            pnewspoint@gmail.com
          </p>
        </div>
        <p className="text-[10px] text-white/40 text-center pb-1">اشتہار</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl overflow-hidden">
      <div className="flex flex-col items-center justify-center px-4 py-5" style={{ height: 'auto' }}>
        <p className="font-bold text-sm text-white leading-[1.75] mb-2 text-center">
          آپ کا اشتہار یہاں ہو سکتا ہے
        </p>
        <p className="text-xs text-white/80 text-center">
          For your ads email us at:
        </p>
        <p
          className="text-xs text-white mt-1 text-center"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.3px' }}
        >
          pnewspoint@gmail.com
        </p>
      </div>
      <p className="text-[10px] text-white/40 text-center pb-1">اشتہار</p>
    </div>
  );
}
