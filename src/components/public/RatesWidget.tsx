import { getRates } from '@/lib/rates';
import { toUrduNumber } from '@/lib/urdu';

export default async function RatesWidget() {
  let rates;
  try {
    rates = await getRates();
  } catch {
    return null;
  }

  if (!rates.usd) return null;

  const items = [
    { label: 'USD', value: rates.usd },
    { label: 'GBP', value: rates.gbp },
    { label: 'EUR', value: rates.eur },
    { label: 'SAR', value: rates.sar },
    { label: 'AED', value: rates.aed },
  ];

  return (
    <div className="space-y-2">
      {items.map(({ label, value }) => (
        <div key={label} className="flex justify-between items-center text-sm">
          <span className="text-gray-500">{label}</span>
          <span className="font-semibold" dir="ltr">{toUrduNumber(value)}</span>
        </div>
      ))}
      {rates.gold24k && (
        <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 mt-2">
          <span className="text-yellow-600 font-medium">سونے کی قیمت (24K)</span>
          <span className="font-semibold" dir="ltr">{toUrduNumber(rates.gold24k)}</span>
        </div>
      )}
      <p className="text-xs text-gray-400 text-center pt-2">
        قیمتیں فی {rates.gold24k ? 'تولہ /' : ''}روپے
      </p>
    </div>
  );
}
