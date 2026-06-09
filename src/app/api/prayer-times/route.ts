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

const HIJRI_MONTHS_URDU: Record<string, string> = {
  'محرم': 'محرم', 'صفر': 'صفر', 'ربیع الاول': 'ربیع الاول', 'ربیع الثانی': 'ربیع الثانی',
  'جمادی الاول': 'جمادی الاول', 'جمادی الثانی': 'جمادی الثانی', 'رجب': 'رجب',
  'شعبان': 'شعبان', 'رمضان': 'رمضان', 'شوال': 'شوال', 'ذو القعدہ': 'ذو القعدہ',
  'ذو الحجہ': 'ذو الحجہ',
};

function getHijriDate(date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('ar-SA-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Karachi',
    }).formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const urduMonth = HIJRI_MONTHS_URDU[month] || month;
    return `${urduMonth} ${day} ${year} ہجری`;
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
  const now = new Date();
  const date = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));

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
      timeZone: 'Asia/Karachi',
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
