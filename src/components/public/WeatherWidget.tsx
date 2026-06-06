'use client';

import { useEffect, useRef, useState } from 'react';

interface CityWeather {
  city: string;
  temp_c: string;
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

interface WeatherResponse {
  cities: CityWeather[];
  forecast: ForecastDay[];
  allCities: boolean;
  error?: string;
}

const PAKISTAN_CITIES_LIST = [
  'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Quetta',
  'Gilgit', 'Muzaffarabad', 'Multan', 'Faisalabad',
  'Rawalpindi', 'Hyderabad', 'Sukkur',
];

const WEATHER_CONDITIONS_URDU: Record<string, string> = {
  Clear: 'صاف', Sunny: 'دھوپ',
  'Partly cloudy': 'جزوی طور پر ابر آلود', Cloudy: 'ابر آلود',
  Overcast: 'برفانی', Mist: 'دھند', Fog: 'دھند',
  Rain: 'بارش', 'Light rain': 'ہلکی بارش',
  'Heavy rain': 'تیز بارش', Drizzle: 'بوندا باندی',
  Thunderstorm: 'طوفان', Snow: 'برف باری', Haze: 'گرد آلود',
};

const getWeatherIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes('clear') || c.includes('sunny')) return '☀️';
  if (c.includes('cloud') || c.includes('overcast')) return '☁️';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) return '🌧️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '🌫️';
  return '🌤';
};

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [singleCityData, setSingleCityData] = useState<{ weather: CityWeather; forecast: ForecastDay[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('/api/weather')
      .then((r) => r.json())
      .then((res: WeatherResponse) => {
        if (res.cities?.length) setData(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCity) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const count = data?.cities?.length || 1;
        return (prev + 1) % count;
      });
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedCity, data]);

  const filteredCities = searchQuery
    ? PAKISTAN_CITIES_LIST.filter((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  function selectCity(city: string) {
    setSearchQuery('');
    setShowDropdown(false);
    setSelectedCity(city);
    setSingleCityData(null);
    fetch(`/api/weather?city=${encodeURIComponent(city)}&days=3`)
      .then((r) => r.json())
      .then((res: WeatherResponse) => {
        if (res.cities?.[0]) {
          setSingleCityData({ weather: res.cities[0], forecast: res.forecast });
        }
      })
      .catch(() => {});
  }

  function showAllCities() {
    setSelectedCity(null);
    setSingleCityData(null);
    setCurrentIndex(0);
  }

  if (loading) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-8 w-20 mx-auto bg-gray-200 rounded mb-2" />
        <div className="h-4 w-32 mx-auto bg-gray-200 rounded" />
      </div>
    );
  }

  if (!data?.cities?.length) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">🌤</div>
        <p className="text-gray-600">موسم کی معلومات جلد آرہی ہیں</p>
      </div>
    );
  }

  // Single city detailed view
  if (selectedCity && singleCityData) {
    const w = singleCityData.weather;
    const conditionUrdu = WEATHER_CONDITIONS_URDU[w.condition] || w.condition;
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-800">{w.city}</h4>
          <button
            onClick={showAllCities}
            className="text-xs text-blue-600 hover:underline"
          >
            تمام شہر
          </button>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-4xl">{getWeatherIcon(w.condition)}</span>
          <span className="text-3xl font-bold text-gray-800">{w.temp_c}°C</span>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-2">{conditionUrdu}</p>
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-3">
          <span>💧 {w.humidity}% نمی</span>
          <span>🌬️ {w.wind_speed} کلومیٹر/گھنٹہ</span>
          <span className="col-span-2">🌡️ محسوس {w.feels_like}°C</span>
        </div>

        {singleCityData.forecast.length > 0 && (
          <div className="border-t border-blue-200 pt-2">
            <p className="text-xs font-bold text-gray-700 mb-1.5">اگلے دنوں کی پیش گوئی</p>
            <div className="flex gap-1.5 overflow-x-auto">
              {singleCityData.forecast.map((day, i) => (
                <div key={i} className="flex-1 min-w-[60px] bg-white/60 rounded-lg p-1.5 text-center">
                  <p className="text-[10px] text-gray-500">{day.date}</p>
                  <span className="text-base">{getWeatherIcon(day.condition)}</span>
                  <p className="text-[10px] font-bold">{day.temp_max_c}° / {day.temp_min_c}°</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Rotating all-cities view
  const current = data.cities[currentIndex];
  if (!current) return null;
  const conditionUrdu = WEATHER_CONDITIONS_URDU[current.condition] || current.condition;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
      {/* City search */}
      <div ref={searchRef} className="relative mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder="شہر تلاش کریں..."
          className="weather-input-field w-full px-3 py-1.5 text-xs rounded-lg bg-white/70 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ direction: 'rtl' }}
        />
        {showDropdown && filteredCities.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-blue-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
            {filteredCities.map((city) => (
              <button
                key={city}
                onClick={() => selectCity(city)}
                className="block w-full text-right px-3 py-1.5 text-xs hover:bg-blue-50"
              >
                {city}
              </button>
            ))}
          </div>
        )}
        {showDropdown && searchQuery && filteredCities.length === 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-blue-200 rounded-lg shadow-lg">
            <p className="px-3 py-1.5 text-xs text-gray-400">کوئی شہر نہیں ملا</p>
          </div>
        )}
      </div>

      {/* Rotating weather card */}
      <div className="relative h-28 overflow-hidden">
        <div
          key={current.city}
          className="absolute inset-x-0 bg-white/60 rounded-lg p-3 transition-all duration-500 animate-slideDown"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-gray-800">{current.city}</span>
            <span className="text-xs text-gray-500">
              {currentIndex + 1} / {data.cities.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl">{getWeatherIcon(current.condition)}</span>
            <span className="text-2xl font-bold text-gray-800">{current.temp_c}°C</span>
          </div>
          <p className="text-sm font-medium text-gray-700">{conditionUrdu}</p>
          <div className="flex gap-3 text-xs text-gray-600 mt-1">
            <span>💧 {current.humidity}%</span>
            <span>🌬️ {current.wind_speed} کلومیٹر/گھنٹہ</span>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1 mt-2">
        {data.cities.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIndex ? 'bg-blue-700 w-3' : 'bg-blue-300 hover:bg-blue-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
