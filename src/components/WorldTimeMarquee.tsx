import { useState, useEffect } from 'react';

interface CityTime {
  name: string;
  timezone: string;
  flag: string;
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

const WorldTimeMarquee = () => {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [gradientStops, setGradientStops] = useState<string>('');

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      const stops: string[] = [];
      
      cities.forEach((city, index) => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        newTimes[city.name] = formatter.format(now);
        
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
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Get sky color based on hour (0-23)
  const getSkyColor = (hour: number): string => {
    // Pre-dawn (4-6): deep purple transitioning to pink
    if (hour >= 4 && hour < 6) {
      const progress = (hour - 4) / 2;
      return `hsla(${280 - progress * 40}, ${50 + progress * 30}%, ${20 + progress * 25}%, 0.35)`;
    }
    // Sunrise (6-8): pink/orange
    if (hour >= 6 && hour < 8) {
      const progress = (hour - 6) / 2;
      return `hsla(${30 + progress * 15}, ${80 - progress * 10}%, ${55 + progress * 15}%, 0.3)`;
    }
    // Morning (8-11): warm light blue/yellow
    if (hour >= 8 && hour < 11) {
      const progress = (hour - 8) / 3;
      return `hsla(${45 - progress * 5}, ${70 - progress * 20}%, ${70 + progress * 10}%, 0.25)`;
    }
    // Midday (11-14): bright sky blue
    if (hour >= 11 && hour < 14) {
      return `hsla(200, 60%, 75%, 0.2)`;
    }
    // Afternoon (14-17): warm golden
    if (hour >= 14 && hour < 17) {
      const progress = (hour - 14) / 3;
      return `hsla(${45 - progress * 10}, ${60 + progress * 20}%, ${70 - progress * 10}%, 0.25)`;
    }
    // Sunset (17-19): orange/red
    if (hour >= 17 && hour < 19) {
      const progress = (hour - 17) / 2;
      return `hsla(${30 - progress * 20}, ${80 + progress * 10}%, ${50 - progress * 15}%, 0.35)`;
    }
    // Dusk (19-21): purple/blue
    if (hour >= 19 && hour < 21) {
      const progress = (hour - 19) / 2;
      return `hsla(${260 + progress * 20}, ${50 - progress * 10}%, ${30 - progress * 10}%, 0.4)`;
    }
    // Night (21-4): deep navy/dark blue
    const nightHour = hour >= 21 ? hour - 21 : hour + 3;
    const progress = nightHour / 7;
    return `hsla(${230 + progress * 10}, ${40 + progress * 10}%, ${12 + progress * 5}%, 0.45)`;
  };

  // Generate city items with individual backgrounds
  const generateCityItem = (city: CityTime, index: number, keyPrefix: string) => {
    const hour = getHourInTimezone(city.timezone);
    const isDay = isDaylight(hour);
    const bgColor = getSkyColor(hour);
    
    return (
      <span 
        key={`${keyPrefix}-${city.name}`} 
        className="inline-flex items-center gap-2 px-6 py-1"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-xl">{city.flag}</span>
        <span className={`font-medium ${isDay ? 'text-slate-800' : 'text-white'}`}>
          {city.name}
        </span>
        <span className={`font-mono ${isDay ? 'text-amber-800' : 'text-blue-200'}`}>
          {times[city.name] || '--:--'}
        </span>
      </span>
    );
  };

  return (
    <div className="w-full overflow-hidden backdrop-blur-md border-y border-border/20 mt-[120px]">
      <div className="animate-marquee whitespace-nowrap inline-flex">
        {cities.map((city, index) => generateCityItem(city, index, 'first'))}
        {cities.map((city, index) => generateCityItem(city, index, 'second'))}
      </div>
    </div>
  );
};

export default WorldTimeMarquee;
