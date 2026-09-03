export interface WeatherInterpretation {
  label: string;
  iconName: 'Sun' | 'Moon' | 'CloudSun' | 'CloudMoon' | 'Cloud' | 'CloudFog' | 'CloudDrizzle' | 'CloudRain' | 'CloudSnow' | 'CloudLightning' | 'Wind';
  bgGradient: string;
  badgeColor: string;
}

export function interpretWeatherCode(code: number, isDay: boolean = true): WeatherInterpretation {
  switch (code) {
    case 0:
      return {
        label: 'Clear Sky',
        iconName: isDay ? 'Sun' : 'Moon',
        bgGradient: isDay 
          ? 'from-amber-500/20 via-sky-500/10 to-blue-600/10' 
          : 'from-indigo-950 via-slate-900 to-slate-950',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    case 1:
      return {
        label: 'Mainly Clear',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        bgGradient: 'from-amber-400/15 via-sky-500/10 to-slate-900/10',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        bgGradient: 'from-sky-600/15 via-slate-600/15 to-slate-900/10',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
      };
    case 3:
      return {
        label: 'Overcast',
        iconName: 'Cloud',
        bgGradient: 'from-slate-600/20 via-zinc-700/15 to-slate-900/10',
        badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
      };
    case 45:
    case 48:
      return {
        label: 'Foggy / Hazy',
        iconName: 'CloudFog',
        bgGradient: 'from-zinc-500/20 via-slate-600/15 to-slate-900/10',
        badgeColor: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Light Drizzle',
        iconName: 'CloudDrizzle',
        bgGradient: 'from-teal-600/20 via-cyan-700/15 to-slate-900/10',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
      };
    case 61:
    case 63:
    case 65:
      return {
        label: code === 61 ? 'Slight Rain' : code === 63 ? 'Moderate Rain' : 'Heavy Rain',
        iconName: 'CloudRain',
        bgGradient: 'from-blue-600/25 via-indigo-700/20 to-slate-900/10',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: 'Snowfall',
        iconName: 'CloudSnow',
        bgGradient: 'from-indigo-300/20 via-sky-400/15 to-slate-900/10',
        badgeColor: 'bg-indigo-300/20 text-indigo-200 border-indigo-300/30'
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        iconName: 'CloudRain',
        bgGradient: 'from-blue-600/25 via-cyan-800/20 to-slate-900/10',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        iconName: 'CloudSnow',
        bgGradient: 'from-cyan-300/20 via-blue-500/15 to-slate-900/10',
        badgeColor: 'bg-cyan-300/20 text-cyan-200 border-cyan-300/30'
      };
    case 95:
    case 96:
    case 99:
      return {
        label: code === 95 ? 'Thunderstorm' : 'Severe Thunderstorm w/ Hail',
        iconName: 'CloudLightning',
        bgGradient: 'from-amber-600/25 via-rose-700/25 to-slate-950',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      };
    default:
      return {
        label: 'Variable Conditions',
        iconName: 'Cloud',
        bgGradient: 'from-slate-700/20 via-slate-800/15 to-slate-950',
        badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
      };
  }
}

export function formatTemp(celsius: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    const f = Math.round((celsius * 9) / 5 + 32);
    return `${f}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function getAqiStatus(aqi: number): { label: string; color: string; desc: string } {
  if (aqi <= 50) {
    return { label: 'Good', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', desc: 'Air quality is satisfactory; air pollution poses little or no risk.' };
  }
  if (aqi <= 100) {
    return { label: 'Moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', desc: 'Acceptable quality, but sensitive people may experience minor irritation.' };
  }
  if (aqi <= 150) {
    return { label: 'Unhealthy for Sensitive', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', desc: 'Sensitive groups should reduce strenuous outdoor activities.' };
  }
  if (aqi <= 200) {
    return { label: 'Unhealthy', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', desc: 'Everyone may begin to experience health effects; limit prolonged outdoor exposure.' };
  }
  if (aqi <= 300) {
    return { label: 'Very Unhealthy', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', desc: 'Health alert: increased risk of health effects for all individuals.' };
  }
  return { label: 'Hazardous', color: 'text-red-500 bg-red-500/20 border-red-500/40', desc: 'Emergency health warnings. The entire population is likely to be affected.' };
}
