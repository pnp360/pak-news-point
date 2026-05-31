export function getUrduDate(date: Date): string {
  const urduDays = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
  const urduMonths = [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
  ];

  const day = urduDays[date.getDay()];
  const month = urduMonths[date.getMonth()];
  const dateNum = toUrduNumber(date.getDate());
  const year = toUrduNumber(date.getFullYear());

  return `${day}، ${dateNum} ${month} ${year}`;
}

export function toUrduNumber(num: number): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .split('')
    .map((d) => urduDigits[parseInt(d)])
    .join('');
}

export function getHijriDate(): string {
  const date = new Date();
  const hijriYear = Math.floor((date.getFullYear() - 622) * (365.25 / 354.367));
  const hijriMonth = Math.floor(((date.getFullYear() - 622) * 12 + date.getMonth()) % 12) + 1;
  const hijriDay = Math.floor((date.getDate() * 354.367) / 365.25) % 30;

  const urduMonths = [
    'محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانی',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ',
  ];

  return `${toUrduNumber(hijriDay || 1)} ${urduMonths[hijriMonth - 1] || 'محرم'} ${toUrduNumber(hijriYear)}`;
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'ابھی';
  if (diffMins < 60) return `${toUrduNumber(diffMins)} منٹ پہلے`;
  if (diffHours < 24) return `${toUrduNumber(diffHours)} گھنٹے پہلے`;
  if (diffDays < 7) return `${toUrduNumber(diffDays)} دن پہلے`;

  return getUrduDate(date);
}
