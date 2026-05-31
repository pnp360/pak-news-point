import { NextResponse } from 'next/server';

const CITY = 'Islamabad';

export async function GET() {
  try {
    const res = await fetch(
      `http://wttr.in/${CITY}?format=j1`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) {
      return NextResponse.json(
        { city: CITY, temp_c: '--', condition: 'معلومات دستیاب نہیں', humidity: '--', wind_speed: '--', feels_like: '--' },
        { status: 200 }
      );
    }

    const data = await res.json();
    const current = data.current_condition?.[0];

    if (!current) {
      return NextResponse.json({ city: CITY, temp_c: '--', condition: 'معلومات دستیاب نہیں', humidity: '--', wind_speed: '--', feels_like: '--' });
    }

    return NextResponse.json({
      city: CITY,
      temp_c: current.temp_C || '--',
      temp_f: current.temp_F || '--',
      humidity: current.humidity || '--',
      condition: current.weatherDesc?.[0]?.value || 'Clear',
      wind_speed: current.windspeedKmph || '--',
      feels_like: current.FeelsLikeC || '--',
      icon: current.weatherIconUrl?.[0]?.value || '',
    });
  } catch {
    return NextResponse.json(
      { city: CITY, temp_c: '--', condition: 'معلومات دستیاب نہیں', humidity: '--', wind_speed: '--', feels_like: '--' },
      { status: 200 }
    );
  }
}
