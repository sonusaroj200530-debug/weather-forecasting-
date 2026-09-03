import React from 'react';
import { AirQualityData } from '../types';
import { getAqiStatus } from '../utils/weatherCodes';
import { Wind, ShieldCheck, AlertCircle } from 'lucide-react';

interface AirQualityCardProps {
  airQuality: AirQualityData;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  if (!airQuality) return null;

  const status = getAqiStatus(airQuality.usAqi);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Wind className="w-3.5 h-3.5 text-teal-400" />
          Air Quality Index (AQI)
        </h3>
        <span className="text-[11px] text-slate-500">EPA Standard</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {airQuality.usAqi}
            </span>
            <span className="text-xs text-slate-400">US AQI</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {airQuality.advice}
          </p>
        </div>
      </div>

      {/* Pollutant levels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">PM2.5 Fine</span>
          <span className="font-semibold text-white">{airQuality.pm2_5.toFixed(1)} µg/m³</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">PM10 Coarse</span>
          <span className="font-semibold text-white">{airQuality.pm10.toFixed(1)} µg/m³</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">Ozone (O₃)</span>
          <span className="font-semibold text-white">{airQuality.ozone.toFixed(1)} µg/m³</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">Nitrogen (NO₂)</span>
          <span className="font-semibold text-white">{airQuality.no2.toFixed(1)} µg/m³</span>
        </div>
      </div>
    </div>
  );
};
