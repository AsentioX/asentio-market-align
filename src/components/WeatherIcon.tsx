import { memo } from 'react';

interface WeatherIconProps {
  code: number;
  isDay: boolean;
  className?: string;
}

// SVG weather icons based on WMO weather codes
const WeatherIcon = memo(({ code, isDay, className = 'w-5 h-5' }: WeatherIconProps) => {
  const iconColor = 'currentColor';
  
  // Clear sky (0)
  if (code === 0) {
    if (isDay) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" fill={iconColor} stroke="none" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    }
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={iconColor} fillOpacity="0.2" />
      </svg>
    );
  }
  
  // Partly cloudy (1-3)
  if (code <= 3) {
    if (isDay) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="3" fill={iconColor} stroke="none" opacity="0.8" />
          <path d="M8 3v1M8 12v1M3 8h1M12 8h1M4.5 4.5l.7.7M11.5 4.5l-.7.7" strokeWidth="1.5" opacity="0.8" />
          <path d="M18 18H8a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.27 3.46A3 3 0 0 1 18 18z" fill={iconColor} fillOpacity="0.15" />
        </svg>
      );
    }
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 4a5 5 0 0 0-4.5 2.8" opacity="0.6" />
        <circle cx="10" cy="6" r="2" fill={iconColor} fillOpacity="0.3" />
        <path d="M18 18H8a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.27 3.46A3 3 0 0 1 18 18z" fill={iconColor} fillOpacity="0.15" />
      </svg>
    );
  }
  
  // Fog (45, 48)
  if (code === 45 || code === 48) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round">
        <path d="M4 10h16M4 14h16M6 18h12" opacity="0.7" />
        <path d="M8 6h8" opacity="0.4" />
      </svg>
    );
  }
  
  // Drizzle (51, 53, 55)
  if (code >= 51 && code <= 55) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 13H8a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.27 3.46A3 3 0 0 1 16 13z" fill={iconColor} fillOpacity="0.15" />
        <path d="M8 17v1M12 16v2M16 17v1" strokeWidth="2" opacity="0.6" />
      </svg>
    );
  }
  
  // Freezing drizzle/rain (56, 57, 66, 67)
  if ((code >= 56 && code <= 57) || (code >= 66 && code <= 67)) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 13H8a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.27 3.46A3 3 0 0 1 16 13z" fill={iconColor} fillOpacity="0.15" />
        <path d="M8 16l1 2M11 17l1 2M14 16l1 2" strokeWidth="1.5" opacity="0.7" />
        <circle cx="10" cy="20" r="0.5" fill={iconColor} opacity="0.5" />
        <circle cx="14" cy="21" r="0.5" fill={iconColor} opacity="0.5" />
      </svg>
    );
  }
  
  // Rain (61, 63, 65, 80, 81, 82)
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    const isHeavy = code === 65 || code === 82;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 13H8a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.27 3.46A3 3 0 0 1 16 13z" fill={iconColor} fillOpacity="0.2" />
        <path d="M8 15l-1 4M12 15l-1 4M16 15l-1 4" strokeWidth={isHeavy ? 2 : 1.5} opacity="0.8" />
        {isHeavy && <path d="M10 16l-1 3M14 16l-1 3" strokeWidth="1.5" opacity="0.6" />}
      </svg>
    );
  }
  
  // Snow (71, 73, 75, 77, 85, 86)
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 13H8a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.27 3.46A3 3 0 0 1 16 13z" fill={iconColor} fillOpacity="0.15" />
        <path d="M8 17l2 2m-2 0l2-2M12 16v4m-1.5-2h3M16 17l2 2m-2 0l2-2" strokeWidth="1.5" opacity="0.7" />
      </svg>
    );
  }
  
  // Thunderstorm (95, 96, 99)
  if (code >= 95) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 11H8a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.27 3.46A3 3 0 0 1 16 11z" fill={iconColor} fillOpacity="0.25" />
        <path d="M13 11l-2 5h3l-2 5" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  
  // Default: cloudy
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 18H8a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.27 3.46A3 3 0 0 1 18 18z" fill={iconColor} fillOpacity="0.15" />
    </svg>
  );
});

WeatherIcon.displayName = 'WeatherIcon';

// Fallback icon when no weather data
export const FallbackWeatherIcon = memo(({ isDay, className = 'w-5 h-5' }: { isDay: boolean; className?: string }) => {
  const iconColor = 'currentColor';
  
  if (isDay) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" fill={iconColor} stroke="none" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }
  
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={iconColor} fillOpacity="0.2" />
    </svg>
  );
});

FallbackWeatherIcon.displayName = 'FallbackWeatherIcon';

export default WeatherIcon;
