import { WeatherData, WeatherAlert, ClimateInsight, CitySearchResult } from '../src/types.js';

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      admin1: item.admin1 || '',
      countryCode: item.country_code || '',
    }));
  } catch (err) {
    console.error('Error searching cities:', err);
    return [];
  }
}

function getWeatherDescription(code: number): string {
  switch (code) {
    case 0: return 'Clear sky';
    case 1: return 'Mainly clear';
    case 2: return 'Partly cloudy';
    case 3: return 'Overcast';
    case 45: return 'Fog';
    case 48: return 'Depositing rime fog';
    case 51: return 'Light drizzle';
    case 53: return 'Moderate drizzle';
    case 55: return 'Dense drizzle';
    case 61: return 'Slight rain';
    case 63: return 'Moderate rain';
    case 65: return 'Heavy rain';
    case 71: return 'Slight snowfall';
    case 73: return 'Moderate snowfall';
    case 75: return 'Heavy snowfall';
    case 77: return 'Snow grains';
    case 80: return 'Slight rain showers';
    case 81: return 'Moderate rain showers';
    case 82: return 'Violent rain showers';
    case 85: return 'Slight snow showers';
    case 86: return 'Heavy snow showers';
    case 95: return 'Thunderstorm';
    case 96: return 'Thunderstorm with slight hail';
    case 99: return 'Thunderstorm with heavy hail';
    default: return 'Fair / Variable';
  }
}

