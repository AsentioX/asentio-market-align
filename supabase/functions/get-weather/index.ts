import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  'Vancouver': { lat: 49.2827, lon: -123.1207 },
  'San Francisco': { lat: 37.7749, lon: -122.4194 },
  'Denver': { lat: 39.7392, lon: -104.9903 },
  'Mexico City': { lat: 19.4326, lon: -99.1332 },
  'Chicago': { lat: 41.8781, lon: -87.6298 },
  'Lima': { lat: -12.0464, lon: -77.0428 },
  'New York City': { lat: 40.7128, lon: -74.0060 },
  'Toronto': { lat: 43.6532, lon: -79.3832 },
  'Rio de Janeiro': { lat: -22.9068, lon: -43.1729 },
  'London': { lat: 51.5074, lon: -0.1278 },
  'Dublin': { lat: 53.3498, lon: -6.2603 },
  'Lagos': { lat: 6.5244, lon: 3.3792 },
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'Berlin': { lat: 52.5200, lon: 13.4050 },
  'Rome': { lat: 41.9028, lon: 12.4964 },
  'Johannesburg': { lat: -26.2041, lon: 28.0473 },
  'Cairo': { lat: 30.0444, lon: 31.2357 },
  'Istanbul': { lat: 41.0082, lon: 28.9784 },
  'Moscow': { lat: 55.7558, lon: 37.6173 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Bangkok': { lat: 13.7563, lon: 100.5018 },
  'Singapore': { lat: 1.3521, lon: 103.8198 },
  'Hong Kong': { lat: 22.3193, lon: 114.1694 },
  'Shanghai': { lat: 31.2304, lon: 121.4737 },
  'Seoul': { lat: 37.5665, lon: 126.9780 },
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
};

// Split array into chunks
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cities = Object.keys(cityCoordinates);
    const weatherData: Record<string, { temp: number; code: number; isDay: boolean; windSpeed: number }> = {};

    // Fetch in small batches of 5 to avoid connection resets
    const batches = chunk(cities, 5);

    for (const batch of batches) {
      const lats = batch.map(c => cityCoordinates[c].lat).join(',');
      const lons = batch.map(c => cityCoordinates[c].lon).join(',');

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,is_day,wind_speed_10m`
      );

      if (!response.ok) {
        console.error(`Open-Meteo error for batch: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : [data];

      results.forEach((result: any, index: number) => {
        const city = batch[index];
        if (result?.current) {
          weatherData[city] = {
            temp: Math.round(result.current.temperature_2m),
            code: result.current.weather_code,
            isDay: result.current.is_day === 1,
            windSpeed: result.current.wind_speed_10m,
          };
        }
      });
    }

    return new Response(JSON.stringify({ weather: weatherData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
