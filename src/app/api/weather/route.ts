import { NextRequest, NextResponse } from 'next/server';

const PAKISTAN_CITIES = [
  'Islamabad',
  'Lahore',
  'Karachi',
  'Peshawar',
  'Quetta',
  'Gilgit',
  'Muzaffarabad',
  'Multan',
  'Faisalabad',
  'Rawalpindi',
  'Hyderabad',
  'Sukkur',
];

interface CityWeather {
  city: string;
  temp_c: string;
  temp_f: string;
  condition: string;
  humidity: string;
  wind_speed: string;
  feels_like: string;
  icon: string;
}

interface ForecastDay {
  date: string;
  temp_max_c: string;
  temp_min_c: string;
  condition: string;
  icon: string;
}

async function fetchCityWeather(city: string): Promise<CityWeather | null> {
  try {
    const res = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current_condition?.[0];
    if (!current) return null;
    return {
      city,
      temp_c: current.temp_C || '--',
      temp_f: current.temp_F || '--',
      condition: current.weatherDesc?.[0]?.value || 'Clear',
      humidity: current.humidity || '--',
      wind_speed: current.windspeedKmph || '--',
      feels_like: current.FeelsLikeC || '--',
      icon: current.weatherIconUrl?.[0]?.value || '',
    };
  } catch {
    return null;
  }
}

function extractForecast(data: { weather?: { date: string; maxtempC: string; mintempC: string; hourly: { weatherDesc: { value: string }[]; weatherIconUrl: { value: string }[] }[] }[] }, days: number): ForecastDay[] {
  if (!data?.weather) return [];
  return data.weather.slice(0, days).map((day) => ({
    date: day.date || '',
    temp_max_c: day.maxtempC || '--',
    temp_min_c: day.mintempC || '--',
    condition: day.hourly?.[0]?.weatherDesc?.[0]?.value || '--',
    icon: day.hourly?.[0]?.weatherIconUrl?.[0]?.value || '',
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cityParam = searchParams.get('city')?.trim();
  const daysParam = parseInt(searchParams.get('days') || '3', 10);
  const days = Math.min(Math.max(daysParam, 1), 7);

  try {
    if (cityParam) {
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(cityParam)}?format=j1`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) {
        return NextResponse.json({ cities: [], forecast: [], allCities: false, error: 'City not found' }, { status: 200 });
      }
      const data = await res.json();
      const current = data.current_condition?.[0];
      if (!current) {
        return NextResponse.json({ cities: [], forecast: [], allCities: false, error: 'No data' }, { status: 200 });
      }
      const cityWeather: CityWeather = {
        city: cityParam,
        temp_c: current.temp_C || '--',
        temp_f: current.temp_F || '--',
        condition: current.weatherDesc?.[0]?.value || 'Clear',
        humidity: current.humidity || '--',
        wind_speed: current.windspeedKmph || '--',
        feels_like: current.FeelsLikeC || '--',
        icon: current.weatherIconUrl?.[0]?.value || '',
      };
      const forecast = extractForecast(data, days);
      return NextResponse.json({ cities: [cityWeather], forecast, allCities: false });
    }

    const results = await Promise.allSettled(PAKISTAN_CITIES.map(fetchCityWeather));
    const cities = results
      .filter((r) => r.status === 'fulfilled' && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<CityWeather>).value);

    return NextResponse.json({ cities, forecast: [], allCities: true });
  } catch {
    return NextResponse.json(
      { cities: [], forecast: [], allCities: false, error: 'Weather unavailable' },
      { status: 200 }
    );
  }
}
