import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind
} from 'lucide-react';
import { interpretWeatherCode } from '../utils/weatherCodes';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = 'w-6 h-6',
  size,
}) => {
  const info = interpretWeatherCode(code, isDay);

  switch (info.iconName) {
    case 'Sun':
      return <Sun size={size} className={`text-amber-400 ${className}`} />;
    case 'Moon':
      return <Moon size={size} className={`text-indigo-300 ${className}`} />;
    case 'CloudSun':
      return <CloudSun size={size} className={`text-amber-300 ${className}`} />;
    case 'CloudMoon':
      return <CloudMoon size={size} className={`text-indigo-300 ${className}`} />;
    case 'Cloud':
      return <Cloud size={size} className={`text-slate-300 ${className}`} />;
    case 'CloudFog':
      return <CloudFog size={size} className={`text-zinc-300 ${className}`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle size={size} className={`text-teal-300 ${className}`} />;
    case 'CloudRain':
      return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
    case 'CloudSnow':
      return <CloudSnow size={size} className={`text-indigo-200 ${className}`} />;
    case 'CloudLightning':
      return <CloudLightning size={size} className={`text-yellow-400 ${className}`} />;
    case 'Wind':
      return <Wind size={size} className={`text-cyan-300 ${className}`} />;
    default:
      return <Cloud size={size} className={`text-slate-300 ${className}`} />;
  }
};
