import React from 'react';
import { ClimateInsight } from '../types';
import { Globe, TrendingUp, Compass, AlertOctagon, Info } from 'lucide-react';

interface ClimateSectionProps {
  climate?: ClimateInsight;
}

export const ClimateSection: React.FC<ClimateSectionProps> = ({ climate }) => {
  if (!climate) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          Climate Profile & Historical Trends
        </h3>
        <span className="text-[11px] text-slate-500">{climate.climateZone}</span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Köppen Classification & Norms
          </div>
          <p className="text-slate-200 text-xs leading-relaxed">
            {climate.annualProfile}
          </p>
        </div>

        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            Multi-Decadal Warming & Precipitation Trend
          </div>
          <p className="text-slate-200 text-xs leading-relaxed">
            {climate.historicTrend}
          </p>
        </div>

        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
            <AlertOctagon className="w-3.5 h-3.5" />
            Extreme Meteorological Anomalies
          </div>
          <p className="text-slate-200 text-xs leading-relaxed">
            {climate.extremeEventsNote}
          </p>
        </div>

        {/* Dashed disclaimer box inspired by Sleek Interface */}
        <div className="p-3 bg-slate-800/20 border border-dashed border-slate-700 rounded-xl text-center">
          <p className="text-xs text-slate-500 italic">
            Historical climate records verified against ERA5 reanalysis and WMO standard climatological baselines.
          </p>
        </div>
      </div>
    </div>
  );
};
