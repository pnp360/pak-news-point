'use client';

import { useEffect, useRef, useState } from 'react';

interface PrayerTime {
  name: string;
  nameUrdu: string;
  time: string;
}

interface MethodPrayerTimes {
  prayerTimes: PrayerTime[];
  method: string;
  label: string;
}

interface PrayerTimesData {
  sunni: MethodPrayerTimes;
  jafari: MethodPrayerTimes;
  date: string;
  hijriDate: string;
  city: string;
}

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌅',
  Sunrise: '🌄',
  Dhuhr: '☀️',
  Asr: '🌤',
  Maghrib: '🌇',
  Isha: '🌙',
};

export default function PrayerTimesWidget() {
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<'sunni' | 'jafari'>('sunni');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/prayer-times')
      .then((r) => r.json())
      .then((res) => {
        if (res.sunni?.prayerTimes) {
          setData(res);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const prayers = getMainPrayers();
        return (prev + 1) % prayers.length;
      });
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, data]);

  function getMainPrayers() {
    if (!data) return [];
    return data[method].prayerTimes.filter((p) => p.name !== 'Sunrise');
  }

  if (loading) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-4 w-24 mx-auto bg-gray-200 rounded mb-2" />
        <div className="h-4 w-20 mx-auto bg-gray-200 rounded" />
      </div>
    );
  }

  if (!data?.sunni?.prayerTimes?.length) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">🕌</div>
        <p className="text-gray-600">اوقات نماز جلد آرہی ہیں</p>
      </div>
    );
  }

  const mainPrayers = getMainPrayers();
  const currentPrayer = mainPrayers[currentIndex];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
      {/* Header */}
      <div className="text-center mb-3 pb-3 border-b border-green-200">
        <div className="flex items-center justify-center gap-2 mb-1">
          <button
            onClick={() => setMethod('sunni')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              method === 'sunni'
                ? 'bg-green-700 text-white'
                : 'bg-white/60 text-green-800 hover:bg-white'
            }`}
          >
            احناف
          </button>
          <button
            onClick={() => setMethod('jafari')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              method === 'jafari'
                ? 'bg-green-700 text-white'
                : 'bg-white/60 text-green-800 hover:bg-white'
            }`}
          >
            جعفریہ
          </button>
        </div>
        {data.hijriDate && (
          <p className="text-xs text-green-700">{data.hijriDate}</p>
        )}
      </div>

      {/* Scrolling prayer display */}
      <div className="relative h-16 overflow-hidden">
        <div
          key={currentPrayer?.name || 0}
          className="flex items-center justify-between py-3 px-3 bg-white/60 rounded-lg transition-all duration-500 animate-slideDown absolute inset-x-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {PRAYER_ICONS[currentPrayer?.name || ''] || '🕋'}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {currentPrayer?.nameUrdu || ''}
            </span>
          </div>
          <span className="text-sm font-bold text-green-800 font-mono" dir="ltr">
            {currentPrayer?.time || ''}
          </span>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 mt-3">
        {mainPrayers.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex
                ? 'bg-green-700 w-4'
                : 'bg-green-300 hover:bg-green-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
