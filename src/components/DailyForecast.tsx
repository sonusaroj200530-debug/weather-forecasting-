import React from 'react';
import { DailyForecastItem } from '../types';
import { formatTemp } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { Calendar, Droplets, Sunrise, Sunset } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  tempUnit: 'C' | 'F';
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, tempUnit }) => {
  if (!daily || daily.length === 0) return null;

  // Find min and max for relative temperature bar visualization
  const allMins = daily.map(d => d.tempMin);
  const allMaxs = daily.map(d => d.tempMax);
  const minTemp = Math.min(...allMins);
  const maxTemp = Math.max(...allMaxs);
  const range = maxTemp - minTemp || 1;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          7-Day Weather Outlook
        </h3>
        <span className="text-[11px] text-slate-500">High / Low range</span>
      </div>

      <div className="space-y-2.5">
        {daily.map((day, idx) => {
          const dateObj = new Date(day.date + 'T00:00:00');
          const dayName = idx === 0
            ? 'Today'
            : idx === 1
            ? 'Tomorrow'
            : dateObj.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });

          const leftPercent = Math.max(0, Math.min(100, ((day.tempMin - minTemp) / range) * 100));
          const widthPercent = Math.max(10, Math.min(100, ((day.tempMax - day.tempMin) / range) * 100));

          return (
            <div
              key={day.date}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 transition-colors"
            >
              {/* Day Name */}
              <div className="w-24 text-xs font-medium text-slate-200 truncate">
                {dayName}
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex items-center gap-2 w-32 shrink-0">
                <WeatherIcon code={day.weatherCode} size={18} />
                <span className="text-xs text-slate-400 truncate">
                  {day.weatherDescription}
                </span>
              </div>

              {/* Precipitation */}
              <div className="w-14 flex items-center gap-1 text-xs text-blue-400 shrink-0">
                {day.precipProb > 0 ? (
                  <>
                    <Droplets className="w-3 h-3" />
                    <span>{day.precipProb}%</span>
                  </>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </div>

              {/* Temperature Bar */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-slate-400 w-10 text-right font-medium">
                  {formatTemp(day.tempMin, tempUnit)}
                </span>

                <div className="flex-1 h-1.5 bg-slate-800 rounded-full relative overflow-hidden hidden sm:block">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs text-white w-10 font-bold">
                  {formatTemp(day.tempMax, tempUnit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
