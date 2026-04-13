import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  code: number;
  isDay: boolean;
  windSpeed: number;
  humidity: number;
  city: string;
  lat: number;
  lon: number;
  sunrise: string;
  sunset: string;
  highTemp: number;
  lowTemp: number;
}

const weatherDescriptions: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Light snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
  99: 'Severe thunderstorm',
};

export const getWeatherDescription = (code: number) =>
  weatherDescriptions[code] || 'Unknown';

export const getWeatherEmoji = (code: number, isDay: boolean) => {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '🌤️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  return '⛈️';
};

export const getWeatherGradient = (code: number, isDay: boolean) => {
  if (!isDay) return 'from-indigo-900 via-slate-900 to-gray-900';
  if (code === 0) return 'from-sky-400 via-blue-500 to-blue-600';
  if (code <= 2) return 'from-sky-400 via-blue-400 to-slate-500';
  if (code === 3) return 'from-slate-400 via-slate-500 to-gray-600';
  if (code <= 48) return 'from-gray-400 via-slate-500 to-gray-600';
  if (code <= 65) return 'from-slate-500 via-blue-600 to-gray-700';
  if (code <= 77) return 'from-slate-300 via-blue-200 to-gray-400';
  if (code <= 82) return 'from-slate-600 via-blue-700 to-gray-800';
  return 'from-slate-700 via-purple-800 to-gray-900';
};

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`
    );
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Your Location'
    );
  } catch {
    return 'Your Location';
  }
}

export const useLocalWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const [weatherRes, city] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m,relative_humidity_2m&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`
            ).then((r) => r.json()),
            reverseGeocode(lat, lon),
          ]);

          if (weatherRes?.current) {
            setWeather({
              temp: Math.round(weatherRes.current.temperature_2m),
              code: weatherRes.current.weather_code,
              isDay: weatherRes.current.is_day === 1,
              windSpeed: weatherRes.current.wind_speed_10m,
              city,
              lat,
              lon,
              sunrise: weatherRes.daily?.sunrise?.[0] || '',
              sunset: weatherRes.daily?.sunset?.[0] || '',
            });
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { weather, loading, error };
};
