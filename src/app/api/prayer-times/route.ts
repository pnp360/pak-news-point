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

function toUrduNumber(num: number): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().split('').map((d) => urduDigits[parseInt(d)]).join('');
}

function getHijriDate(): string {
  try {
    const date = new Date();
    const hijriYear = Math.floor((date.getFullYear() - 622) * (365.25 / 354.367));
    const hijriMonth = Math.floor(((date.getFullYear() - 622) * 12 + date.getMonth()) % 12) + 1;
    const hijriDay = Math.floor((date.getDate() * 354.367) / 365.25) % 30;
    const urduMonths = [
      'محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانی',
      'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ',
    ];
    return `${toUrduNumber(hijriDay || 1)} ${urduMonths[hijriMonth - 1] || 'محرم'} ${toUrduNumber(hijriYear)} ہجری`;
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

    const urduMonths = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
    const now = new Date();
    const dateStr = `${now.getDate()} ${urduMonths[now.getMonth()]} ${now.getFullYear()}`;
    const hijriDate = getHijriDate();

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
