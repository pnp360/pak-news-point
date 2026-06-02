'use client';

import { useEffect, useState } from 'react';

interface RatesData {
  usd: number;
  gbp: number;
  eur: number;
  sar: number;
  aed: number;
  gold24k: number | null;
}

export default function RatesWidget() {
  const [rates, setRates] = useState<RatesData | null>(null);

  useEffect(() => {
    fetch('/api/rates')
      .then(r => r.json())
      .then(setRates)
      .catch(() => setRates(null));
  }, []);

  if (!rates?.usd) {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 w-10 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

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
          <span className="font-semibold" dir="ltr">{value.toLocaleString('en-US')}</span>
        </div>
      ))}
      {rates.gold24k && (
        <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 mt-2">
          <span className="text-yellow-600 font-medium">سونے کی قیمت (24K)</span>
          <span className="font-semibold" dir="ltr">{rates.gold24k.toLocaleString('en-US')}</span>
        </div>
      )}
      <p className="text-xs text-gray-400 text-center pt-2">
        قیمتیں فی {rates.gold24k ? 'تولہ /' : ''}روپے
      </p>
    </div>
  );
}
