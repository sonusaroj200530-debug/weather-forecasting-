import React, { useState } from 'react';
import { WeatherAlert } from '../types';
import { AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';

interface AlertBannerProps {
  alerts: WeatherAlert[];
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts }) => {
  const [expandedId, setExpandedId] = useState<string | null>(alerts[0]?.id || null);

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        Climate Alerts & Advisories
      </h3>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isExpanded = expandedId === alert.id;
          const isEmergency = alert.severity === 'emergency';
          const isWarning = alert.severity === 'warning';
          const isWatch = alert.severity === 'watch';

          const cardClass = isEmergency
            ? 'bg-rose-900/20 border border-rose-500/40 text-rose-200'
            : isWarning
            ? 'bg-amber-900/20 border border-amber-500/40 text-amber-200'
            : isWatch
            ? 'bg-orange-900/20 border border-orange-500/30 text-orange-200'
            : 'bg-slate-800/50 border border-slate-700 text-slate-200';

          const headerColor = isEmergency
            ? 'text-rose-400'
            : isWarning
            ? 'text-amber-400'
            : isWatch
            ? 'text-orange-400'
            : 'text-blue-400';

          return (
            <div
              key={alert.id}
              id={alert.id}
              className={`rounded-xl p-4 transition-all duration-200 ${cardClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-1.5 rounded-lg bg-black/20 shrink-0 mt-0.5">
                    {isEmergency || isWarning ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${headerColor}`}>
                      {alert.title} • {alert.severity}
                    </p>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                  aria-label={isExpanded ? 'Collapse alert' : 'Expand alert'}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2">
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <span className="font-semibold text-emerald-400 block mb-1 uppercase tracking-wider text-[10px]">
                      Recommended Precaution:
                    </span>
                    <span className="text-slate-200 leading-relaxed">{alert.instruction}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: {new Date(alert.expires).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>Source: {alert.source}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
