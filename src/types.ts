export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  pressure: number;
  cloudCover: number;
  precipitation: number;
  uvIndex?: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  precipProb: number;
  weatherCode: number;
  windSpeed: number;
}

export interface DailyForecastItem {
  date: string;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  precipSum: number;
  weatherCode: number;
  weatherDescription: string;
  uvMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQualityData {
  usAqi: number;
  europeanAqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  no2: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  advice: string;
}

export interface WeatherAlert {
  id: string;
  severity: 'advisory' | 'watch' | 'warning' | 'emergency';
  title: string;
  description: string;
  instruction: string;
  source: string;
  expires: string;
  active: boolean;
}

export interface ClimateInsight {
  location: string;
  climateZone: string;
  annualProfile: string;
  historicTrend: string;
  seasonalHighlights: string;
  extremeEventsNote: string;
}

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: WeatherCurrent;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
  alerts: WeatherAlert[];
  climate?: ClimateInsight;
  fetchedAt: string;
}

export interface CitySearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  countryCode?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  weatherData?: WeatherData;
  alerts?: WeatherAlert[];
  climateInsight?: ClimateInsight;
  suggestedFollowUps?: string[];
  isError?: boolean;
}
