import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import WeatherIcon, { FallbackWeatherIcon } from './WeatherIcon';
import marqueeTexture from '@/assets/marquee-texture.png';

interface CityTime {
  name: string;
  timezone: string;
  flag: string;
}

interface WeatherData {
  temp: number;
  code: number;
  isDay: boolean;
  windSpeed: number;
}

// Cities sorted by UTC offset (west to east)
const cities: CityTime[] = [
  { name: 'Vancouver', timezone: 'America/Vancouver', flag: '🇨🇦' },
  { name: 'San Francisco', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { name: 'Denver', timezone: 'America/Denver', flag: '🇺🇸' },
  { name: 'Mexico City', timezone: 'America/Mexico_City', flag: '🇲🇽' },
  { name: 'Chicago', timezone: 'America/Chicago', flag: '🇺🇸' },
  { name: 'Lima', timezone: 'America/Lima', flag: '🇵🇪' },
  { name: 'New York City', timezone: 'America/New_York', flag: '🇺🇸' },
  { name: 'Toronto', timezone: 'America/Toronto', flag: '🇨🇦' },
  { name: 'Rio de Janeiro', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { name: 'London', timezone: 'Europe/London', flag: '🇬🇧' },
  { name: 'Dublin', timezone: 'Europe/Dublin', flag: '🇮🇪' },
  { name: 'Lagos', timezone: 'Africa/Lagos', flag: '🇳🇬' },
  { name: 'Paris', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { name: 'Berlin', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { name: 'Rome', timezone: 'Europe/Rome', flag: '🇮🇹' },
  { name: 'Johannesburg', timezone: 'Africa/Johannesburg', flag: '🇿🇦' },
  { name: 'Cairo', timezone: 'Africa/Cairo', flag: '🇪🇬' },
  { name: 'Istanbul', timezone: 'Europe/Istanbul', flag: '🇹🇷' },
  { name: 'Moscow', timezone: 'Europe/Moscow', flag: '🇷🇺' },
  { name: 'Mumbai', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { name: 'Bangkok', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
  { name: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { name: 'Shanghai', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { name: 'Seoul', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
];

// Helper to get hour in a timezone
const getHourInTimezone = (timezone: string): number => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(now), 10);
};

// Calculate if it's day or night (6am-6pm = day)
const isDaylight = (hour: number): boolean => hour >= 6 && hour < 18;

interface CityData {
  time: string;
  date: string;
  dayOfWeek: string;
}

const WorldTimeMarquee = () => {
  const [cityData, setCityData] = useState<Record<string, CityData>>({});
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});
  const [gradientStops, setGradientStops] = useState<string>('');
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [timeFormat, setTimeFormat] = useState<'12H' | '24H'>('12H');
  const [lockedCities, setLockedCities] = useState<string[]>([]);

  // Convert Celsius to Fahrenheit
  const toFahrenheit = (celsius: number) => Math.round((celsius * 9/5) + 32);
  const getTemp = (celsius: number) => unit === 'C' ? celsius : toFahrenheit(celsius);

  // Toggle city lock
  const toggleCityLock = (cityName: string) => {
    setLockedCities(prev => {
      if (prev.includes(cityName)) {
        // Unlock: remove from array
        return prev.filter(name => name !== cityName);
      } else {
        // Lock: add to array
        return [...prev, cityName];
      }
    });
  };

  // Fetch weather data from edge function
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-weather');
        if (error) {
          console.error('Error fetching weather:', error);
          return;
        }
        if (data?.weather) {
          setWeatherData(data.weather);
        }
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      }
    };

    fetchWeather();
    // Refresh weather every 10 minutes
    const weatherInterval = setInterval(fetchWeather, 600000);
    return () => clearInterval(weatherInterval);
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      const newCityData: Record<string, CityData> = {};
      const stops: string[] = [];
      
      cities.forEach((city, index) => {
        const now = new Date();
        
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: timeFormat === '12H',
        });
        
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone,
          day: 'numeric',
        });
        
        const dayFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone,
          weekday: 'short',
        });
        
        newCityData[city.name] = {
          time: timeFormatter.format(now),
          date: dateFormatter.format(now),
          dayOfWeek: dayFormatter.format(now),
        };
        
        // Calculate gradient stop based on daylight
        const hour = getHourInTimezone(city.timezone);
        const isDay = isDaylight(hour);
        const position = (index / (cities.length - 1)) * 50; // 50% for first set
        
        // Day: warm amber/gold, Night: deep blue/purple
        if (isDay) {
          // Calculate intensity based on how close to noon
          const distanceFromNoon = Math.abs(12 - hour);
          const intensity = 1 - (distanceFromNoon / 6);
          stops.push(`hsla(45, 80%, ${55 + intensity * 15}%, 0.4) ${position}%`);
        } else {
          // Calculate intensity based on how close to midnight
          const adjustedHour = hour >= 18 ? hour - 18 : hour + 6;
          const distanceFromMidnight = Math.abs(6 - adjustedHour);
          const intensity = 1 - (distanceFromMidnight / 6);
          stops.push(`hsla(230, 60%, ${15 + intensity * 10}%, 0.6) ${position}%`);
        }
      });
      
      // Duplicate stops for the second half (repeated content)
      const secondHalfStops = cities.map((city, index) => {
        const hour = getHourInTimezone(city.timezone);
        const isDay = isDaylight(hour);
        const position = 50 + (index / (cities.length - 1)) * 50;
        
        if (isDay) {
          const distanceFromNoon = Math.abs(12 - hour);
          const intensity = 1 - (distanceFromNoon / 6);
          return `hsla(45, 80%, ${55 + intensity * 15}%, 0.4) ${position}%`;
        } else {
          const adjustedHour = hour >= 18 ? hour - 18 : hour + 6;
          const distanceFromMidnight = Math.abs(6 - adjustedHour);
          const intensity = 1 - (distanceFromMidnight / 6);
          return `hsla(230, 60%, ${15 + intensity * 10}%, 0.6) ${position}%`;
        }
      });
      
      setGradientStops([...stops, ...secondHalfStops].join(', '));
      setCityData(newCityData);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeFormat]);

  // Get sky color based on hour (0-23) - using sunset palette
  const getSkyColor = (hour: number): string => {
    // Deep night (0-4): Deep blue/navy from top of palette
    if (hour >= 0 && hour < 4) {
      return `hsla(225, 55%, 18%, 0.5)`;
    }
    // Pre-dawn (4-6): Deep purple-blue transitioning to magenta
    if (hour >= 4 && hour < 6) {
      const progress = (hour - 4) / 2;
      return `hsla(${260 - progress * 30}, ${45 + progress * 20}%, ${22 + progress * 15}%, 0.45)`;
    }
    // Sunrise (6-8): Magenta/pink to warm orange
    if (hour >= 6 && hour < 8) {
      const progress = (hour - 6) / 2;
      return `hsla(${330 - progress * 300}, ${70 + progress * 15}%, ${40 + progress * 20}%, 0.4)`;
    }
    // Morning (8-11): Warm amber/orange
    if (hour >= 8 && hour < 11) {
      const progress = (hour - 8) / 3;
      return `hsla(${35 + progress * 10}, ${75 - progress * 15}%, ${55 + progress * 15}%, 0.35)`;
    }
    // Midday (11-14): Light warm amber
    if (hour >= 11 && hour < 14) {
      return `hsla(45, 60%, 70%, 0.3)`;
    }
    // Afternoon (14-17): Golden amber
    if (hour >= 14 && hour < 17) {
      const progress = (hour - 14) / 3;
      return `hsla(${40 - progress * 10}, ${65 + progress * 15}%, ${65 - progress * 10}%, 0.35)`;
    }
    // Sunset (17-19): Deep orange to magenta/pink
    if (hour >= 17 && hour < 19) {
      const progress = (hour - 17) / 2;
      return `hsla(${30 - progress * 330}, ${80 + progress * 5}%, ${50 - progress * 10}%, 0.45)`;
    }
    // Dusk (19-21): Magenta to deep purple
    if (hour >= 19 && hour < 21) {
      const progress = (hour - 19) / 2;
      return `hsla(${300 - progress * 40}, ${50 - progress * 10}%, ${35 - progress * 10}%, 0.5)`;
    }
    // Night (21-24): Deep purple to navy blue
    const nightProgress = (hour - 21) / 3;
    return `hsla(${260 - nightProgress * 35}, ${45 - nightProgress * 5}%, ${22 - nightProgress * 4}%, 0.5)`;
  };

  // Generate city item for locked section
  const generateLockedCityItem = (city: CityTime) => {
    const hour = getHourInTimezone(city.timezone);
    const isDay = isDaylight(hour);
    const currentColor = getSkyColor(hour);
    const data = cityData[city.name];
    const weather = weatherData[city.name];
    
    return (
      <span 
        key={`locked-${city.name}`} 
        className="inline-flex flex-col items-center px-6 py-2 cursor-pointer hover:opacity-80 transition-opacity relative bg-black"
        onClick={() => toggleCityLock(city.name)}
      >
        {/* Lock indicator */}
        <span className="absolute top-1 right-1 text-xs opacity-60">🔒</span>
        <span className="flex items-center gap-2">
          <span className="text-xl">{city.flag}</span>
          <span className="font-medium text-white">
            {city.name}
          </span>
          <span className="text-blue-200">
            {weather 
              ? <WeatherIcon code={weather.code} isDay={weather.isDay} className="w-5 h-5" />
              : <FallbackWeatherIcon isDay={isDay} className="w-5 h-5" />
            }
          </span>
          {weather && (
            <span className="text-sm font-semibold text-blue-100">
              {getTemp(weather.temp)}°{unit}
            </span>
          )}
        </span>
        <span className="text-sm font-mono text-blue-200">
          {data ? `${data.date}·${data.dayOfWeek}·${data.time}` : '--·--·--:--'}
        </span>
      </span>
    );
  };

  // Generate city items with blended gradient backgrounds
  const generateCityItem = (city: CityTime, index: number, keyPrefix: string, allCities: CityTime[]) => {
    const hour = getHourInTimezone(city.timezone);
    const isDay = isDaylight(hour);
    const currentColor = getSkyColor(hour);
    const isLocked = lockedCities.includes(city.name);
    
    // Get next city's color for gradient blending
    const nextIndex = (index + 1) % allCities.length;
    const nextCity = allCities[nextIndex];
    const nextHour = getHourInTimezone(nextCity.timezone);
    const nextColor = getSkyColor(nextHour);
    
    const data = cityData[city.name];
    const weather = weatherData[city.name];
    
    return (
      <span 
        key={`${keyPrefix}-${city.name}`} 
        className={`relative inline-flex flex-col items-center px-6 py-2 pt-4 cursor-pointer transition-all bg-black ${isLocked ? 'opacity-40' : 'hover:opacity-80'}`}
        onClick={() => toggleCityLock(city.name)}
      >
        {/* Color gradient bar at top */}
        <span 
          className="absolute top-0 left-0 right-0 h-[8px]"
          style={{ 
            background: `linear-gradient(to right, ${currentColor.replace(/[\d.]+\)$/, '1)')} 0%, ${currentColor.replace(/[\d.]+\)$/, '1)')} 40%, ${nextColor.replace(/[\d.]+\)$/, '1)')} 100%)`
          }}
        />
        <span className="flex items-center gap-2 mt-1">
          <span className="text-xl">{city.flag}</span>
          <span className="font-medium text-white">
            {city.name}
          </span>
          <span className="text-blue-200">
            {weather 
              ? <WeatherIcon code={weather.code} isDay={weather.isDay} className="w-5 h-5" />
              : <FallbackWeatherIcon isDay={isDay} className="w-5 h-5" />
            }
          </span>
          {weather && (
            <span className="text-sm font-semibold text-blue-100">
              {getTemp(weather.temp)}°{unit}
            </span>
          )}
        </span>
        <span className="text-sm font-mono text-blue-200">
          {data ? `${data.date}·${data.dayOfWeek}·${data.time}` : '--·--·--:--'}
        </span>
      </span>
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Get locked city objects
  const lockedCityObjects = lockedCities
    .map(name => cities.find(c => c.name === name))
    .filter((c): c is CityTime => c !== undefined);

  return (
    <div className="relative mt-[120px]">
      {/* Settings toggles */}
      <div className="absolute -top-8 right-4 z-10 flex items-center gap-2">
        {/* Time format toggle */}
        <button
          onClick={() => setTimeFormat(f => f === '12H' ? '24H' : '12H')}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <span className={timeFormat === '12H' ? 'text-foreground' : 'text-muted-foreground/50'}>12H</span>
          <span className="text-muted-foreground/30">/</span>
          <span className={timeFormat === '24H' ? 'text-foreground' : 'text-muted-foreground/50'}>24H</span>
        </button>
        
        {/* Temperature unit toggle */}
        <button
          onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <span className={unit === 'C' ? 'text-foreground' : 'text-muted-foreground/50'}>°C</span>
          <span className="text-muted-foreground/30">/</span>
          <span className={unit === 'F' ? 'text-foreground' : 'text-muted-foreground/50'}>°F</span>
        </button>
      </div>
      
      <div className="flex relative overflow-hidden">
        {/* Wave dot texture background */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${marqueeTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat-x',
          }}
        />
        
        {/* Locked cities on the left */}
        {lockedCityObjects.length > 0 && (
          <div className="flex-shrink-0 flex border-r border-border/30 bg-black relative z-0">
            {lockedCityObjects.map(city => generateLockedCityItem(city))}
          </div>
        )}
        
        {/* Scrolling marquee */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-x-auto bg-black border-y border-border/20 cursor-grab active:cursor-grabbing scrollbar-hide relative z-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div 
            ref={contentRef}
            className={`whitespace-nowrap inline-flex ${isDragging ? '' : 'animate-marquee'}`}
          >
            {cities.map((city, index) => generateCityItem(city, index, 'first', cities))}
            {cities.map((city, index) => generateCityItem(city, index, 'second', cities))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldTimeMarquee;
