'use client';

import { useEffect, useState } from 'react';

interface WeatherData {
  city: string;
  temp_c: string;
  condition: string;
  humidity: string;
  wind_speed: string;
  feels_like: string;
}

const WEATHER_CONDITIONS_URDU: Record<string, string> = {
  Clear: 'صاف',
  Sunny: 'دھوپ',
  'Partly cloudy': 'جزوی طور پر ابر آلود',
  Cloudy: 'ابر آلود',
  Overcast: 'برفانی',
  Mist: 'دھند',
  Fog: 'دھند',
  Rain: 'بارش',
  'Light rain': 'ہلکی بارش',
  'Heavy rain': 'تیز بارش',
  Drizzle: 'بوندا باندی',
  Thunderstorm: 'طوفان',
  Snow: 'برف باری',
  Haze: 'گرد آلود',
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(true);
        } else {
          setWeather(data);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-8 w-20 mx-auto bg-gray-200 rounded mb-2" />
        <div className="h-4 w-32 mx-auto bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">🌤</div>
        <p className="text-gray-600">موسم کی معلومات جلد آرہی ہیں</p>
      </div>
    );
  }

  const conditionUrdu = WEATHER_CONDITIONS_URDU[weather.condition] || weather.condition;

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) return '☀️';
    if (c.includes('cloud') || c.includes('overcast')) return '☁️';
    if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) return '🌧️';
    if (c.includes('snow')) return '❄️';
    if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '🌫️';
    return '🌤';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl">{getWeatherIcon(weather.condition)}</span>
        <span className="text-3xl font-bold text-gray-800">{weather.temp_c}°C</span>
      </div>
      <p className="text-lg font-medium text-gray-700 mb-2">{conditionUrdu}</p>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span>💧</span>
          <span>{weather.humidity}% نمی</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🌬️</span>
          <span>{weather.wind_speed} کلومیٹر/گھنٹہ</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {weather.city} · محسوس {weather.feels_like}°C
      </p>
    </div>
  );
}
