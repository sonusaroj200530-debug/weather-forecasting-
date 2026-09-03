import React from 'react';
import { HourlyForecastItem } from '../types';
import { formatTemp } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { Clock, Droplets } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  tempUnit: 'C' | 'F';
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, tempUnit }) => {
  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          24-Hour Timeline
        </h3>
        <span className="text-[11px] text-slate-500">Hourly Telemetry</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {hourly.map((item, idx) => {
          const dateObj = new Date(item.time);
          const hourLabel = idx === 0 
            ? 'Now' 
            : dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });

          const isCurrentHour = idx === 0;

          return (
            <div
              key={item.time}
              className={`flex-shrink-0 flex flex-col items-center justify-between p-3 rounded-xl min-w-[76px] transition-colors ${
                isCurrentHour
                  ? 'bg-blue-600/20 border border-blue-500/40'
                  : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold text-slate-400 mb-2">
                {hourLabel}
              </span>

              <div className="my-1">
                <WeatherIcon code={item.weatherCode} size={22} />
              </div>

              <span className="text-sm font-bold text-white mt-1">
                {formatTemp(item.temperature, tempUnit)}
              </span>

              <div className="flex items-center gap-0.5 text-[11px] text-blue-400 mt-2">
                <Droplets className="w-3 h-3" />
                <span>{item.precipProb}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
