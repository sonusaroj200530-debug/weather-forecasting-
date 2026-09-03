import React from 'react';
import { WeatherData } from '../types';
import { formatTemp, interpretWeatherCode } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import {
  Wind,
  Droplets,
  Compass,
  Gauge,
  SunMedium,
  CloudRain,
  Cloud,
  MapPin,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  tempUnit: 'C' | 'F';
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  tempUnit,
  onRefresh,
  isLoading = false,
}) => {
  const current = weather.current;
  const interp = interpretWeatherCode(current.weatherCode, current.isDay);

  const getUVStatus = (uv: number = 0) => {
    if (uv <= 2) return { label: 'Low', color: 'text-emerald-400' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-400' };
    if (uv <= 10) return { label: 'Very High', color: 'text-rose-400' };
    return { label: 'Extreme', color: 'text-purple-400 font-bold' };
  };

  const uvStatus = getUVStatus(current.uvIndex);

  return (
    <div className="space-y-4">
      {/* Sleek Interface Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Current Focus
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-medium text-slate-300">
              {weather.city}{weather.country ? `, ${weather.country}` : ''}
            </span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh live weather"
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700/60 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Sleek Gradient Hero Card */}
      <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg relative overflow-hidden text-white">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-bold tracking-tight">
                  {formatTemp(current.temperature, tempUnit)}
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  Feels like {formatTemp(current.apparentTemperature, tempUnit)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-base text-blue-100 font-semibold">
                  {current.weatherDescription}
                </p>
                {weather.daily[0] && (
                  <span className="text-xs text-blue-200">
                    (H: {formatTemp(weather.daily[0].tempMax, tempUnit)} / L: {formatTemp(weather.daily[0].tempMin, tempUnit)})
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm shadow-inner">
              <WeatherIcon code={current.weatherCode} isDay={current.isDay} size={48} />
            </div>
          </div>

          {/* Core Metrics Row with border-t border-white/20 pt-4 */}
          <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-3 border-t border-white/20 pt-4">
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider">Humidity</p>
              <p className="text-sm md:text-base font-semibold text-white">{current.humidity}%</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider">Wind</p>
              <p className="text-sm md:text-base font-semibold text-white">{Math.round(current.windSpeed)} km/h</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider">UV Index</p>
              <p className="text-sm md:text-base font-semibold text-amber-300">{uvStatus.label} ({current.uvIndex ?? 0})</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider">Barometer</p>
              <p className="text-sm md:text-base font-semibold text-white">{Math.round(current.pressure)} hPa</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider">Cloud Cover</p>
              <p className="text-sm md:text-base font-semibold text-white">{current.cloudCover}%</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-semibold tracking-wider">Precipitation</p>
              <p className="text-sm md:text-base font-semibold text-cyan-200">{current.precipitation.toFixed(1)} mm</p>
            </div>
          </div>
        </div>

        {/* Ambient Blur Orb */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
};
