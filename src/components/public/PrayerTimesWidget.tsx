'use client';

import { useEffect, useState } from 'react';

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

  const current = data[method];
  const other = method === 'sunni' ? 'jafari' : 'sunni';
  const mainPrayers = current.prayerTimes.filter(
    (p) => p.name !== 'Sunrise'
  );

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
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
      <div className="space-y-1.5">
        {mainPrayers.map((prayer) => {
          const otherPrayer = other
            ? data[other].prayerTimes.find((p) => p.name === prayer.name)
            : null;
          return (
            <div
              key={prayer.name}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{PRAYER_ICONS[prayer.name] || '🕋'}</span>
                <span className="text-sm font-medium text-gray-700">
                  {prayer.nameUrdu}
                </span>
              </div>
              <div className="flex items-center gap-2" dir="ltr">
                {otherPrayer && otherPrayer.time !== prayer.time && (
                  <span className="text-xs text-gray-400 line-through">
                    {otherPrayer.time}
                  </span>
                )}
                <span className="text-sm font-bold text-green-800">
                  {prayer.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
