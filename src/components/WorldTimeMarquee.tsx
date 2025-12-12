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

const WorldTimeMarquee = () => {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      cities.forEach((city) => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        newTimes[city.name] = formatter.format(now);
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const marqueeContent = cities.map((city) => (
    <span key={city.name} className="inline-flex items-center gap-2 mx-8">
      <span className="text-xl">{city.flag}</span>
      <span className="font-medium text-foreground/80">{city.name}</span>
      <span className="text-primary font-mono">{times[city.name] || '--:--'}</span>
    </span>
  ));

  return (
    <div className="w-full overflow-hidden bg-background/50 backdrop-blur-sm border-y border-border/30 py-3">
      <div className="animate-marquee whitespace-nowrap inline-flex">
        {marqueeContent}
        {marqueeContent}
      </div>
    </div>
  );
};

export default WorldTimeMarquee;