function deriveAlerts(
  current: any,
  daily: any,
  aqi: number,
  cityName: string
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  // Severe Thunderstorm Alert
  if ([95, 96, 99].includes(current.weather_code)) {
    alerts.push({
      id: `alert-storm-${Date.now()}`,
      severity: current.weather_code === 99 ? 'emergency' : 'warning',
      title: current.weather_code === 99 ? 'Severe Thunderstorm & Hail Emergency' : 'Severe Thunderstorm Warning',
      description: `Active convective storm system detected over ${cityName} producing intense lightning, potential hail, and hazardous wind gusts.`,
      instruction: 'Seek shelter in a sturdy interior room away from glass windows immediately. Disconnect sensitive electronics and avoid flooded roadways.',
      source: 'Atmospheric Radar & WMO Alert Network',
      expires: next24h,
      active: true,
    });
  }

  // Gale / High Wind Alert
  const maxWind = Math.max(current.wind_speed_10m || 0, ...(daily.wind_speed_10m_max || []).slice(0, 2));
  if (maxWind >= 50) {
    alerts.push({
      id: `alert-wind-${Date.now()}`,
      severity: maxWind >= 70 ? 'warning' : 'advisory',
      title: maxWind >= 70 ? 'High Wind Warning' : 'Wind Advisory',
      description: `Sustained high velocity winds up to ${Math.round(maxWind)} km/h impacting the ${cityName} area.`,
      instruction: 'Secure loose outdoor furniture, patio items, and trash bins. Motorists with high-profile vehicles should exercise extreme caution on bridges and highways.',
      source: 'Global Meteorological Surface Observations',
      expires: next24h,
      active: true,
    });
  }

  // Extreme Heat Advisory
  const maxTemp = Math.max(current.temperature_2m || 0, ...(daily.temperature_2m_max || []).slice(0, 2));
  if (maxTemp >= 35) {
    alerts.push({
      id: `alert-heat-${Date.now()}`,
      severity: maxTemp >= 40 ? 'warning' : 'advisory',
      title: maxTemp >= 40 ? 'Excessive Heat Warning' : 'Heat Advisory',
      description: `Dangerous ambient temperatures peaking near ${Math.round(maxTemp)}°C with elevated heat index values in ${cityName}.`,
      instruction: 'Stay hydrated with water and electrolytes, limit strenuous midday outdoor exposure between 11 AM and 5 PM, and check on elderly neighbors and pets.',
      source: 'Regional Biometeorological Alert System',
      expires: next24h,
      active: true,
    });
  }

  // Freeze / Frost Warning
  const minTemp = Math.min(current.temperature_2m || 0, ...(daily.temperature_2m_min || []).slice(0, 2));
  if (minTemp <= 0) {
    alerts.push({
      id: `alert-freeze-${Date.now()}`,
      severity: minTemp <= -5 ? 'warning' : 'advisory',
      title: minTemp <= -5 ? 'Hard Freeze Warning' : 'Freeze Advisory',
      description: `Sub-freezing temperatures dropping to ${Math.round(minTemp)}°C expected over the next 24 to 48 hours in ${cityName}.`,
      instruction: 'Wrap exposed outdoor water pipes, protect tender cold-sensitive vegetation, and ensure companion animals have warm shelter.',
      source: 'Cold Weather Safety Watch',
      expires: next24h,
      active: true,
    });
  }

  // Torrential Precipitation Alert
  const maxPrecip = Math.max(...(daily.precipitation_sum || []).slice(0, 2));
  if (maxPrecip >= 25 || current.precipitation >= 10) {
    alerts.push({
      id: `alert-rain-${Date.now()}`,
      severity: maxPrecip >= 45 ? 'warning' : 'watch',
      title: maxPrecip >= 45 ? 'Flash Flood Warning' : 'Heavy Rainfall & Flood Watch',
      description: `Elevated precipitation totals (${Math.round(maxPrecip)}mm) creating localized urban pooling and elevated creek levels in ${cityName}.`,
      instruction: 'Never drive through standing water ("Turn Around, Don\'t Drown"). Clear storm drains of debris around property.',
      source: 'Hydrological Monitoring Center',
      expires: next24h,
      active: true,
    });
  }

  // Extreme UV Alert
  const maxUV = Math.max(...(daily.uv_index_max || []).slice(0, 2));
  if (maxUV >= 8) {
    alerts.push({
      id: `alert-uv-${Date.now()}`,
      severity: 'advisory',
      title: maxUV >= 10 ? 'Very High UV Radiation Alert' : 'High UV Radiation Advisory',
      description: `Peak solar irradiance reaching UV Index ${Math.round(maxUV)}. Unprotected skin can burn in under 15 minutes.`,
      instruction: 'Apply broad-spectrum SPF 30+ sunscreen, wear UV400 protective sunglasses, and seek shade during solar noon.',
      source: 'Global Solar Radiation Index',
      expires: next24h,
      active: true,
    });
  }

  // Air Quality Alert
  if (aqi >= 150) {
    alerts.push({
      id: `alert-aqi-${Date.now()}`,
      severity: aqi >= 200 ? 'warning' : 'advisory',
      title: aqi >= 200 ? 'Very Unhealthy Air Quality Alert' : 'Air Quality Action Advisory',
      description: `Elevated particulate matter (US AQI ${aqi}) detected over ${cityName}.`,
      instruction: 'Individuals with asthma, respiratory illness, children, and elderly should remain indoors. Run HEPA filtration if available.',
      source: 'Environmental Quality Network',
      expires: next24h,
      active: true,
    });
  }

  return alerts;
}

