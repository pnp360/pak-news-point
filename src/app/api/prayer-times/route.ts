import { NextResponse } from 'next/server';
import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Prayer,
} from 'adhan';

const LATITUDE = 33.68;
const LONGITUDE = 73.05;
const CITY = 'Islamabad';
const COUNTRY = 'Pakistan';

const PRAYER_NAMES_URDU: Record<string, string> = {
  Fajr: 'فجر',
  Sunrise: 'طلوع آفتاب',
  Dhuhr: 'ظہر',
  Asr: 'عصر',
  Maghrib: 'مغرب',
  Isha: 'عشاء',
};

function getHijriDate(date: Date): string {
  try {
    const hijri = new Intl.DateTimeFormat('ar-SA-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return hijri;
  } catch {
    return '';
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Karachi',
    hour12: false,
  });
}

function calculatePrayerTimes(methodName: 'jafari' | 'sunni') {
  const coords = new Coordinates(LATITUDE, LONGITUDE);
  const date = new Date();

  const params =
    methodName === 'jafari'
      ? CalculationMethod.Tehran()
      : CalculationMethod.Karachi();

  const times = new PrayerTimes(coords, date, params);

  const prayers = [
    { name: 'Fajr', time: times.fajr, prayer: Prayer.Fajr },
    { name: 'Sunrise', time: times.sunrise, prayer: Prayer.Sunrise },
    { name: 'Dhuhr', time: times.dhuhr, prayer: Prayer.Dhuhr },
    { name: 'Asr', time: times.asr, prayer: Prayer.Asr },
    { name: 'Maghrib', time: times.maghrib, prayer: Prayer.Maghrib },
    { name: 'Isha', time: times.isha, prayer: Prayer.Isha },
  ];

  return prayers.map((p) => ({
    name: p.name,
    nameUrdu: PRAYER_NAMES_URDU[p.name] || p.name,
    time: formatTime(p.time),
    timestamp: p.time.toISOString(),
  }));
}

export async function GET() {
  try {
    const sunni = calculatePrayerTimes('sunni');
    const jafari = calculatePrayerTimes('jafari');

    const dateStr = new Date().toLocaleDateString('ur-PK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const hijriDate = getHijriDate(new Date());

    return NextResponse.json({
      sunni: {
        prayerTimes: sunni,
        method: 'Karachi',
        label: 'احناف',
      },
      jafari: {
        prayerTimes: jafari,
        method: 'Tehran',
        label: 'جعفریہ',
      },
      date: dateStr,
      hijriDate,
      city: CITY,
      country: COUNTRY,
    });
  } catch {
    return NextResponse.json(
      {
        sunni: { prayerTimes: [], method: 'Karachi', label: 'احناف' },
        jafari: { prayerTimes: [], method: 'Tehran', label: 'جعفریہ' },
        error: 'Prayer times unavailable',
      },
      { status: 200 }
    );
  }
}
