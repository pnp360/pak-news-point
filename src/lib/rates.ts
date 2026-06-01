const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/PKR';

interface RatesData {
  usd: number;
  gbp: number;
  eur: number;
  sar: number;
  aed: number;
  gold24k: number | null;
  fetchedAt: number;
}

let cached: RatesData | null = null;
let lastFetch = 0;
const CACHE_TTL = 30 * 60 * 1000;

export async function getRates(): Promise<RatesData> {
  if (cached && Date.now() - lastFetch < CACHE_TTL) return cached;

  try {
    const res = await fetch(EXCHANGE_API, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const rates = data.rates;

    cached = {
      usd: rates.USD ? parseFloat((1 / rates.USD).toFixed(2)) : 0,
      gbp: rates.GBP ? parseFloat((1 / rates.GBP).toFixed(2)) : 0,
      eur: rates.EUR ? parseFloat((1 / rates.EUR).toFixed(2)) : 0,
      sar: rates.SAR ? parseFloat((1 / rates.SAR).toFixed(2)) : 0,
      aed: rates.AED ? parseFloat((1 / rates.AED).toFixed(2)) : 0,
      gold24k: null,
      fetchedAt: Date.now(),
    };
    lastFetch = Date.now();

    try {
      const goldRes = await fetch('https://api.metals.live/v1/spot/gold', {
        signal: AbortSignal.timeout(5000),
      });
      const goldData = await goldRes.json();
      if (goldData?.gold) {
        const usdPerOz = goldData.gold;
        const pkrPerOz = usdPerOz * (cached.usd || 278);
        const pkrPerTola = parseFloat((pkrPerOz / 2.6667).toFixed(0));
        cached.gold24k = pkrPerTola;
      }
    } catch {}

    return cached;
  } catch {
    if (cached) return cached;
    return {
      usd: 0, gbp: 0, eur: 0, sar: 0, aed: 0, gold24k: null, fetchedAt: Date.now(),
    };
  }
}