function estimateClimateZone(lat: number, lon: number): ClimateInsight {
  const absLat = Math.abs(lat);
  let zone = 'Temperate Continental (Dfb)';
  let annualProfile = 'Four distinct seasons with warm summers and cold, snowy winters.';
  let historicTrend = 'Average decadal warming of +0.31°C per decade since 1980; shift in earlier spring snowmelt.';
  let seasonalHighlights = 'Transitional shoulder seasons with frequent frontal passages and active storm tracks.';
  let extremeEvents = 'Increased frequency of short-duration atmospheric rivers and heat domes.';

  if (absLat < 15) {
    zone = 'Tropical Wet / Equatorial (Af/Am)';
    annualProfile = 'Consistently high year-round temperatures (26–32°C) with high relative humidity and monsoonal rainfall peaks.';
    historicTrend = 'Rising sea surface temperatures intensifying tropical convection; +0.22°C per decade trend.';
    seasonalHighlights = 'Alternating wet monsoon and dry inter-monsoon periods with intense convective afternoon downpours.';
    extremeEvents = 'Heightened cyclone precipitation intensity and prolonged marine heatwaves.';
  } else if (absLat < 28) {
    if (Math.abs(lon) < 50 && lat > 15 && lat < 35) {
      zone = 'Subtropical Arid / Desert (BWh)';
      annualProfile = 'Extremely high summer temperatures exceeding 43°C with minimal annual rainfall (<100mm).';
      historicTrend = 'Expansion of drylands and increased frequency of severe convective dust storms (Haboobs).';
      seasonalHighlights = 'Mild, pleasant winter months giving way to scorching spring and summer days with wide diurnal range.';
      extremeEvents = 'Multi-year drought risks coupled with flash-flooding during rare cutoff low-pressure storms.';
    } else {
      zone = 'Humid Subtropical (Cfa)';
      annualProfile = 'Hot, humid summers with regular convective showers and mild, cool winters.';
      historicTrend = '+0.28°C per decade warming; notable increase in heavy rain days (>50mm/day).';
      seasonalHighlights = 'Prolonged growing seasons with vulnerable coastal exposure to tropical weather systems.';
      extremeEvents = 'Higher frequency of compound hot-humid extreme events.';
    }
  } else if (absLat < 45) {
    zone = 'Mediterranean / Warm Temperate (Csa/Csb)';
    annualProfile = 'Warm to hot, dry summers and mild, wet winter storm cycles influenced by polar jet oscillations.';
    historicTrend = 'Drier summer soil moisture conditions and lengthened wildfire risk windows.';
    seasonalHighlights = 'Winter brings the vast majority of annual hydration; spring features rapid thermal warming.';
    extremeEvents = 'Prolonged dry spells followed by atmospheric river deluge.';
  } else if (absLat < 60) {
    zone = 'Marine West Coast / Temperate Oceanic (Cfb)';
    annualProfile = 'Cool summers and mild winters with frequent cloudiness, maritime breezes, and steady precipitation throughout the year.';
    historicTrend = 'Milder winter minimum temperatures and increasing extreme summer heat spikes.';
    seasonalHighlights = 'Persistent marine air layer mitigating temperature extremes.';
    extremeEvents = 'Strong extratropical windstorms and anomalous summer high-pressure blocks.';
  } else {
    zone = 'Subarctic / Polar Tundra (Dfc/ET)';
    annualProfile = 'Brief, cool summers and long, severe sub-zero winters with deep permafrost layer.';
    historicTrend = 'Rapid Arctic amplification: warming at more than double the global rate (+0.65°C/decade).';
    seasonalHighlights = 'Dramatic fluctuations in day length from midnight sun to polar night; rapid spring breakup.';
    extremeEvents = 'Permafrost thaw, tundra fires, and anomalous winter warm-air intrusions.';
  }

  return {
    location: `Coordinates: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    climateZone: zone,
    annualProfile,
    historicTrend,
    seasonalHighlights,
    extremeEventsNote: extremeEvents,
  };
}

export async function fetchWeatherData(
  lat: number,
  lon: number,
  cityName: string = 'Current Location',
  countryName: string = ''
): Promise<WeatherData> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`;

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl),
    fetch(aqiUrl)
  ]);

  if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
    throw new Error('Failed to fetch meteorological data from Open-Meteo');
  }

  const weatherJson = await weatherRes.value.json();
  let aqiJson: any = null;
  if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
    try {
      aqiJson = await aqiRes.value.json();
    } catch {
      // ignore
    }
  }

  const currentRaw = weatherJson.current || {};
  const hourlyRaw = weatherJson.hourly || {};
  const dailyRaw = weatherJson.daily || {};
  const aqiCurrent = aqiJson?.current || {};

  const usAqi = Math.round(aqiCurrent.us_aqi || 38);
  const euroAqi = Math.round(aqiCurrent.european_aqi || 22);

  let aqiCategory: any = 'Good';
  let aqiAdvice = 'Air quality is ideal for outdoor activities.';
  if (usAqi > 200) {
    aqiCategory = 'Very Unhealthy';
    aqiAdvice = 'Wear a respirator mask outdoors and run air filters.';
  } else if (usAqi > 150) {
    aqiCategory = 'Unhealthy';
    aqiAdvice = 'Limit prolonged or heavy outdoor exertion.';
  } else if (usAqi > 100) {
    aqiCategory = 'Unhealthy for Sensitive';
    aqiAdvice = 'Sensitive groups should take regular breaks and watch for symptoms.';
  } else if (usAqi > 50) {
    aqiCategory = 'Moderate';
    aqiAdvice = 'Acceptable air quality for most people.';
  }

  // Parse Hourly (next 24 hours)
  const hourlyList = [];
  const hourlyTimes = hourlyRaw.time || [];
  const nowHour = new Date().toISOString().slice(0, 13);
  let startIdx = hourlyTimes.findIndex((t: string) => t.startsWith(nowHour));
  if (startIdx < 0) startIdx = 0;

  for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i++) {
    hourlyList.push({
      time: hourlyTimes[i],
      temperature: hourlyRaw.temperature_2m?.[i] ?? 0,
      precipProb: hourlyRaw.precipitation_probability?.[i] ?? 0,
      weatherCode: hourlyRaw.weather_code?.[i] ?? 0,
      windSpeed: hourlyRaw.wind_speed_10m?.[i] ?? 0,
    });
  }

  // Parse Daily (7 days)
  const dailyList = [];
  const dailyTimes = dailyRaw.time || [];
  for (let i = 0; i < dailyTimes.length; i++) {
    dailyList.push({
      date: dailyTimes[i],
      tempMax: dailyRaw.temperature_2m_max?.[i] ?? 0,
      tempMin: dailyRaw.temperature_2m_min?.[i] ?? 0,
      precipProb: dailyRaw.precipitation_probability_max?.[i] ?? 0,
      precipSum: dailyRaw.precipitation_sum?.[i] ?? 0,
      weatherCode: dailyRaw.weather_code?.[i] ?? 0,
      weatherDescription: getWeatherDescription(dailyRaw.weather_code?.[i] ?? 0),
      uvMax: dailyRaw.uv_index_max?.[i] ?? 0,
      sunrise: dailyRaw.sunrise?.[i] || '',
      sunset: dailyRaw.sunset?.[i] || '',
    });
  }

  const alerts = deriveAlerts(currentRaw, dailyRaw, usAqi, cityName);
  const climate = estimateClimateZone(lat, lon);
  climate.location = `${cityName}${countryName ? ', ' + countryName : ''}`;

  return {
    city: cityName,
    country: countryName,
    latitude: lat,
    longitude: lon,
    timezone: weatherJson.timezone || 'UTC',
    current: {
      temperature: currentRaw.temperature_2m ?? 20,
      apparentTemperature: currentRaw.apparent_temperature ?? currentRaw.temperature_2m ?? 20,
      humidity: currentRaw.relative_humidity_2m ?? 50,
      windSpeed: currentRaw.wind_speed_10m ?? 0,
      windDirection: currentRaw.wind_direction_10m ?? 0,
      weatherCode: currentRaw.weather_code ?? 0,
      weatherDescription: getWeatherDescription(currentRaw.weather_code ?? 0),
      isDay: currentRaw.is_day === 1,
      pressure: currentRaw.pressure_msl ?? 1013,
      cloudCover: currentRaw.cloud_cover ?? 0,
      precipitation: currentRaw.precipitation ?? 0,
      uvIndex: dailyList[0]?.uvMax ?? 5,
    },
    hourly: hourlyList,
    daily: dailyList,
    airQuality: {
      usAqi,
      europeanAqi: euroAqi,
      pm2_5: aqiCurrent.pm2_5 ?? 12,
      pm10: aqiCurrent.pm10 ?? 20,
      ozone: aqiCurrent.ozone ?? 45,
      no2: aqiCurrent.nitrogen_dioxide ?? 15,
      category: aqiCategory,
      advice: aqiAdvice,
    },
    alerts,
    climate,
    fetchedAt: new Date().toISOString(),
  };
}
